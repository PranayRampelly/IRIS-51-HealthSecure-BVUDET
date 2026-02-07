
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Eye, Trash2, Calendar, User, FileText, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import UserInfoDialog from '@/components/UserInfoDialog';
import AccessLogs from '../AccessLogs';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const mockSharingRequests = [
  { id: 1, requester: 'Dr. Johnson', role: 'Doctor', proof: 'No penicillin allergy', date: '2024-01-16', avatar: '/placeholder.svg' },
  { id: 2, requester: 'HealthFirst Insurance', role: 'Insurer', proof: 'Recent surgery date', date: '2024-01-15', avatar: '/placeholder.svg' },
  { id: 3, requester: 'Medical Research Institute', role: 'Researcher', proof: 'Diabetes status', date: '2024-01-14', avatar: '/placeholder.svg' },
];

// Types for activity chart and recent activity
interface ActivityChartData {
  day: string;
  accesses: number;
}
interface ActivityLog {
  _id?: string;
  action: string;
  resourceType: string;
  details?: string;
  timestamp?: string;
}
interface HealthRecord {
  _id?: string;
  id?: string;
  type: string;
  provider: string;
  date: string;
  status: string;
}
interface PendingRequest {
  _id: string;
  requester?: { name?: string };
  requesterRole?: string;
  requestedProof?: string;
  proofType?: string;
  createdAt?: string;
  status?: string;
}

const PatientDashboard = () => {
  const { user } = useAuth();
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [showUserInfoDialog, setShowUserInfoDialog] = useState(false);
  const [userProfileComplete, setUserProfileComplete] = useState(false);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [activityData, setActivityData] = useState<ActivityChartData[]>([]); // for bar chart
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]); // for list
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activeSharesCount, setActiveSharesCount] = useState<number>(0);
  const [welcomeName, setWelcomeName] = useState<string>('New User');
  const [lastLoginText, setLastLoginText] = useState<string>('');

  // Check if user profile is complete on component mount
  useEffect(() => {
    checkUserProfileStatus();
    
    // Fallback: if profile check takes too long, show dashboard content
    const timeout = setTimeout(() => {
      if (!userProfileComplete) {
        console.log('Profile check timeout, showing dashboard content');
        setUserProfileComplete(true);
      }
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (userProfileComplete) {
      fetchHealthRecords();
      fetchPendingRequests();
      fetchActivityData();
      fetchWelcomeSummary();
      fetchActiveSharesCount();
    }
  }, [userProfileComplete]);

  const fetchHealthRecords = async () => {
    setLoadingRecords(true);
    try {
      const response = await api.getHealthRecords({ limit: 5 }); // limit for dashboard
      if (response.records) {
        setHealthRecords(response.records as HealthRecord[]);
      } else {
        setHealthRecords([]);
      }
    } catch (error) {
      setHealthRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const fetchPendingRequests = async () => {
    setLoadingRequests(true);
    try {
      // Use unified API client (handles baseURL and auth)
      const data = await api.getProofRequests('patient');
      const list = (data.requests as PendingRequest[]) || [];
      setPendingRequests(list.filter((r) => (r.status || '').toLowerCase() === 'pending'));
    } catch (error) {
      setPendingRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchActiveSharesCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch('http://localhost:5000/api/vault/shares', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      if (resp.ok && Array.isArray(data.shares)) {
        const count = data.shares.filter((s: any) => !s.revoked).length;
        setActiveSharesCount(count);
      } else {
        setActiveSharesCount(0);
      }
    } catch {
      setActiveSharesCount(0);
    }
  };

  const fetchWelcomeSummary = async () => {
    try {
      // Prefer cached auth user first
      if (user?.firstName || user?.lastName) {
        setWelcomeName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
      }
      const me = await api.getCurrentUser();
      const name = `${me.firstName || ''} ${me.lastName || ''}`.trim();
      if (name) setWelcomeName(name);
      if (me.lastLogin) setLastLoginText(formatLastLogin(me.lastLogin));
    } catch {
      // Silent fallback to existing values
    }
  };

  const formatLastLogin = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return isToday ? `Today at ${time}` : `${d.toLocaleDateString()} ${time}`;
  };

  const fetchActivityData = async () => {
    setLoadingActivity(true);
    try {
      const stats = await api.getAccessLogStats(7);
      // Prepare bar chart data for last 7 days (Mon-Sun)
      const daysOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const today = new Date();
      const last7 = Array.from({length: 7}, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return d;
      });
      const dailyArr: { _id: string, count: number }[] = stats.dailyActivity;
      const dailyMap = Object.fromEntries(dailyArr.map((d) => [d._id, d.count]));
      const chartData: ActivityChartData[] = last7.map(date => {
        const key = date.toISOString().slice(0,10);
        return {
          day: daysOfWeek[date.getDay()],
          accesses: dailyMap[key] || 0
        };
      });
      setActivityData(chartData);
      setRecentActivity((stats.recentActivity as ActivityLog[]) || []);
    } catch (error) {
      setActivityData([]);
      setRecentActivity([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  const checkUserProfileStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setShowUserInfoDialog(true);
        return;
      }

      // Check profile status from API
      const response = await fetch('http://localhost:5000/api/patient/profile/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check profile status');
      }

      const data = await response.json();
      
      if (!data.isComplete) {
        setShowUserInfoDialog(true);
      } else {
        setUserProfileComplete(true);
      }
    } catch (error) {
      console.error('Error checking user profile status:', error);
      // For development, let's show the dashboard content even if profile check fails
      // In production, you might want to show the dialog
      console.log('Profile check failed, showing dashboard content for development');
      setUserProfileComplete(true);
    }
  };

  const handleUserInfoSave = async (userData: any) => {
    try {
      // Update user profile in backend
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save profile');
      }

      const result = await response.json();
      
      setUserProfileComplete(true);
      setShowUserInfoDialog(false);
      
      // Show success message
      alert('Profile completed successfully! Welcome to your dashboard.');
    } catch (error) {
      console.error('Error saving user data:', error);
      alert(error.message || 'Failed to save profile. Please try again.');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await fetch(`/api/proof-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      fetchPendingRequests();
    } catch (error) {
      // Optionally show error
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    try {
      await fetch(`/api/proof-requests/${requestId}/deny`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      fetchPendingRequests();
    } catch (error) {
      // Optionally show error
    }
  };

  const handleRecordSelect = (recordId: number) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Welcome Header */}
        <Card className="bg-gradient-to-r from-health-teal to-health-aqua text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-montserrat">
              Welcome Back, {userProfileComplete ? welcomeName || 'User' : 'New User'}
            </CardTitle>
            <p className="text-health-light-gray">
              {userProfileComplete 
                ? `You have ${activeSharesCount} active sharing request${activeSharesCount === 1 ? '' : 's'}, ${pendingRequests.length} pending proof request${pendingRequests.length === 1 ? '' : 's'}${lastLoginText ? `, last login: ${lastLoginText}` : ''}`
                : 'Please complete your profile to get started with your healthcare dashboard'
              }
            </p>
            {userProfileComplete && (
              <Button className="w-fit bg-white text-health-teal hover:bg-white/90 mt-4">
                <Upload className="w-4 h-4 mr-2" />
                Upload New Record
              </Button>
            )}
          </CardHeader>
        </Card>

        {/* Profile Completion Notice */}
        {!userProfileComplete && (
          <Card className="border-health-warning/20 bg-health-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-health-warning rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-health-warning">Complete Your Profile</h3>
                  <p className="text-sm text-health-charcoal/70">
                    To access all features and ensure proper healthcare coordination, please complete your profile information.
                  </p>
                </div>
                <Button 
                  onClick={() => setShowUserInfoDialog(true)}
                  className="bg-health-warning text-white hover:bg-health-warning/90"
                >
                  Complete Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Content - Only show if profile is complete */}
        {userProfileComplete && (
          <>
            {/* My Health Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  My Health Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loadingRecords ? (
                    <div className="text-center py-4 text-health-charcoal">Loading records...</div>
                  ) : healthRecords.length === 0 ? (
                    <div className="text-center py-4 text-health-charcoal">No records found</div>
                  ) : (
                    healthRecords.map((record) => (
                      <div key={record._id || record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-health-light-gray/50">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                            checked={selectedRecords.includes(parseInt((record._id || record.id) as string, 10))}
                            onChange={() => handleRecordSelect(parseInt((record._id || record.id) as string, 10))}
                          className="rounded border-gray-300"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{record.type}</span>
                            <Badge variant={record.status === 'Active' ? 'default' : 'secondary'}>
                              {record.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {record.provider} • {record.date}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => window.location.href = `/patient/records/${record._id || record.id}` }>
                          <Eye className="w-4 h-4" />
                        </Button>
                          <Button size="sm" variant="outline" onClick={() => {/* TODO: Implement proof generation */}}>
                          Generate Proof
                        </Button>
                          <Button size="sm" variant="destructive" onClick={() => {/* TODO: Implement delete */}}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    ))
                  )}
                </div>
                {selectedRecords.length > 0 && (
                  <div className="mt-4 p-3 bg-health-aqua/10 rounded-lg">
                    <p className="text-sm text-health-teal">
                      {selectedRecords.length} record(s) selected
                    </p>
                    <Button size="sm" className="mt-2 bg-health-aqua text-white">
                      Generate Bulk Proof
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Sharing Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Pending Sharing Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingRequests ? (
                    <div className="text-center py-4 text-health-charcoal">Loading requests...</div>
                  ) : pendingRequests.length === 0 ? (
                    <div className="text-center py-4 text-health-charcoal">No pending requests</div>
                  ) : (
                    pendingRequests.map((request) => (
                      <div key={typeof request._id === 'string' ? request._id : String(request._id)} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-health-teal rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                              {request.requester?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                            <div className="font-medium">{request.requester?.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-600">{request.requesterRole}</div>
                          <div className="text-sm">
                              Requested: <span className="font-medium">{request.requestedProof || request.proofType}</span>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                              {request.createdAt?.slice(0, 10)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" className="bg-health-success text-white" onClick={() => handleApproveRequest(typeof request._id === 'string' ? request._id : String(request._id))}>
                          Approve
                        </Button>
                          <Button size="sm" variant="outline" className="border-health-danger text-health-danger hover:bg-health-danger hover:text-white" onClick={() => handleDenyRequest(typeof request._id === 'string' ? request._id : String(request._id))}>
                          Deny
                        </Button>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity & Access Logs */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Data Access Activity (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="accesses" fill="#3DCAD0" />
                    </BarChart>
                  </ResponsiveContainer>
                  <Button variant="outline" className="w-full mt-4">
                    View Full Audit Log
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loadingActivity ? (
                      <div className="text-center py-4 text-health-charcoal">Loading activity...</div>
                    ) : recentActivity.length === 0 ? (
                      <div className="text-center py-4 text-health-charcoal">No recent activity</div>
                    ) : (
                      recentActivity.slice(0, 5).map((activity: ActivityLog, index) => (
                        <div key={activity._id || index} className="text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                              <div className="font-medium">{activity.action}</div>
                              <div className="text-gray-600">{activity.resourceType}</div>
                              <div className="text-xs text-gray-500">{activity.details}</div>
                            </div>
                            <div className="text-xs text-gray-500">{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : ''}</div>
                          </div>
                          {index < Math.min(recentActivity.length, 5) - 1 && <hr className="mt-3" />}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Access Logs Section */}
            <AccessLogs />
          </>
        )}
      </div>

      {/* User Info Dialog */}
      <UserInfoDialog
        isOpen={showUserInfoDialog}
        onClose={() => setShowUserInfoDialog(false)}
        onSave={handleUserInfoSave}
      />
    </>
  );
};

export default PatientDashboard;
