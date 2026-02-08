import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, ComposedChart, Bar
} from 'recharts';
import { Activity, Heart, Scale, Thermometer, Loader2, AlertCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { appointmentSocketManager as socketManager } from '@/services/socketUtils';

interface AnalyticsData {
    date: string;
    timestamp: number;
    bloodPressure: string;
    systolic: number | null;
    diastolic: number | null;
    heartRate: number | null;
    weight: number | null;
    temperature: number | null;
    oxygenSaturation: number | null;
    glucose: number | null;
    glucoseType: string | null;
    hba1c: number | null;
    peakFlow: number | null;
    ldl: number | null;
    hdl: number | null;
    triglycerides: number | null;
}

interface ManagementGoal {
    targetBP?: string;
    targetGlucose?: string;
    targetWeight?: number;
    targetHbA1c?: number;
}

interface MonitoredCondition {
    condition: string;
    severity: 'mild' | 'moderate' | 'severe' | 'critical';
    managementGoals?: ManagementGoal;
}

interface ChronicDiseaseTrackerProps {
    patientId?: string;
}

const ChronicDiseaseTracker: React.FC<ChronicDiseaseTrackerProps> = ({ patientId }) => {
    const [data, setData] = useState<AnalyticsData[]>([]);
    const [monitoredConditions, setMonitoredConditions] = useState<MonitoredCondition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [clinicalWorkings, setClinicalWorkings] = useState<string[]>([]);
    const [simulationInterval, setSimulationInterval] = useState<NodeJS.Timeout | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        systolic: '',
        diastolic: '',
        heartRate: '',
        weight: '',
        temperature: '',
        oxygenSaturation: '',
        glucose: '',
        glucoseType: 'random-check',
        hba1c: '',
        ldl: '',
        hdl: '',
        triglycerides: '',
        peakFlow: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            let response;

            if (patientId) {
                response = await api.getPatientHealthAnalytics(patientId);
            } else {
                response = await api.getMyHealthAnalytics();
            }

            if (response.success) {
                setData(response.analytics || []);
                setMonitoredConditions(response.patient?.monitoredConditions || []);
            } else {
                setError('Failed to load health analytics');
            }
        } catch (err: any) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load health analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Socket.IO Subscription
        const setupSocket = async () => {
            try {
                const socket = await socketManager.connect();
                const roomPatientId = patientId || (await api.getCurrentUser()).user._id;

                if (roomPatientId) {
                    console.log(`🔌 Joining room: patient-${roomPatientId}`);
                    socket.emit('join-patient-room', roomPatientId);

                    socket.on('vitals-updated', (update: any) => {
                        console.log('📡 Real-time vitals update received:', update);
                        const newVital: AnalyticsData = {
                            date: update.vitals.timestamp,
                            timestamp: new Date(update.vitals.timestamp).getTime(),
                            bloodPressure: update.vitals.bloodPressure,
                            systolic: parseInt(update.vitals.bloodPressure.split('/')[0]) || null,
                            diastolic: parseInt(update.vitals.bloodPressure.split('/')[1]) || null,
                            heartRate: parseInt(update.vitals.heartRate) || null,
                            temperature: parseFloat(update.vitals.temperature) || null,
                            weight: parseFloat(update.vitals.weight) || null,
                            oxygenSaturation: parseInt(update.vitals.oxygenSaturation) || null,
                            glucose: update.vitals.bloodGlucose?.value || null,
                            glucoseType: update.vitals.bloodGlucose?.type || null,
                            hba1c: update.vitals.hba1c || null,
                            peakFlow: update.vitals.peakFlow || null,
                            ldl: update.vitals.cholesterol?.ldl || null,
                            hdl: update.vitals.cholesterol?.hdl || null,
                            triglycerides: update.vitals.cholesterol?.triglycerides || null
                        };

                        setData(prev => {
                            // Only add if not already present (avoid duplicates)
                            const exists = prev.some(v => v.timestamp === newVital.timestamp);
                            if (exists) return prev;
                            const updated = [...prev, newVital];
                            return updated.sort((a, b) => a.timestamp - b.timestamp);
                        });

                        toast.info('Vitals updated in real-time');
                    });
                }
            } catch (err) {
                console.error('Socket connection failed:', err);
            }
        };

        setupSocket();

        return () => {
            socketManager.disconnect();
            if (simulationInterval) clearInterval(simulationInterval as any);
        };
    }, [patientId, simulationInterval]);

    // Simulation Logic
    const toggleSimulation = () => {
        if (isSimulating) {
            if (simulationInterval) clearInterval(simulationInterval as any);
            setSimulationInterval(null);
            setIsSimulating(false);
            toast.success('Simulation stopped');
        } else {
            const interval = setInterval(async () => {
                const lastData = data[data.length - 1];
                const newSystolic = (lastData?.systolic || 120) + (Math.random() > 0.5 ? 2 : -2);
                const newDiastolic = (lastData?.diastolic || 80) + (Math.random() > 0.5 ? 1 : -1);

                const mockPayload = {
                    bloodPressure: `${newSystolic}/${newDiastolic}`,
                    heartRate: (lastData?.heartRate || 72) + (Math.round(Math.random() * 4) - 2),
                    weight: lastData?.weight || 70,
                    temperature: 36.6 + (Math.random() * 0.2),
                    oxygenSaturation: Math.min(100, (lastData?.oxygenSaturation || 98) + (Math.random() > 0.5 ? 1 : -1)),
                    bloodGlucose: { value: (lastData?.glucose || 100) + (Math.round(Math.random() * 10) - 5), type: 'random-check' }
                };

                try {
                    await api.addMyVitalSigns(mockPayload);
                } catch (err) {
                    console.error('Simulation post failed:', err);
                }
            }, 8000);

            setSimulationInterval(interval as any);
            setIsSimulating(true);
            toast.success('Live Tracking Simulation Started');
        }
    };

    // Automated Clinical Workings Engine
    useEffect(() => {
        if (data.length < 2) return;

        const latest = data[data.length - 1];
        const previous = data[data.length - 2];
        const workings: string[] = [];

        // BP Reasoning
        if (latest.systolic && previous.systolic) {
            const diff = latest.systolic - previous.systolic;
            if (Math.abs(diff) > 5) {
                workings.push(`Clinical Observation: Systolic BP ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff)} mmHg recently.`);
            } else {
                workings.push("Clinical Observation: Cardiovascular state remains stable.");
            }
        }

        // Metabolic Reasoning
        if (latest.glucose && previous.glucose) {
            const diff = latest.glucose - previous.glucose;
            if (diff > 20) workings.push("Alert: Significant rise in Blood Glucose detected. Reasoning: Potential post-prandial spike or glycemic instability.");
        }

        // Respiratory Reasoning
        if (latest.oxygenSaturation && latest.oxygenSaturation < 95) {
            workings.push("Caution: Oxygen saturation below 95%. Reasoning: Monitoring required for respiratory distress.");
        }

        setClinicalWorkings(workings);
    }, [data]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const payload = {
                bloodPressure: `${formData.systolic}/${formData.diastolic}`,
                heartRate: Number(formData.heartRate),
                weight: Number(formData.weight),
                temperature: Number(formData.temperature),
                oxygenSaturation: Number(formData.oxygenSaturation),
                bloodGlucose: formData.glucose ? {
                    value: Number(formData.glucose),
                    type: formData.glucoseType
                } : undefined,
                hba1c: formData.hba1c ? Number(formData.hba1c) : undefined,
                peakFlow: formData.peakFlow ? Number(formData.peakFlow) : undefined,
                cholesterol: (formData.ldl || formData.hdl || formData.triglycerides) ? {
                    ldl: Number(formData.ldl),
                    hdl: Number(formData.hdl),
                    triglycerides: Number(formData.triglycerides)
                } : undefined
            };

            const response = await api.addMyVitalSigns(payload);
            if (response.success) {
                toast.success('Vital signs recorded successfully');
                setIsDialogOpen(false);
                setFormData({
                    systolic: '',
                    diastolic: '',
                    heartRate: '',
                    weight: '',
                    temperature: '',
                    oxygenSaturation: '',
                    glucose: '',
                    glucoseType: 'random-check',
                    hba1c: '',
                    ldl: '',
                    hdl: '',
                    triglycerides: '',
                    peakFlow: ''
                });
                fetchData(); // Refresh data
            } else {
                toast.error(response.message || 'Failed to record vital signs');
            }
        } catch (err: any) {
            console.error('Error recording vitals:', err);
            toast.error('Failed to record vital signs');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && data.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-health-teal" />
                <span className="ml-2 text-health-charcoal">Loading health analytics...</span>
            </div>
        );
    }

    if (error && data.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-red-600 bg-red-50 rounded-lg">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border rounded shadow-lg border-health-teal/20">
                    <p className="text-sm font-bold text-health-teal mb-2 border-b pb-1">
                        {format(new Date(label), 'MMM dd, yyyy HH:mm')}
                    </p>
                    <div className="space-y-1">
                        {payload.map((entry: any, index: number) => (
                            <p key={index} className="text-xs flex justify-between gap-4" style={{ color: entry.color }}>
                                <span className="font-medium">{entry.name}:</span>
                                <span>{entry.value} {
                                    entry.name.includes('Rate') ? 'BPM' :
                                        entry.name.includes('Weight') ? 'kg' :
                                            entry.name.includes('Temp') ? '°C' :
                                                entry.name.includes('Glucose') ? 'mg/dL' :
                                                    entry.name.includes('HbA1c') ? '%' :
                                                        entry.name.includes('Peak Flow') ? 'L/min' :
                                                            entry.name.includes('Oxygen') ? '%' : ''
                                }</span>
                            </p>
                        ))}
                        {data.glucoseType && (
                            <p className="text-[10px] text-gray-400 italic">
                                Type: {data.glucoseType}
                            </p>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-health-teal mb-1">Chronic Disease Management</h2>
                    <p className="text-sm text-health-blue-gray">Track vital signs trends and manage chronic conditions</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant={isSimulating ? "destructive" : "outline"}
                        size="sm"
                        onClick={toggleSimulation}
                        className="flex items-center gap-2"
                    >
                        {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                        {isSimulating ? 'Stop Live Tracking' : 'Start Live Tracking'}
                    </Button>
                    {!patientId && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-health-teal hover:bg-health-teal/90 text-white flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Record
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Record Clinical Data</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-health-teal uppercase tracking-wider">Cardiovascular</h4>
                                        <div className="grid grid-cols-2 gap-4 border-l-2 border-red-200 pl-3">
                                            <div className="space-y-1">
                                                <Label htmlFor="systolic" className="text-xs">Systolic BP</Label>
                                                <Input id="systolic" name="systolic" placeholder="120" value={formData.systolic} onChange={handleInputChange} required className="h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="diastolic" className="text-xs">Diastolic BP</Label>
                                                <Input id="diastolic" name="diastolic" placeholder="80" value={formData.diastolic} onChange={handleInputChange} required className="h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="heartRate" className="text-xs">Heart Rate (BPM)</Label>
                                                <Input id="heartRate" name="heartRate" type="number" placeholder="72" value={formData.heartRate} onChange={handleInputChange} required className="h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="oxygenSaturation" className="text-xs">Oxygen (%)</Label>
                                                <Input id="oxygenSaturation" name="oxygenSaturation" type="number" placeholder="98" value={formData.oxygenSaturation} onChange={handleInputChange} required className="h-8" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-health-teal uppercase tracking-wider">Metabolic & Vitals</h4>
                                        <div className="grid grid-cols-2 gap-4 border-l-2 border-orange-200 pl-3">
                                            <div className="space-y-1">
                                                <Label htmlFor="glucose" className="text-xs">Blood Glucose</Label>
                                                <Input id="glucose" name="glucose" type="number" placeholder="100" value={formData.glucose} onChange={handleInputChange} className="h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="hba1c" className="text-xs">HbA1c (%)</Label>
                                                <Input id="hba1c" name="hba1c" type="number" step="0.1" placeholder="5.7" value={formData.hba1c} onChange={handleInputChange} className="h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="weight" className="text-xs">Weight (kg)</Label>
                                                <Input id="weight" name="weight" type="number" step="0.1" placeholder="70.5" value={formData.weight} onChange={handleInputChange} required className="h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="temperature" className="text-xs">Temp (°C)</Label>
                                                <Input id="temperature" name="temperature" type="number" step="0.1" placeholder="36.6" value={formData.temperature} onChange={handleInputChange} required className="h-8" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-health-teal uppercase tracking-wider">Respiratory & Lipids</h4>
                                        <div className="grid grid-cols-2 gap-4 border-l-2 border-green-200 pl-3">
                                            <div className="space-y-1">
                                                <Label htmlFor="peakFlow" className="text-xs">Peak Flow (L/min)</Label>
                                                <Input id="peakFlow" name="peakFlow" type="number" placeholder="450" value={formData.peakFlow} onChange={handleInputChange} className="h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="ldl" className="text-xs">LDL Chol.</Label>
                                                <Input id="ldl" name="ldl" type="number" placeholder="100" value={formData.ldl} onChange={handleInputChange} className="h-8" />
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter className="pt-4">
                                        <Button type="submit" disabled={submitting} className="bg-health-teal hover:bg-health-teal/90 text-white w-full">
                                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Records'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                    <div className="flex gap-2">
                        {monitoredConditions.map((mc, idx) => (
                            <Badge key={idx} variant={idx === 0 ? "default" : "outline"} className={idx === 0 ? "bg-health-warning text-black" : ""}>
                                {mc.condition} ({mc.severity})
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Vitals Data Available</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        {patientId
                            ? "Record vital signs for this patient to see health trends."
                            : "Start tracking your health by adding your first vital signs record using the button above."}
                    </p>
                </div>
            ) : (
                <Tabs defaultValue="bp" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="bp" className="flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Cardiovascular
                        </TabsTrigger>
                        <TabsTrigger value="metabolic" className="flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Metabolic
                        </TabsTrigger>
                        <TabsTrigger value="respiratory" className="flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Respiratory
                        </TabsTrigger>
                        <TabsTrigger value="weight" className="flex items-center gap-2">
                            <Scale className="w-4 h-4" />
                            Weight & Vitals
                        </TabsTrigger>
                        <TabsTrigger value="workings" className="flex items-center gap-2 bg-health-teal/10 text-health-teal font-bold">
                            <Activity className="w-4 h-4" />
                            Clinical Workings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="bp">
                        <Card>
                            <CardHeader>
                                <CardTitle>Blood Pressure Trend</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                                        />
                                        <YAxis domain={[40, 200]} label={{ value: 'mmHg', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="bloodPressure.systolic"
                                            name="Systolic (mmHg)"
                                            stroke="#ef4444"
                                            strokeWidth={2}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="bloodPressure.diastolic"
                                            name="Diastolic (mmHg)"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Heart Rate History</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data}>
                                        <defs>
                                            <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                                        />
                                        <YAxis domain={[40, 160]} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="heartRate"
                                            name="Heart Rate"
                                            stroke="#ec4899"
                                            fill="url(#colorHr)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="metabolic">
                        <Card>
                            <CardHeader>
                                <CardTitle>Blood Glucose & HbA1c Trends</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                                        />
                                        <YAxis yAxisId="left" domain={[60, 400]} label={{ value: 'Glucose (mg/dL)', angle: -90, position: 'insideLeft' }} />
                                        <YAxis yAxisId="right" orientation="right" domain={[4, 15]} label={{ value: 'HbA1c (%)', angle: 90, position: 'insideRight' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="glucose"
                                            name="Glucose"
                                            stroke="#f59e0b"
                                            strokeWidth={3}
                                            dot={{ r: 5 }}
                                        />
                                        <Bar
                                            yAxisId="right"
                                            dataKey="hba1c"
                                            name="HbA1c"
                                            fill="#8b5cf6"
                                            opacity={0.6}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-sm font-medium text-gray-500">LDL Cholesterol</div>
                                    <div className="text-2xl font-bold">{data[data.length - 1]?.ldl || 'N/A'} <span className="text-sm font-normal text-gray-400">mg/dL</span></div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-sm font-medium text-gray-500">HDL Cholesterol</div>
                                    <div className="text-2xl font-bold">{data[data.length - 1]?.hdl || 'N/A'} <span className="text-sm font-normal text-gray-400">mg/dL</span></div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-sm font-medium text-gray-500">Triglycerides</div>
                                    <div className="text-2xl font-bold">{data[data.length - 1]?.triglycerides || 'N/A'} <span className="text-sm font-normal text-gray-400">mg/dL</span></div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="respiratory">
                        <Card>
                            <CardHeader>
                                <CardTitle>Respiratory Health (Peak Flow & SpO2)</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                                        />
                                        <YAxis yAxisId="left" domain={[100, 800]} label={{ value: 'Peak Flow (L/min)', angle: -90, position: 'insideLeft' }} />
                                        <YAxis yAxisId="right" orientation="right" domain={[85, 100]} label={{ value: 'SpO2 (%)', angle: 90, position: 'insideRight' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="peakFlow"
                                            name="Peak Flow"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                        />
                                        <Area
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="oxygenSaturation"
                                            name="Oxygen Sat."
                                            fill="#3b82f6"
                                            stroke="#3b82f6"
                                            opacity={0.2}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="workings">
                        <Card className="border-2 border-health-teal/30">
                            <CardHeader className="bg-health-teal/5">
                                <CardTitle className="text-health-teal flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Continuous Clinical Reasoning Engine
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {clinicalWorkings.length > 0 ? (
                                    <div className="space-y-4">
                                        {clinicalWorkings.map((working, idx) => (
                                            <div key={idx} className="flex gap-3 p-3 bg-health-teal/5 rounded-lg border border-health-teal/10">
                                                <AlertCircle className="w-5 h-5 text-health-teal mt-0.5" />
                                                <p className="text-sm font-medium text-health-charcoal">{working}</p>
                                            </div>
                                        ))}
                                        <div className="mt-6 pt-6 border-t border-dashed">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">System Log: Monitoring Active</p>
                                            <p className="text-[10px] text-gray-400">Continuous tracking is scanning {data.length} data points for anomalies...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-health-blue-gray mx-auto mb-3" />
                                        <p className="text-health-blue-gray">Waiting for more continuous data to begin reasoning...</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="weight">
                        <Card>
                            <CardHeader>
                                <CardTitle>Weight Tracking</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                                        />
                                        <YAxis yAxisId="left" orientation="left" label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar
                                            yAxisId="left"
                                            dataKey="weight"
                                            name="Weight (kg)"
                                            fill="#10b981"
                                            maxBarSize={50}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
};

export default ChronicDiseaseTracker;
