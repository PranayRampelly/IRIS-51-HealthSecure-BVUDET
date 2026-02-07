
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Edit,
  Lock,
  Unlock,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Shield,
  Download,
  RefreshCw,
  Eye,
  Activity,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

// API service for user management
const API_BASE_URL = 'http://localhost:5000/api';

const AdminUsers = () => {
  const { toast } = useToast();

  // State management
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    suspendedUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVerified, setSelectedVerified] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showUserActivity, setShowUserActivity] = useState(false);
  const [userActivity, setUserActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Form states for create/edit user
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'patient',
    phone: '',
    isActive: true,
    isEmailVerified: false,
    // Doctor specific fields
    specialization: '',
    hospital: '',
    licenseNumber: '',
    bio: '',
    consultationFees: 0,
    // Patient specific fields
    bloodType: '',
    dateOfBirth: '',
    // Insurance specific fields
    organization: ''
  });

  // Role colors for badges
  const roleColors = {
    patient: 'bg-health-teal text-white',
    doctor: 'bg-health-aqua text-white',
    insurance: 'bg-health-success text-white',
    researcher: 'bg-health-warning text-white',
    admin: 'bg-health-blue-gray text-white'
  };

  // Status colors for badges
  const statusColors = {
    active: 'bg-health-success text-white',
    pending: 'bg-health-warning text-white',
    suspended: 'bg-health-danger text-white'
  };

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // API request helper
  const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Fetch users with filters
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(selectedRole !== 'all' && { role: selectedRole }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedVerified !== 'all' && { verified: selectedVerified }),
        ...(searchTerm && { search: searchTerm })
      });

      const data = await apiRequest(`/admin/users?${params}`);
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalUsers(data.pagination?.totalUsers || 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Set default values if API fails
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, selectedRole, selectedStatus, selectedVerified, searchTerm]);

  // Fetch user statistics
  const fetchUserStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await apiRequest('/admin/users/stats');
      setUserStats({
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
        pendingUsers: data.pendingUsers || 0,
        suspendedUsers: data.suspendedUsers || 0
      });
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      // Set default values if API fails
      setUserStats({
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        suspendedUsers: 0
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch user activity
  const fetchUserActivity = async (userId) => {
    setActivityLoading(true);
    try {
      const data = await apiRequest(`/admin/users/${userId}/activity`);
      setUserActivity(data);
      setShowUserActivity(true);
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  // View user details - fetch complete details from database
  const handleViewUserDetails = async (user) => {
    setShowUserDetails(true);
    setDetailsLoading(true);
    try {
      const data = await apiRequest(`/admin/users/${user.id}`);
      setSelectedUserDetails(data.user || data);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      // Fallback to the user data we already have
      setSelectedUserDetails(user);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Create new user
  const createUser = async () => {
    try {
      await apiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      toast({
        title: "Success",
        description: "User created successfully",
        variant: "default"
      });

      setShowCreateDialog(false);
      resetForm();
      fetchUsers();
      fetchUserStats();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  // Update user
  const updateUser = async () => {
    try {
      await apiRequest(`/admin/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      toast({
        title: "Success",
        description: "User updated successfully",
        variant: "default"
      });

      setShowEditDialog(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
      fetchUserStats();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  // Delete user (soft delete)
  const deleteUser = async (userId) => {
    try {
      await apiRequest(`/admin/users/${userId}`, {
        method: 'DELETE'
      });

      toast({
        title: "Success",
        description: "User deactivated successfully",
        variant: "default"
      });

      fetchUsers();
      fetchUserStats();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // Reactivate user
  const reactivateUser = async (userId) => {
    try {
      await apiRequest(`/admin/users/${userId}/reactivate`, {
        method: 'PATCH'
      });

      toast({
        title: "Success",
        description: "User reactivated successfully",
        variant: "default"
      });

      fetchUsers();
      fetchUserStats();
    } catch (error) {
      console.error('Failed to reactivate user:', error);
    }
  };

  // Bulk operations
  const performBulkOperation = async () => {
    if (!selectedUsers.length || !bulkAction) return;

    try {
      await apiRequest('/admin/users/bulk', {
        method: 'POST',
        body: JSON.stringify({
          operation: bulkAction,
          userIds: selectedUsers
        })
      });

      toast({
        title: "Success",
        description: `Bulk ${bulkAction} completed successfully`,
        variant: "default"
      });

      setSelectedUsers([]);
      setBulkAction('');
      fetchUsers();
      fetchUserStats();
    } catch (error) {
      console.error('Failed to perform bulk operation:', error);
    }
  };

  // Export users
  const exportUsers = async (format = 'json') => {
    try {
      const params = new URLSearchParams({
        format,
        ...(selectedRole !== 'all' && { role: selectedRole }),
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      });

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/users/export?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${Date.now()}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: "Success",
        description: `Users exported as ${format.toUpperCase()}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to export users:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'patient',
      phone: '',
      isActive: true,
      isEmailVerified: false,
      specialization: '',
      hospital: '',
      licenseNumber: '',
      bio: '',
      consultationFees: 0,
      bloodType: '',
      dateOfBirth: '',
      organization: ''
    });
  };

  // Edit user handler
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      isActive: user.status === 'active',
      isEmailVerified: user.verified,
      specialization: user.specialization || '',
      hospital: user.hospital || '',
      licenseNumber: user.licenseNumber || '',
      bio: user.bio || '',
      consultationFees: user.consultationFees || 0,
      bloodType: user.bloodType || '',
      dateOfBirth: user.dateOfBirth || '',
      organization: user.organization || ''
    });
    setShowEditDialog(true);
  };

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle user selection for bulk operations
  const handleUserSelection = (userId, checked) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  // Handle select all users
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [fetchUsers, fetchUserStats]);

  // Filtered users for display
  const filteredUsers = users;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-montserrat font-bold text-health-teal">User Management</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              fetchUsers();
              fetchUserStats();
            }}
            disabled={loading || statsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(loading || statsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => exportUsers('csv')}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      placeholder="Last Name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    placeholder="Email Address"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleFormChange('password', e.target.value)}
                    placeholder="Password"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => handleFormChange('role', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="researcher">Researcher</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                {/* Role-specific fields */}
                {formData.role === 'doctor' && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Doctor Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                          id="specialization"
                          value={formData.specialization}
                          onChange={(e) => handleFormChange('specialization', e.target.value)}
                          placeholder="Specialization"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hospital">Hospital</Label>
                        <Input
                          id="hospital"
                          value={formData.hospital}
                          onChange={(e) => handleFormChange('hospital', e.target.value)}
                          placeholder="Hospital"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => handleFormChange('licenseNumber', e.target.value)}
                        placeholder="License Number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleFormChange('bio', e.target.value)}
                        placeholder="Professional bio"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {formData.role === 'patient' && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Patient Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bloodType">Blood Type</Label>
                        <Select value={formData.bloodType} onValueChange={(value) => handleFormChange('bloodType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Blood Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleFormChange('dateOfBirth', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.role === 'insurance' && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Insurance Information</h3>
                    <div>
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={formData.organization}
                        onChange={(e) => handleFormChange('organization', e.target.value)}
                        placeholder="Insurance Organization"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleFormChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Active User</Label>
                </div>
                <div className="flex gap-2">
                  <Checkbox
                    id="isEmailVerified"
                    checked={formData.isEmailVerified}
                    onCheckedChange={(checked) => handleFormChange('isEmailVerified', checked)}
                  />
                  <Label htmlFor="isEmailVerified">Email Verified</Label>
                </div>

                <Button onClick={createUser} className="w-full">
                  Create User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-health-charcoal">Total Users</p>
              <p className="text-2xl font-bold text-health-teal">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : userStats.totalUsers}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-health-charcoal">Active</p>
              <p className="text-2xl font-bold text-health-success">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : userStats.activeUsers}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-health-charcoal">Pending</p>
              <p className="text-2xl font-bold text-health-warning">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : userStats.pendingUsers}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-health-charcoal">Suspended</p>
              <p className="text-2xl font-bold text-health-danger">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : userStats.suspendedUsers}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-health-blue-gray" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="researcher">Researcher</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedVerified} onValueChange={setSelectedVerified}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Verified" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verified</SelectItem>
                <SelectItem value="true">Verified</SelectItem>
                <SelectItem value="false">Not Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-health-charcoal">
                {selectedUsers.length} user(s) selected
              </span>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activate</SelectItem>
                  <SelectItem value="deactivate">Deactivate</SelectItem>
                  <SelectItem value="verify">Verify Email</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={performBulkOperation} disabled={!bulkAction}>
                Apply
              </Button>
              <Button variant="outline" onClick={() => setSelectedUsers([])}>
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-health-teal" />
              Users ({totalUsers})
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-health-charcoal">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-health-teal" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-health-blue-gray mb-4" />
              <p className="text-health-charcoal">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="flex items-center p-4 rounded-lg bg-health-light-gray/50 border border-health-blue-gray/20">
                <div className="w-8">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </div>
                <div className="flex-1 font-semibold text-health-charcoal">User</div>
                <div className="w-24 text-center font-semibold text-health-charcoal">Role</div>
                <div className="w-24 text-center font-semibold text-health-charcoal">Status</div>
                <div className="w-32 text-center font-semibold text-health-charcoal">Actions</div>
              </div>

              {/* User Rows */}
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-health-blue-gray/20 hover:bg-health-light-gray/50 transition-colors">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-8">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleUserSelection(user.id, checked)}
                      />
                    </div>
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-health-teal text-white">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-health-charcoal">{user.name}</h3>
                        {user.verified ? (
                          <Shield className="h-4 w-4 text-health-success" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-health-warning" />
                        )}
                      </div>
                      <p className="text-sm text-health-blue-gray">{user.email}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-health-blue-gray flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Joined {user.joinDate}
                        </span>
                        <span className="text-xs text-health-blue-gray flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {user.lastLogin}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={roleColors[user.role]}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                    <Badge className={statusColors[user.status]}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewUserDetails(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => fetchUserActivity(user.id)}>
                          <Activity className="h-4 w-4 mr-2" />
                          View Activity
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        {user.status === 'active' ? (
                          <DropdownMenuItem onClick={() => deleteUser(user.id)}>
                            <Lock className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => reactivateUser(user.id)}>
                            <Unlock className="h-4 w-4 mr-2" />
                            Activate User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-health-danger">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-health-charcoal">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-health-charcoal">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => handleFormChange('firstName', e.target.value)}
                  placeholder="First Name"
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => handleFormChange('lastName', e.target.value)}
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editEmail">Email Address</Label>
              <Input
                id="editEmail"
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                placeholder="Email Address"
              />
            </div>
            <div>
              <Label htmlFor="editPhone">Phone</Label>
              <Input
                id="editPhone"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                placeholder="Phone Number"
              />
            </div>
            <div className="flex gap-2">
              <Checkbox
                id="editIsActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleFormChange('isActive', checked)}
              />
              <Label htmlFor="editIsActive">Active User</Label>
            </div>
            <div className="flex gap-2">
              <Checkbox
                id="editIsEmailVerified"
                checked={formData.isEmailVerified}
                onCheckedChange={(checked) => handleFormChange('isEmailVerified', checked)}
              />
              <Label htmlFor="editIsEmailVerified">Email Verified</Label>
            </div>
            <Button onClick={updateUser} className="w-full">
              Update User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Activity Dialog */}
      <Dialog open={showUserActivity} onOpenChange={setShowUserActivity}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Activity</DialogTitle>
          </DialogHeader>
          {activityLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-health-teal" />
              <span className="ml-2">Loading activity...</span>
            </div>
          ) : userActivity ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Last Login</Label>
                  <p className="text-sm text-health-charcoal">
                    {userActivity.user.lastLoginAt ? new Date(userActivity.user.lastLoginAt).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div>
                  <Label>Account Created</Label>
                  <p className="text-sm text-health-charcoal">
                    {new Date(userActivity.user.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <Label>Access Logs</Label>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {userActivity.accessLogs.length > 0 ? (
                    userActivity.accessLogs.map((log, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{log.action}</span>
                          <span className="text-xs text-health-blue-gray">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-health-charcoal mt-1">IP: {log.ip}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-health-charcoal">No access logs available</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-health-charcoal">No activity data available</p>
          )}
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {detailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-health-teal" />
              <span className="ml-2">Loading user details...</span>
            </div>
          ) : selectedUserDetails ? (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center space-x-4 pb-4 border-b">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUserDetails.avatar || selectedUserDetails.profilePicture} />
                  <AvatarFallback className="bg-health-teal text-white text-xl">
                    {(selectedUserDetails.name || `${selectedUserDetails.firstName} ${selectedUserDetails.lastName}`).split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-semibold text-health-charcoal">
                      {selectedUserDetails.name || `${selectedUserDetails.firstName} ${selectedUserDetails.lastName}`}
                    </h3>
                    {(selectedUserDetails.verified || selectedUserDetails.isEmailVerified) ? (
                      <Shield className="h-5 w-5 text-health-success" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-health-warning" />
                    )}
                  </div>
                  <p className="text-sm text-health-blue-gray">{selectedUserDetails.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={roleColors[selectedUserDetails.role]}>
                      {selectedUserDetails.role.charAt(0).toUpperCase() + selectedUserDetails.role.slice(1)}
                    </Badge>
                    <Badge className={statusColors[selectedUserDetails.status || (selectedUserDetails.isActive ? 'active' : 'suspended')]}>
                      {(selectedUserDetails.status || (selectedUserDetails.isActive ? 'active' : 'suspended')).charAt(0).toUpperCase() + (selectedUserDetails.status || (selectedUserDetails.isActive ? 'active' : 'suspended')).slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Tabs for organized information */}
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="role">Role Details</TabsTrigger>
                  <TabsTrigger value="account">Account Info</TabsTrigger>
                  <TabsTrigger value="technical">Technical Data</TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">First Name</Label>
                      <p className="text-health-charcoal font-medium">{selectedUserDetails.firstName || selectedUserDetails.name?.split(' ')[0] || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Last Name</Label>
                      <p className="text-health-charcoal font-medium">{selectedUserDetails.lastName || selectedUserDetails.name?.split(' ').slice(1).join(' ') || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Email Address</Label>
                      <p className="text-health-charcoal font-medium">{selectedUserDetails.email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Phone Number</Label>
                      <p className="text-health-charcoal font-medium flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-health-teal" />
                        {selectedUserDetails.phone || selectedUserDetails.phoneNumber || 'Not provided'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">User ID</Label>
                      <p className="text-health-charcoal font-medium font-mono text-xs">{selectedUserDetails.id || selectedUserDetails._id}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Username</Label>
                      <p className="text-health-charcoal font-medium">{selectedUserDetails.username || 'N/A'}</p>
                    </div>
                  </div>
                </TabsContent>

                {/* Role-Specific Details Tab */}
                <TabsContent value="role" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Role</Label>
                      <p className="text-health-charcoal font-medium">
                        {selectedUserDetails.role.charAt(0).toUpperCase() + selectedUserDetails.role.slice(1)}
                      </p>
                    </div>

                    {/* Doctor-specific fields */}
                    {selectedUserDetails.role === 'doctor' && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">Specialization</Label>
                          <p className="text-health-charcoal font-medium">
                            {selectedUserDetails.specialization || 'Not specified'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">Hospital</Label>
                          <p className="text-health-charcoal font-medium">
                            {selectedUserDetails.hospital || 'Not specified'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">License Number</Label>
                          <p className="text-health-charcoal font-medium">
                            {selectedUserDetails.licenseNumber || 'Not specified'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">Consultation Fees</Label>
                          <p className="text-health-charcoal font-medium">
                            ${selectedUserDetails.consultationFees || '0'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">Years of Experience</Label>
                          <p className="text-health-charcoal font-medium">
                            {selectedUserDetails.yearsOfExperience || 'Not specified'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">Availability</Label>
                          <p className="text-health-charcoal font-medium">
                            {selectedUserDetails.availability || 'Not specified'}
                          </p>
                        </div>
                        {selectedUserDetails.bio && (
                          <div className="space-y-2 col-span-2">
                            <Label className="text-health-blue-gray">Bio</Label>
                            <p className="text-health-charcoal">{selectedUserDetails.bio}</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Patient-specific fields */}
                    {selectedUserDetails.role === 'patient' && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">Blood Type</Label>
                          <p className="text-health-charcoal font-medium">
                            {selectedUserDetails.bloodType || 'Not specified'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">Date of Birth</Label>
                          <p className="text-health-charcoal font-medium">
                            {selectedUserDetails.dateOfBirth ? new Date(selectedUserDetails.dateOfBirth).toLocaleDateString() : 'Not specified'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">Gender</Label>
                          <p className="text-health-charcoal font-medium">
                            {selectedUserDetails.gender || 'Not specified'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">Address</Label>
                          <p className="text-health-charcoal font-medium">
                            {selectedUserDetails.address || 'Not specified'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">Emergency Contact</Label>
                          <p className="text-health-charcoal font-medium">
                            {selectedUserDetails.emergencyContact || 'Not specified'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">Insurance Provider</Label>
                          <p className="text-health-charcoal font-medium">
                            {selectedUserDetails.insuranceProvider || 'Not specified'}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Insurance-specific fields */}
                    {selectedUserDetails.role === 'insurance' && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">Organization</Label>
                          <p className="text-health-charcoal font-medium">
                            {selectedUserDetails.organization || 'Not specified'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">Company Name</Label>
                          <p className="text-health-charcoal font-medium">
                            {selectedUserDetails.companyName || 'Not specified'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">License ID</Label>
                          <p className="text-health-charcoal font-medium">
                            {selectedUserDetails.licenseId || 'Not specified'}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Researcher-specific fields */}
                    {selectedUserDetails.role === 'researcher' && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">Institution</Label>
                          <p className="text-health-charcoal font-medium">
                            {selectedUserDetails.institution || 'Not specified'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-health-blue-gray">Research Area</Label>
                          <p className="text-health-charcoal font-medium">
                            {selectedUserDetails.researchArea || 'Not specified'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                {/* Account Information Tab */}
                <TabsContent value="account" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Account Status</Label>
                      <div className="flex items-center space-x-2">
                        {(selectedUserDetails.status === 'active' || selectedUserDetails.isActive) ? (
                          <CheckCircle className="h-5 w-5 text-health-success" />
                        ) : (selectedUserDetails.status === 'pending') ? (
                          <Clock className="h-5 w-5 text-health-warning" />
                        ) : (
                          <XCircle className="h-5 w-5 text-health-danger" />
                        )}
                        <p className="text-health-charcoal font-medium">
                          {(selectedUserDetails.status || (selectedUserDetails.isActive ? 'active' : 'suspended')).charAt(0).toUpperCase() + (selectedUserDetails.status || (selectedUserDetails.isActive ? 'active' : 'suspended')).slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Email Verification</Label>
                      <div className="flex items-center space-x-2">
                        {(selectedUserDetails.verified || selectedUserDetails.isEmailVerified) ? (
                          <CheckCircle className="h-5 w-5 text-health-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-health-danger" />
                        )}
                        <p className="text-health-charcoal font-medium">
                          {(selectedUserDetails.verified || selectedUserDetails.isEmailVerified) ? 'Verified' : 'Not Verified'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Join Date</Label>
                      <p className="text-health-charcoal font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-health-teal" />
                        {selectedUserDetails.joinDate || (selectedUserDetails.createdAt ? new Date(selectedUserDetails.createdAt).toLocaleDateString() : 'N/A')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Last Login</Label>
                      <p className="text-health-charcoal font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-health-teal" />
                        {selectedUserDetails.lastLogin || (selectedUserDetails.lastLoginAt ? new Date(selectedUserDetails.lastLoginAt).toLocaleString() : 'Never')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Last Updated</Label>
                      <p className="text-health-charcoal font-medium">
                        {selectedUserDetails.updatedAt ? new Date(selectedUserDetails.updatedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Email Verified At</Label>
                      <p className="text-health-charcoal font-medium">
                        {selectedUserDetails.emailVerifiedAt ? new Date(selectedUserDetails.emailVerifiedAt).toLocaleString() : 'Not verified'}
                      </p>
                    </div>
                  </div>

                  {/* Additional Account Details */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-health-charcoal mb-3">Additional Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-health-blue-gray">Total Records</Label>
                        <p className="text-health-charcoal font-medium">
                          {selectedUserDetails.totalRecords || selectedUserDetails.recordsCount || 0}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-health-blue-gray">Active Sessions</Label>
                        <p className="text-health-charcoal font-medium">
                          {selectedUserDetails.activeSessions || selectedUserDetails.sessionsCount || 0}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-health-blue-gray">Two-Factor Auth</Label>
                        <p className="text-health-charcoal font-medium">
                          {selectedUserDetails.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-health-blue-gray">Account Locked</Label>
                        <p className="text-health-charcoal font-medium">
                          {selectedUserDetails.isLocked ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Technical Data Tab */}
                <TabsContent value="technical" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Database ID</Label>
                      <p className="text-health-charcoal font-medium font-mono text-xs break-all">
                        {selectedUserDetails._id || selectedUserDetails.id}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Created At</Label>
                      <p className="text-health-charcoal font-medium">
                        {selectedUserDetails.createdAt ? new Date(selectedUserDetails.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Updated At</Label>
                      <p className="text-health-charcoal font-medium">
                        {selectedUserDetails.updatedAt ? new Date(selectedUserDetails.updatedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Version</Label>
                      <p className="text-health-charcoal font-medium">
                        {selectedUserDetails.__v !== undefined ? selectedUserDetails.__v : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Password Reset Token</Label>
                      <p className="text-health-charcoal font-medium">
                        {selectedUserDetails.resetPasswordToken ? 'Set' : 'Not set'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-health-blue-gray">Verification Token</Label>
                      <p className="text-health-charcoal font-medium">
                        {selectedUserDetails.verificationToken ? 'Set' : 'Not set'}
                      </p>
                    </div>
                  </div>

                  {/* Raw Data Section */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-health-charcoal mb-3">Complete Database Record</h4>
                    <div className="bg-health-light-gray/30 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="text-xs font-mono text-health-charcoal whitespace-pre-wrap break-all">
                        {JSON.stringify(selectedUserDetails, null, 2)}
                      </pre>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowUserDetails(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowUserDetails(false);
                  handleEditUser(selectedUserDetails);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-health-charcoal">No user data available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
