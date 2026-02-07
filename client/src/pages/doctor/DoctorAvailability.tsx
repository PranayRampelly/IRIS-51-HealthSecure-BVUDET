import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, 
  Wifi, WifiOff, Activity, Settings, Save, RefreshCw,
  TrendingUp, Users, CalendarDays, Timer, Coffee,
  Sun, Moon, Zap, Target, Shield, Bell, Star,
  ChevronRight, ChevronLeft, Plus, Minus, RotateCcw
} from 'lucide-react';
import apiService from '@/lib/api';

interface AvailabilityData {
  workingDays: string[];
  startTime: string;
  endTime: string;
  appointmentDuration: number;
  lunchBreakStart: string;
  lunchBreakEnd: string;
}

interface DoctorStatus {
  isWorkingToday: boolean;
  isWithinWorkingHours: boolean;
  isOnline: boolean;
  currentStatus: string;
  workingHours: {
    startTime: string;
    endTime: string;
    workingDays: string[];
  };
  lastUpdated: string;
}

interface WeeklySchedule {
  [key: string]: {
    isWorking: boolean;
    startTime: string;
    endTime: string;
    breaks: Array<{ start: string; end: string; type: string }>;
  };
}

interface WorkingDay {
  day: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breaks: Array<{
    startTime: string;
    endTime: string;
    type: string;
    description: string;
  }>;
}

const DoctorAvailability: React.FC = () => {
  const { toast } = useToast();
  const [availability, setAvailability] = useState<AvailabilityData>({
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00'
  });

  const [doctorStatus, setDoctorStatus] = useState<DoctorStatus | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const days = [
    { key: 'monday', label: 'Monday', icon: Sun },
    { key: 'tuesday', label: 'Tuesday', icon: Sun },
    { key: 'wednesday', label: 'Wednesday', icon: Sun },
    { key: 'thursday', label: 'Thursday', icon: Sun },
    { key: 'friday', label: 'Friday', icon: Sun },
    { key: 'saturday', label: 'Saturday', icon: Moon },
    { key: 'sunday', label: 'Sunday', icon: Moon }
  ];

  useEffect(() => {
    fetchAvailability();
    fetchDoctorStatus();
    initializeWeeklySchedule();
    
    const interval = setInterval(fetchDoctorStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const initializeWeeklySchedule = () => {
    const schedule: WeeklySchedule = {};
    days.forEach(day => {
      schedule[day.key] = {
        isWorking: availability.workingDays.includes(day.key),
        startTime: availability.startTime,
        endTime: availability.endTime,
        breaks: [{ start: availability.lunchBreakStart, end: availability.lunchBreakEnd, type: 'Lunch' }]
      };
    });
    setWeeklySchedule(schedule);
  };

  const fetchAvailability = async () => {
    try {
      const response = await apiService.get('/doctor-availability/me');
      if (response.data?.success && response.data.data) {
        const data = response.data.data;
        console.log('📥 Frontend received data:', data);
        
        // Handle both formats: array of strings or array of objects
        let workingDays: string[] = [];
        if (Array.isArray(data.workingDays)) {
          if (typeof data.workingDays[0] === 'string') {
            // Backend sent array of day names
            workingDays = data.workingDays;
          } else if (data.workingDays[0]?.day) {
            // Backend sent array of objects with day property - filter to only working days
            workingDays = data.workingDays
              .filter((day: { day: string; isWorking: boolean }) => day.isWorking)
              .map((day: { day: string }) => day.day);
          }
        }
        
        console.log('🔍 Working days processing:', {
          rawData: data.workingDays,
          processedWorkingDays: workingDays
        });
        
        setAvailability({
          workingDays,
          startTime: data.defaultStartTime,
          endTime: data.defaultEndTime,
          appointmentDuration: data.appointmentDuration,
          lunchBreakStart: data.workingDays?.[0]?.breaks?.[0]?.startTime || '12:00',
          lunchBreakEnd: data.workingDays?.[0]?.breaks?.[0]?.endTime || '13:00'
        });
        setAutoSave(data.autoSave);
        initializeWeeklySchedule();
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorStatus = async () => {
    try {
      const response = await apiService.get('/doctor-availability/me');
      if (response.data?.success && response.data.data) {
        const data = response.data.data;
        
        // Handle both formats: array of strings or array of objects
        let workingDays: string[] = [];
        if (Array.isArray(data.workingDays)) {
          if (typeof data.workingDays[0] === 'string') {
            // Backend sent array of day names
            workingDays = data.workingDays;
          } else if (data.workingDays[0]?.day) {
            // Backend sent array of objects with day property - filter to only working days
            workingDays = data.workingDays
              .filter((day: { day: string; isWorking: boolean }) => day.isWorking)
              .map((day: { day: string }) => day.day);
          }
        }
        
        setDoctorStatus({
          isWorkingToday: data.currentStatus?.isWorkingToday,
          isWithinWorkingHours: data.currentStatus?.isWithinWorkingHours,
          isOnline: data.isOnline,
          currentStatus: data.status,
          workingHours: {
            startTime: data.defaultStartTime,
            endTime: data.defaultEndTime,
            workingDays
          },
          lastUpdated: data.currentStatus?.lastUpdated
        });
        setIsOnline(data.isOnline);
      }
    } catch (error) {
      console.error('Error fetching doctor status:', error);
    }
  };

  const handleWorkingDayToggle = (day: string) => {
    const newAvailability = {
      ...availability,
      workingDays: availability.workingDays.includes(day)
        ? availability.workingDays.filter(d => d !== day)
        : [...availability.workingDays, day]
    };
    setAvailability(newAvailability);
    
    if (autoSave) {
      handleAutoSave(newAvailability);
    }
  };

  const handleInputChange = (field: keyof AvailabilityData, value: string | number) => {
    const newAvailability = {
      ...availability,
      [field]: value
    };
    setAvailability(newAvailability);
    
    if (autoSave) {
      handleAutoSave(newAvailability);
    }
  };

  const handleAutoSave = async (data?: AvailabilityData) => {
    try {
      const dataToSave = data || availability;
      
      // Convert frontend format to backend format
      const workingDays = days.map(day => ({
        day: day.key,
        isWorking: dataToSave.workingDays.includes(day.key),
        startTime: dataToSave.startTime,
        endTime: dataToSave.endTime,
        breaks: [{
          startTime: dataToSave.lunchBreakStart,
          endTime: dataToSave.lunchBreakEnd,
          type: 'lunch',
          description: 'Lunch Break'
        }]
      }));

      const updateData = {
        workingDays,
        defaultStartTime: dataToSave.startTime,
        defaultEndTime: dataToSave.endTime,
        appointmentDuration: dataToSave.appointmentDuration,
        autoSave,
        realTimeUpdates: true
      };

      await apiService.put('/doctor-availability/me', updateData);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleOnlineToggle = async () => {
    try {
      const newStatus = !isOnline;
      setIsOnline(newStatus);
      
      await apiService.put('/doctor-availability/me/online-status', { isOnline: newStatus });
      
      toast({
        title: newStatus ? 'Now Online' : 'Now Offline',
        description: newStatus ? 'You are now available for appointments' : 'You are now offline',
      });
      
      fetchDoctorStatus();
    } catch (error) {
      console.error('Error updating online status:', error);
      setIsOnline(!isOnline);
      toast({
        title: 'Error',
        description: 'Failed to update online status',
        variant: 'destructive'
      });
    }
  };

  const handleSaveAvailability = async () => {
    setSaving(true);
    try {
      // Convert frontend format to backend format
      const workingDays = days.map(day => ({
        day: day.key,
        isWorking: availability.workingDays.includes(day.key),
        startTime: availability.startTime,
        endTime: availability.endTime,
        breaks: [{
          startTime: availability.lunchBreakStart,
          endTime: availability.lunchBreakEnd,
          type: 'lunch',
          description: 'Lunch Break'
        }]
      }));

      const updateData = {
        workingDays,
        defaultStartTime: availability.startTime,
        defaultEndTime: availability.endTime,
        appointmentDuration: availability.appointmentDuration,
        autoSave,
        realTimeUpdates: true
      };

      const response = await apiService.put('/doctor-availability/me', updateData);
      
      if (response.data?.success) {
        setLastSaved(new Date());
        toast({
          title: 'Availability Updated',
          description: 'Your working hours have been updated successfully',
        });
        
        fetchDoctorStatus();
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'unavailable':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const calculateWorkingHours = () => {
    const start = new Date(`2000-01-01T${availability.startTime}`);
    const end = new Date(`2000-01-01T${availability.endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours;
  };

  const calculateSlotsPerDay = () => {
    const workingHours = calculateWorkingHours();
    
    // Calculate break time using lunch break times
    const breakStart = new Date(`2000-01-01T${availability.lunchBreakStart}`);
    const breakEnd = new Date(`2000-01-01T${availability.lunchBreakEnd}`);
    const workStart = new Date(`2000-01-01T${availability.startTime}`);
    const workEnd = new Date(`2000-01-01T${availability.endTime}`);
    
    // Calculate overlapping break time
    const overlapStart = new Date(Math.max(breakStart.getTime(), workStart.getTime()));
    const overlapEnd = new Date(Math.min(breakEnd.getTime(), workEnd.getTime()));
    const breakHours = overlapStart < overlapEnd ? (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60) : 0;
    
    const availableHours = workingHours - breakHours;
    return Math.floor((availableHours * 60) / availability.appointmentDuration);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-health-teal/5 to-health-aqua/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-health-teal mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your availability settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-health-teal/10 rounded-lg">
                  <Calendar className="w-8 h-8 text-health-teal" />
                </div>
                Availability Management
              </h1>
              <p className="text-gray-600 mt-2">Configure your working schedule and online status</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isOnline}
                  onCheckedChange={handleOnlineToggle}
                />
                <Label className="flex items-center gap-2">
                  {isOnline ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
                  Online Status
                </Label>
              </div>
              <Badge className={getStatusColor(doctorStatus?.currentStatus || 'unknown')}>
                {getStatusIcon(doctorStatus?.currentStatus || 'unknown')}
                <span className="ml-1 capitalize">{doctorStatus?.currentStatus || 'Unknown'}</span>
              </Badge>
            </div>
          </div>

          {/* Status Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Working Days</p>
                  <p className="text-2xl font-bold text-green-800">{availability.workingDays.length}</p>
                </div>
                <CalendarDays className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Daily Hours</p>
                  <p className="text-2xl font-bold text-blue-800">{calculateWorkingHours()}h</p>
                </div>
                <Timer className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Slots/Day</p>
                  <p className="text-2xl font-bold text-purple-800">{calculateSlotsPerDay()}</p>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Appointment</p>
                  <p className="text-2xl font-bold text-orange-800">{availability.appointmentDuration}m</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Current Status Alert */}
        {doctorStatus && (
          <Alert className={`border-2 ${doctorStatus.currentStatus === 'available' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">
              {doctorStatus.currentStatus === 'available' 
                ? `✅ You are currently available for appointments. Working hours: ${doctorStatus.workingHours.startTime} - ${doctorStatus.workingHours.endTime}`
                : `❌ You are currently unavailable. ${
                    !doctorStatus.isWorkingToday ? 'Not a working day. ' : ''
                  }${
                    !doctorStatus.isWithinWorkingHours ? `Outside working hours (${doctorStatus.workingHours.startTime} - ${doctorStatus.workingHours.endTime}). ` : ''
                  }${
                    !doctorStatus.isOnline ? 'You are offline.' : ''
                  }`
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="breaks" className="flex items-center gap-2">
              <Coffee className="w-4 h-4" />
              Breaks
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Working Schedule */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-health-teal/5 to-health-aqua/5 border-b">
                  <CardTitle className="flex items-center space-x-2 text-health-teal">
                    <Calendar className="w-5 h-5" />
                    <span>Working Schedule</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-4 block">Working Days</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {days.map((day) => {
                        const DayIcon = day.icon;
                        const isWorking = availability.workingDays.includes(day.key);
                        return (
                          <TooltipProvider key={day.key}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleWorkingDayToggle(day.key)}
                                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                                    isWorking
                                      ? 'border-health-teal bg-health-teal/5 text-health-teal'
                                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                                  }`}
                                >
                                  <DayIcon className="w-4 h-4" />
                                  <span className="font-medium">{day.label}</span>
                                  {isWorking && <CheckCircle className="w-4 h-4 ml-auto" />}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{isWorking ? 'Working day' : 'Non-working day'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime" className="flex items-center gap-2 mb-2">
                        <Sun className="w-4 h-4 text-orange-500" />
                        Start Time
                      </Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={availability.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                        className="border-2 focus:border-health-teal"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime" className="flex items-center gap-2 mb-2">
                        <Moon className="w-4 h-4 text-blue-500" />
                        End Time
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={availability.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                        className="border-2 focus:border-health-teal"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="appointmentDuration" className="flex items-center gap-2 mb-2">
                      <Timer className="w-4 h-4 text-purple-500" />
                      Appointment Duration
                    </Label>
                    <Select 
                      value={availability.appointmentDuration.toString()} 
                      onValueChange={(value) => handleInputChange('appointmentDuration', parseInt(value))}
                    >
                      <SelectTrigger className="border-2 focus:border-health-teal">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions & Stats */}
              <div className="space-y-6">
                <Card className="shadow-lg border-0 bg-white">
                  <CardHeader className="bg-gradient-to-r from-health-purple/5 to-health-aqua/5 border-b">
                    <CardTitle className="flex items-center space-x-2 text-health-purple">
                      <Zap className="w-5 h-5" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAvailability(prev => ({ ...prev, workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] }))}
                      className="w-full justify-start hover:bg-health-teal/5 hover:border-health-teal"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Set Weekdays Only
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAvailability(prev => ({ ...prev, workingDays: days.map(d => d.key) }))}
                      className="w-full justify-start hover:bg-health-teal/5 hover:border-health-teal"
                    >
                      <CalendarDays className="w-4 h-4 mr-2" />
                      Set All Days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAvailability(prev => ({ ...prev, workingDays: [] }))}
                      className="w-full justify-start hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Clear All Days
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white">
                  <CardHeader className="bg-gradient-to-r from-health-success/5 to-health-aqua/5 border-b">
                    <CardTitle className="flex items-center space-x-2 text-health-success">
                      <TrendingUp className="w-5 h-5" />
                      <span>Schedule Analytics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Weekly Availability</span>
                      <span className="text-lg font-bold text-health-teal">{availability.workingDays.length}/7 days</span>
                    </div>
                    <Progress value={(availability.workingDays.length / 7) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Daily Capacity</span>
                      <span className="text-lg font-bold text-health-purple">{calculateSlotsPerDay()} slots</span>
                    </div>
                    <Progress value={(calculateSlotsPerDay() / 20) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Working Hours</span>
                      <span className="text-lg font-bold text-health-aqua">{calculateWorkingHours()}h/day</span>
                    </div>
                    <Progress value={(calculateWorkingHours() / 12) * 100} className="h-2" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-health-aqua/5 to-health-teal/5 border-b">
                <CardTitle className="flex items-center space-x-2 text-health-aqua">
                  <Calendar className="w-5 h-5" />
                  <span>Weekly Schedule View</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-7 gap-4">
                  {days.map((day) => {
                    const DayIcon = day.icon;
                    const isWorking = availability.workingDays.includes(day.key);
                    return (
                      <div key={day.key} className="text-center">
                        <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          isWorking ? 'border-health-teal bg-health-teal/5' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <DayIcon className={`w-6 h-6 mx-auto mb-2 ${isWorking ? 'text-health-teal' : 'text-gray-400'}`} />
                          <p className={`font-medium ${isWorking ? 'text-health-teal' : 'text-gray-500'}`}>
                            {day.label}
                          </p>
                          {isWorking && (
                            <div className="mt-2 text-xs text-gray-600">
                              <p>{availability.startTime} - {availability.endTime}</p>
                              <p>{calculateSlotsPerDay()} slots</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Breaks Tab */}
          <TabsContent value="breaks" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b">
                <CardTitle className="flex items-center space-x-2 text-orange-600">
                  <Coffee className="w-5 h-5" />
                  <span>Break Time Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lunchBreakStart" className="flex items-center gap-2 mb-2">
                      <Sun className="w-4 h-4 text-orange-500" />
                      Lunch Break Start
                    </Label>
                    <Input
                      id="lunchBreakStart"
                      type="time"
                      value={availability.lunchBreakStart}
                      onChange={(e) => handleInputChange('lunchBreakStart', e.target.value)}
                      className="border-2 focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lunchBreakEnd" className="flex items-center gap-2 mb-2">
                      <Moon className="w-4 h-4 text-blue-500" />
                      Lunch Break End
                    </Label>
                    <Input
                      id="lunchBreakEnd"
                      type="time"
                      value={availability.lunchBreakEnd}
                      onChange={(e) => handleInputChange('lunchBreakEnd', e.target.value)}
                      className="border-2 focus:border-orange-400"
                    />
                  </div>
                </div>
                
                <Alert className="border-orange-200 bg-orange-50">
                  <Coffee className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Note:</strong> Break time will be automatically excluded from available appointment slots. 
                    This ensures you have proper rest periods during your workday.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center space-x-2 text-purple-600">
                  <Settings className="w-5 h-5" />
                  <span>Advanced Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Auto-save Changes</Label>
                    <p className="text-sm text-gray-600">Automatically save changes as you make them</p>
                  </div>
                  <Switch
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Real-time Updates</Label>
                    <p className="text-sm text-gray-600">Update availability status every 30 seconds</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <Activity className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Test Mode (24/7 Availability)</Label>
                    <p className="text-sm text-gray-600">Override working hours for testing purposes</p>
                  </div>
                  <Switch
                    checked={false}
                    onCheckedChange={() => {
                      // This would be implemented to override working hours
                      toast({
                        title: "Test Mode",
                        description: "This feature would allow 24/7 availability for testing. Not implemented yet.",
                        variant: "default"
                      });
                    }}
                  />
                </div>

                {lastSaved && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <Save className="w-4 h-4 inline mr-2" />
                      Last saved: {lastSaved.toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={fetchAvailability}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            {lastSaved && (
              <p className="text-sm text-gray-600">
                Last saved: {lastSaved.toLocaleString()}
              </p>
            )}
          </div>
          <Button 
            onClick={handleSaveAvailability} 
            disabled={saving}
            className="bg-gradient-to-r from-health-teal to-health-aqua hover:from-health-teal/90 hover:to-health-aqua/90 text-white px-8 py-3 rounded-lg shadow-lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Availability Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;
