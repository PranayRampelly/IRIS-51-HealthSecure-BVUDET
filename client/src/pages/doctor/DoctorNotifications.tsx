import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, AlertTriangle, CheckCircle, Info, Clock, 
  User, Calendar, FileText, Shield, Activity
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
  category: string;
}

const DoctorNotifications: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');

  const notifications: Notification[] = [
    {
      id: '1',
      title: 'New Appointment Request',
      message: 'John Doe has requested an appointment for tomorrow at 2:00 PM',
      type: 'info',
      timestamp: '2 hours ago',
      read: false,
      category: 'appointments'
    },
    {
      id: '2',
      title: 'Proof Request Completed',
      message: 'Patient Sarah Wilson has completed the proof request for insurance',
      type: 'success',
      timestamp: '4 hours ago',
      read: true,
      category: 'proofs'
    },
    {
      id: '3',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM',
      type: 'warning',
      timestamp: '1 day ago',
      read: false,
      category: 'system'
    },
    {
      id: '4',
      title: 'New Patient Registration',
      message: 'Mike Johnson has registered as a new patient',
      type: 'info',
      timestamp: '1 day ago',
      read: true,
      category: 'patients'
    },
    {
      id: '5',
      title: 'Prescription Expiry Warning',
      message: 'Prescription for Jane Smith expires in 3 days',
      type: 'warning',
      timestamp: '2 days ago',
      read: false,
      category: 'prescriptions'
    },
  ];

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.category === filter);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-5 h-5 text-blue-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appointments': return <Calendar className="w-4 h-4" />;
      case 'proofs': return <Shield className="w-4 h-4" />;
      case 'patients': return <User className="w-4 h-4" />;
      case 'prescriptions': return <FileText className="w-4 h-4" />;
      case 'system': return <Activity className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-health-charcoal">Notifications</h1>
          <p className="text-health-blue-gray mt-2">Manage your notifications and alerts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            Clear All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-health-blue-gray">Total</p>
                <p className="text-2xl font-bold text-health-charcoal">{notifications.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-health-blue-gray">Unread</p>
                <p className="text-2xl font-bold text-health-charcoal">{unreadCount}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-health-blue-gray">Today</p>
                <p className="text-2xl font-bold text-health-charcoal">3</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-health-blue-gray">This Week</p>
                <p className="text-2xl font-bold text-health-charcoal">12</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'appointments' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('appointments')}
            >
              Appointments
            </Button>
            <Button
              variant={filter === 'proofs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('proofs')}
            >
              Proofs
            </Button>
            <Button
              variant={filter === 'patients' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('patients')}
            >
              Patients
            </Button>
            <Button
              variant={filter === 'prescriptions' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('prescriptions')}
            >
              Prescriptions
            </Button>
            <Button
              variant={filter === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('system')}
            >
              System
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-health-aqua" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge className="bg-health-danger text-white">
                {unreadCount} unread
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border ${
                  notification.read ? 'bg-gray-50' : 'bg-white'
                } ${!notification.read ? 'border-health-aqua/20' : 'border-gray-200'}`}
              >
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <p className={`font-medium ${
                        notification.read ? 'text-health-blue-gray' : 'text-health-charcoal'
                      }`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-health-aqua rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="flex items-center space-x-1">
                        {getCategoryIcon(notification.category)}
                        <span className="capitalize">{notification.category}</span>
                      </Badge>
                      <span className="text-sm text-health-blue-gray">{notification.timestamp}</span>
                    </div>
                  </div>
                  <p className={`text-sm mt-1 ${
                    notification.read ? 'text-health-blue-gray' : 'text-health-charcoal'
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <Button variant="ghost" size="sm">
                      Mark Read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
            {filteredNotifications.length === 0 && (
              <div className="text-center py-8">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-health-charcoal mb-2">No notifications</h3>
                <p className="text-health-blue-gray">You're all caught up!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorNotifications; 