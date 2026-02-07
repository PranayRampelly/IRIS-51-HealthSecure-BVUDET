import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    User,
    Search,
    Plus,
    Edit,
    Trash2,
    Phone,
    Mail,
    MapPin,
    Award,
    Clock,
    Star,
    FileText,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Shield
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface Driver {
    _id: string;
    firstName: string;
    lastName: string;
    licenseNumber: string;
    phone: string;
    email: string;
    status: 'active' | 'on-duty' | 'off-duty' | 'on-leave' | 'suspended';
    rating: number;
    experience: number;
    specializations: string[];
    assignedVehicle?: {
        _id: string;
        vehicleNumber: string;
        type: string;
    };
    totalTrips: number;
    address?: {
        city: string;
        state: string;
    };
}

const AmbulanceDrivers: React.FC = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        licenseNumber: '',
        phone: '',
        email: '',
        experience: 0,
        status: 'off-duty'
    });

    useEffect(() => {
        fetchDrivers();
    }, [statusFilter]);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            let url = 'http://localhost:5000/api/hospital/ambulance/drivers';
            if (statusFilter !== 'all') {
                url += `?status=${statusFilter}`;
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setDrivers(response.data.data.drivers);
        } catch (error) {
            console.error('Error fetching drivers:', error);
            toast.error('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/hospital/ambulance/drivers?search=${searchTerm}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDrivers(response.data.data.drivers);
        } catch (error) {
            console.error('Error searching drivers:', error);
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDriver = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/hospital/ambulance/drivers', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Driver added successfully');
            setIsAddDialogOpen(false);
            fetchDrivers();
            setFormData({
                firstName: '',
                lastName: '',
                licenseNumber: '',
                phone: '',
                email: '',
                experience: 0,
                status: 'off-duty'
            });
        } catch (error) {
            console.error('Error creating driver:', error);
            toast.error('Failed to add driver');
        }
    };

    const handleUpdateDriver = async () => {
        if (!selectedDriver) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/hospital/ambulance/drivers/${selectedDriver._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Driver updated successfully');
            setIsEditDialogOpen(false);
            fetchDrivers();
        } catch (error) {
            console.error('Error updating driver:', error);
            toast.error('Failed to update driver');
        }
    };

    const handleDeleteDriver = async (id: string) => {
        if (!confirm('Are you sure you want to delete this driver?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/hospital/ambulance/drivers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Driver deleted successfully');
            fetchDrivers();
        } catch (error) {
            console.error('Error deleting driver:', error);
            toast.error('Failed to delete driver');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'on-duty': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'off-duty': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'on-leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-teal-100">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">
                        Ambulance Drivers
                    </h1>
                    <p className="text-gray-500 mt-1">Manage your emergency response team</p>
                </div>
                <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md transition-all duration-200 hover:shadow-lg"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Driver
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white border-teal-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center space-x-4">
                        <div className="p-3 bg-teal-50 rounded-full text-teal-600">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Drivers</p>
                            <p className="text-2xl font-bold text-gray-800">{drivers.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">On Duty</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {drivers.filter(d => d.status === 'on-duty').length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center space-x-4">
                        <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">On Leave</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {drivers.filter(d => d.status === 'on-leave').length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center space-x-4">
                        <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Top Rated</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {drivers.filter(d => d.rating >= 4.5).length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search by name, license, or phone..."
                        className="pl-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] border-gray-200">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on-duty">On Duty</SelectItem>
                        <SelectItem value="off-duty">Off Duty</SelectItem>
                        <SelectItem value="on-leave">On Leave</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Drivers Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drivers.map((driver) => (
                        <Card key={driver._id} className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-teal-500 group">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center text-teal-700 font-bold text-lg">
                                            {driver.firstName[0]}{driver.lastName[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                                                {driver.firstName} {driver.lastName}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-mono">{driver.licenseNumber}</p>
                                        </div>
                                    </div>
                                    <Badge className={`${getStatusColor(driver.status)} capitalize shadow-sm`}>
                                        {driver.status}
                                    </Badge>
                                </div>

                                <div className="space-y-3 text-sm text-gray-600 mb-6">
                                    <div className="flex items-center space-x-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{driver.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="truncate">{driver.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Award className="w-4 h-4 text-gray-400" />
                                        <span>{driver.experience} years exp.</span>
                                    </div>
                                    {driver.assignedVehicle && (
                                        <div className="flex items-center space-x-2 text-teal-600 bg-teal-50 p-2 rounded-md">
                                            <Shield className="w-4 h-4" />
                                            <span className="font-medium">Vehicle: {driver.assignedVehicle.vehicleNumber}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center space-x-1 text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-bold text-gray-700">{driver.rating.toFixed(1)}</span>
                                        <span className="text-xs text-gray-400">({driver.totalTrips} trips)</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            onClick={() => {
                                                setSelectedDriver(driver);
                                                setFormData({
                                                    firstName: driver.firstName,
                                                    lastName: driver.lastName,
                                                    licenseNumber: driver.licenseNumber,
                                                    phone: driver.phone,
                                                    email: driver.email,
                                                    experience: driver.experience,
                                                    status: driver.status
                                                });
                                                setIsEditDialogOpen(true);
                                            }}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDeleteDriver(driver._id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Driver Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-teal-700">Add New Driver</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="license">License Number</Label>
                            <Input
                                id="license"
                                value={formData.licenseNumber}
                                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="experience">Experience (Years)</Label>
                                <Input
                                    id="experience"
                                    type="number"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateDriver} className="bg-teal-600 hover:bg-teal-700 text-white">
                            Add Driver
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Driver Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-teal-700">Edit Driver</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-firstName">First Name</Label>
                                <Input
                                    id="edit-firstName"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-lastName">Last Name</Label>
                                <Input
                                    id="edit-lastName"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-license">License Number</Label>
                            <Input
                                id="edit-license"
                                value={formData.licenseNumber}
                                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input
                                    id="edit-phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-experience">Experience (Years)</Label>
                                <Input
                                    id="edit-experience"
                                    type="number"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="on-duty">On Duty</SelectItem>
                                    <SelectItem value="off-duty">Off Duty</SelectItem>
                                    <SelectItem value="on-leave">On Leave</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateDriver} className="bg-teal-600 hover:bg-teal-700 text-white">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AmbulanceDrivers;
