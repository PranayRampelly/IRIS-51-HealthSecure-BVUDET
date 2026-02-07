import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Calendar, Clock, Users, Heart, Stethoscope, Building,
  Search, Plus, Eye, Edit, Trash2, Phone, Mail, MapPin, User,
  CheckCircle, Award, Star, GraduationCap, Briefcase, Settings,
  Download, Filter, ArrowRight, TrendingUp, Shield, Activity,
  Thermometer, Pill, Syringe, Bed, ChevronLeft, ChevronRight,
  CalendarDays, Clock as ClockIcon, UserCheck, UserX
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';

const StaffScheduling: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [selectedTimeSlotSchedules, setSelectedTimeSlotSchedules] = useState<any[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ day: Date; time: string } | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [newSchedule, setNewSchedule] = useState({
    staffId: '',
    date: '',
    shift: '',
    startTime: '',
    endTime: '',
    department: '',
    unit: '',
    notes: '',
    status: 'scheduled'
  });

  useEffect(() => {
    fetchStaffData();
  }, []);

  useEffect(() => {
    fetchSchedulesData();
  }, [currentDate]);

  const fetchStaffData = async () => {
    try {
      const response = await api.get('/hospital/staff');
      console.log('Staff API Response:', response.data); // Debugging
      if (response.data.success) {
        const staffList = response.data.staff || response.data.data?.staff || [];
        console.log('Staff list:', staffList); // Debugging
        setStaff(staffList);
      } else {
        setStaff([]);
      }
    } catch (error: any) {
      console.error('Error fetching staff data:', error);
      console.error('Error response:', error.response?.data);
      setStaff([]);
      toast.error('Failed to load staff data');
    }
  };

  const fetchSchedulesData = async () => {
    try {
      setLoading(true);
      // Calculate date range for current week
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      weekEnd.setHours(23, 59, 59, 999);

      const response = await api.get('/hospital/schedules', {
        params: {
          startDate: weekStart.toISOString(),
          endDate: weekEnd.toISOString()
        }
      });
      console.log('Schedules API Response:', response.data); // Debugging
      if (response.data.success) {
        const schedulesList = response.data.schedules || [];
        console.log('Schedules list:', schedulesList); // Debugging
        console.log('Schedule dates:', schedulesList.map(s => ({ id: s.id, date: s.date, scheduleDate: s.scheduleDate, startTime: s.startTime }))); // Debugging
        setSchedules(schedulesList);
      } else {
        setSchedules([]);
      }
    } catch (error: any) {
      console.error('Error fetching schedules data:', error);
      console.error('Error response:', error.response?.data);
      setSchedules([]);
      toast.error(error.response?.data?.message || 'Failed to load schedules data');
    } finally {
      setLoading(false);
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift?.toLowerCase()) {
      case 'day': return 'bg-blue-100 text-blue-800';
      case 'night': return 'bg-purple-100 text-purple-800';
      case 'evening': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-health-success text-white';
      case 'completed': return 'bg-health-teal text-white';
      case 'cancelled': return 'bg-health-danger text-white';
      case 'overtime': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getSchedulesForDate = (date: Date) => {
    // Normalize date to YYYY-MM-DD format for comparison
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return schedules.filter(schedule => {
      // Handle both date string and scheduleDate object
      let scheduleDateStr = '';
      if (schedule.date) {
        scheduleDateStr = schedule.date;
      } else if (schedule.scheduleDate) {
        // If scheduleDate is a string, use it directly
        if (typeof schedule.scheduleDate === 'string') {
          scheduleDateStr = schedule.scheduleDate.split('T')[0];
        } else {
          // If it's a Date object, convert to string
          const scheduleDate = new Date(schedule.scheduleDate);
          const sYear = scheduleDate.getFullYear();
          const sMonth = String(scheduleDate.getMonth() + 1).padStart(2, '0');
          const sDay = String(scheduleDate.getDate()).padStart(2, '0');
          scheduleDateStr = `${sYear}-${sMonth}-${sDay}`;
        }
      }
      
      const matches = scheduleDateStr === dateStr;
      if (matches) {
        console.log('Schedule match:', { dateStr, scheduleDateStr, schedule });
      }
      return matches;
    });
  };

  const getStaffMember = (staffId: string) => {
    return staff.find(s => s.id === staffId);
  };

  const handleAddSchedule = async () => {
    try {
      // Validate required fields
      if (!newSchedule.staffId) {
        toast.error('Please select a staff member');
        return;
      }
      if (!newSchedule.date) {
        toast.error('Please select a date');
        return;
      }
      if (!newSchedule.shift) {
        toast.error('Please select a shift');
        return;
      }
      if (!newSchedule.startTime) {
        toast.error('Please enter start time');
        return;
      }
      if (!newSchedule.endTime) {
        toast.error('Please enter end time');
        return;
      }
      if (!newSchedule.department && !newSchedule.unit) {
        toast.error('Please select a department/unit');
        return;
      }

      // Find staff member to determine staffType
      const staffMember = staff.find(s => s.id === newSchedule.staffId);
      const scheduleData = {
        ...newSchedule,
        scheduleDate: newSchedule.date,
        department: newSchedule.unit || newSchedule.department,
        staffType: staffMember?.staffType || 'other'
      };

      const response = await api.post('/hospital/schedules', scheduleData);
      
      if (response.data.success) {
        setSchedules([...schedules, response.data.schedule]);
        setShowAddModal(false);
        setNewSchedule({
          staffId: '', date: '', shift: '', startTime: '', endTime: '',
          department: '', unit: '', notes: '', status: 'scheduled'
        });
        toast.success('Schedule added successfully');
        fetchSchedulesData();
      }
    } catch (error: any) {
      console.error('Error adding schedule:', error);
      toast.error(error.response?.data?.message || 'Failed to add schedule');
    }
  };

  const handleUpdateSchedule = async () => {
    try {
      const response = await api.put(`/hospital/schedules/${editingSchedule.id}`, editingSchedule);
      
      if (response.data.success) {
        setSchedules(schedules.map(s => s.id === editingSchedule.id ? response.data.schedule : s));
        setEditingSchedule(null);
        toast.success('Schedule updated successfully');
        fetchSchedulesData();
      }
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast.error(error.response?.data?.message || 'Failed to update schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await api.delete(`/hospital/schedules/${scheduleId}`);
      
      setSchedules(schedules.filter(s => s.id !== scheduleId));
      toast.success('Schedule deleted successfully');
      fetchSchedulesData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const staffMember = getStaffMember(schedule.staffId);
    const matchesDepartment = departmentFilter === 'all' || staffMember?.department === departmentFilter;
    const matchesShift = shiftFilter === 'all' || schedule.shift === shiftFilter;
    return matchesDepartment && matchesShift;
  });

  const scheduleStats = {
    total: schedules.length,
    scheduled: schedules.filter(s => s.status === 'scheduled').length,
    completed: schedules.filter(s => s.status === 'completed').length,
    cancelled: schedules.filter(s => s.status === 'cancelled').length,
    overtime: schedules.filter(s => s.status === 'overtime').length
  };

  const weekDays = getWeekDays();

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Staff Scheduling</h1>
          <p className="text-health-charcoal mt-2">Comprehensive staff scheduling and shift management</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/hospital/staff-directory')}>
            <Users className="w-4 h-4 mr-2" />
            Staff Directory
          </Button>
          <Button className="bg-health-aqua hover:bg-health-aqua/90 text-white" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Schedule
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-teal/10 rounded-lg">
                <Calendar className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Total Schedules</p>
                <p className="text-2xl font-bold text-health-teal">{scheduleStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-success/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-health-success" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Scheduled</p>
                <p className="text-2xl font-bold text-health-success">{scheduleStats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-teal/10 rounded-lg">
                <ClockIcon className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Completed</p>
                <p className="text-2xl font-bold text-health-teal">{scheduleStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Overtime</p>
                <p className="text-2xl font-bold text-yellow-600">{scheduleStats.overtime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{scheduleStats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar">Weekly Calendar</TabsTrigger>
          <TabsTrigger value="list">Schedule List</TabsTrigger>
          <TabsTrigger value="staff">Staff View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          {/* Calendar Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(currentDate);
                      newDate.setDate(currentDate.getDate() - 7);
                      setCurrentDate(newDate);
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">
                    {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(currentDate);
                      newDate.setDate(currentDate.getDate() + 7);
                      setCurrentDate(newDate);
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Calendar */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-8 gap-4">
                {/* Time column */}
                <div className="space-y-4">
                  <div className="h-12"></div>
                  {['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'].map((time) => (
                    <div key={time} className="h-20 text-sm text-gray-500 flex items-center font-medium">
                      {time}
                    </div>
                  ))}
                </div>

                {/* Days */}
                {weekDays.map((day, dayIndex) => (
                  <div key={dayIndex} className="space-y-4">
                    <div className="h-12 text-center">
                      <div className="text-sm font-medium">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`text-lg font-bold ${
                        day.toDateString() === new Date().toDateString() ? 'text-health-teal' : 'text-gray-700'
                      }`}>
                        {day.getDate()}
                      </div>
                    </div>
                    
                    {['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'].map((time, timeIndex) => {
                      const daySchedules = getSchedulesForDate(day);
                      
                      // Parse time slot (format: "6AM", "8PM", etc.)
                      const timeMatch = time.match(/(\d+)(AM|PM)/);
                      if (!timeMatch) return null;
                      
                      let slotStartHour = parseInt(timeMatch[1]);
                      const period = timeMatch[2];
                      
                      // Convert to 24-hour format
                      if (period === 'PM' && slotStartHour !== 12) {
                        slotStartHour += 12;
                      } else if (period === 'AM' && slotStartHour === 12) {
                        slotStartHour = 0;
                      }
                      const slotEndHour = slotStartHour + 2;
                      
                      // Filter schedules that overlap with this time slot
                      const timeSlotSchedules = daySchedules.filter(schedule => {
                        if (!schedule.startTime || !schedule.endTime) return false;
                        
                        // Parse start and end times (format: "HH:MM" or "HH:MM:SS")
                        // Times are stored in 24-hour format (e.g., "18:45" = 6:45 PM, "22:00" = 10:00 PM)
                        const startParts = schedule.startTime.split(':');
                        const endParts = schedule.endTime.split(':');
                        let startHour = parseInt(startParts[0]);
                        const startMinute = parseInt(startParts[1] || '0');
                        let endHour = parseInt(endParts[0]);
                        const endMinute = parseInt(endParts[1] || '0');
                        
                        // If times are in 12-hour format (e.g., "6:45" for 6:45 PM), we need to convert
                        // Check if shift is "evening" or "night" and hour is < 12, then it's PM
                        // But if hour is already >= 12, it's already in 24-hour format
                        if (startHour < 12 && (schedule.shift === 'evening' || schedule.shift === 'night')) {
                          // This is PM time in 12-hour format, convert to 24-hour
                          startHour += 12;
                        }
                        if (endHour < 12 && (schedule.shift === 'evening' || schedule.shift === 'night')) {
                          // This is PM time in 12-hour format, convert to 24-hour
                          endHour += 12;
                        }
                        
                        // Also handle if endHour is 22 (10 PM) but startHour is 6 (could be 6 AM or 6 PM)
                        // If endHour is >= 18 (6 PM) and startHour < 12, startHour is likely PM
                        if (endHour >= 18 && startHour < 12) {
                          startHour += 12;
                        }
                        
                        // Convert to minutes for easier comparison (now in 24-hour format)
                        const scheduleStartMinutes = startHour * 60 + startMinute;
                        const scheduleEndMinutes = endHour * 60 + endMinute;
                        const slotStartMinutes = slotStartHour * 60;
                        const slotEndMinutes = slotEndHour * 60;
                        
                        // Check if schedule overlaps with time slot
                        const overlaps = scheduleStartMinutes < slotEndMinutes && scheduleEndMinutes > slotStartMinutes;
                        
                        if (overlaps) {
                          console.log('Time match:', { 
                            time, 
                            slotRange: `${slotStartHour}:00-${slotEndHour}:00 (${slotStartMinutes}-${slotEndMinutes} min)`,
                            scheduleTime: `${schedule.startTime}-${schedule.endTime} (${scheduleStartMinutes}-${scheduleEndMinutes} min)`,
                            schedule: schedule.staffName,
                            startHour24: startHour,
                            endHour24: endHour,
                            shift: schedule.shift
                          });
                        }
                        return overlaps;
                      });
                      
                      if (daySchedules.length > 0 && timeSlotSchedules.length === 0) {
                        console.log(`Day ${day.toDateString()}, Time ${time}: Found ${daySchedules.length} schedules for day but none match time slot`);
                      }

                      const maxVisible = 2; // Maximum schedules to show before showing "more" indicator
                      const visibleSchedules = timeSlotSchedules.slice(0, maxVisible);
                      const remainingCount = timeSlotSchedules.length - maxVisible;

                      return (
                        <div key={timeIndex} className="h-20 border border-gray-200 rounded-lg p-1 overflow-y-auto min-h-[80px] flex flex-col">
                          <div className="space-y-1 flex-1 flex flex-col">
                            {visibleSchedules.map((schedule, scheduleIndex) => {
                              const staffMember = getStaffMember(schedule.staffId);
                              const shiftColors: { [key: string]: string } = {
                                'day': 'bg-blue-100 border-blue-300 text-blue-800',
                                'night': 'bg-purple-100 border-purple-300 text-purple-800',
                                'evening': 'bg-orange-100 border-orange-300 text-orange-800',
                                'on-call': 'bg-yellow-100 border-yellow-300 text-yellow-800'
                              };
                              const shiftColor = shiftColors[schedule.shift?.toLowerCase() || ''] || 'bg-health-aqua/10 border-health-aqua/20';
                              
                              return (
                                <div
                                  key={scheduleIndex}
                                  className={`text-xs p-1.5 rounded border cursor-pointer hover:opacity-80 transition-opacity ${shiftColor}`}
                                  onClick={() => {
                                    setSelectedStaff(staffMember);
                                    setEditingSchedule(schedule);
                                    setShowScheduleModal(true);
                                  }}
                                  title={`${staffMember?.firstName} ${staffMember?.lastName} - ${schedule.shift} shift`}
                                >
                                  <div className="font-medium truncate text-[10px] leading-tight">
                                    {staffMember?.firstName || 'Unknown'} {staffMember?.lastName || ''}
                                  </div>
                                  <div className="text-gray-600 truncate text-[9px] leading-tight mt-0.5">
                                    {schedule.shift} • {schedule.unit || schedule.department}
                                  </div>
                                  {schedule.startTime && schedule.endTime && (
                                    <div className="text-gray-500 text-[8px] mt-0.5">
                                      {schedule.startTime} - {schedule.endTime}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {remainingCount > 0 && (
                              <div
                                className="text-xs p-1.5 rounded bg-gray-100 border border-gray-300 cursor-pointer hover:bg-gray-200 text-center font-medium text-gray-700"
                                onClick={() => {
                                  setSelectedTimeSlotSchedules(timeSlotSchedules);
                                  setSelectedTimeSlot({ day, time });
                                  setShowTimeSlotModal(true);
                                }}
                                title={`${remainingCount} more schedule${remainingCount > 1 ? 's' : ''} - Click to view all`}
                              >
                                +{remainingCount} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={shiftFilter} onValueChange={setShiftFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shifts</SelectItem>
                    <SelectItem value="day">Day Shift</SelectItem>
                    <SelectItem value="evening">Evening Shift</SelectItem>
                    <SelectItem value="night">Night Shift</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Schedule List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Schedule List</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-teal"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSchedules.map((schedule) => {
                        const staffMember = getStaffMember(schedule.staffId);
                        return (
                          <TableRow key={schedule.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {staffMember?.firstName?.[0]}{staffMember?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{staffMember?.firstName} {staffMember?.lastName}</p>
                                  <p className="text-sm text-gray-500">{staffMember?.role}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(schedule.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge className={getShiftColor(schedule.shift)}>
                                {schedule.shift}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {schedule.startTime} - {schedule.endTime}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{schedule.department}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{schedule.unit}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(schedule.status)}>
                                {schedule.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedStaff(staffMember);
                                    setEditingSchedule(schedule);
                                    setShowScheduleModal(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingSchedule(schedule)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  {filteredSchedules.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No schedules found</p>
                      <p className="text-sm text-gray-400">Try adjusting your filters or add a new schedule</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map((member) => {
              const memberSchedules = schedules.filter(s => s.staffId === member.id);
              const todaySchedule = memberSchedules.find(s => s.date === new Date().toISOString().split('T')[0]);
              
              return (
                <Card key={member.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarFallback>
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-gray-500">{member.role} • {member.department}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {todaySchedule ? (
                        <div className="p-3 bg-health-aqua/10 border border-health-aqua/20 rounded-lg">
                          <p className="text-sm font-medium">Today's Schedule</p>
                          <p className="text-xs text-gray-600">
                            {todaySchedule.shift} • {todaySchedule.startTime} - {todaySchedule.endTime}
                          </p>
                          <p className="text-xs text-gray-600">{todaySchedule.unit}</p>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-500">No schedule for today</p>
                        </div>
                      )}
                      <div className="text-sm text-gray-600">
                        {memberSchedules.length} total schedules this week
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(scheduleStats).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          status === 'total' ? 'bg-health-teal' :
                          status === 'scheduled' ? 'bg-health-success' :
                          status === 'completed' ? 'bg-health-teal' :
                          status === 'cancelled' ? 'bg-health-danger' :
                          'bg-yellow-500'
                        }`}></div>
                        <span className="capitalize">{status}</span>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Schedules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedules
                    .filter(s => new Date(s.date) > new Date())
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 5)
                    .map((schedule) => {
                      const staffMember = getStaffMember(schedule.staffId);
                      return (
                        <div key={schedule.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {staffMember?.firstName?.[0]}{staffMember?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{staffMember?.firstName} {staffMember?.lastName}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(schedule.date).toLocaleDateString()} • {schedule.shift} • {schedule.unit}
                            </p>
                          </div>
                          <Badge className={getStatusColor(schedule.status)}>
                            {schedule.status}
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Schedule Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Schedule</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Staff Member</Label>
              <Select value={newSchedule.staffId} onValueChange={(value) => setNewSchedule({...newSchedule, staffId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} - {member.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={newSchedule.date}
                onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
              />
            </div>
            <div>
              <Label>Shift</Label>
              <Select value={newSchedule.shift} onValueChange={(value) => setNewSchedule({...newSchedule, shift: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day Shift</SelectItem>
                  <SelectItem value="evening">Evening Shift</SelectItem>
                  <SelectItem value="night">Night Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Time</Label>
              <Input
                type="time"
                value={newSchedule.startTime}
                onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
              />
            </div>
            <div>
              <Label>End Time</Label>
              <Input
                type="time"
                value={newSchedule.endTime}
                onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
              />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={newSchedule.department} onValueChange={(value) => setNewSchedule({...newSchedule, department: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="icu">ICU</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unit</Label>
              <Input
                value={newSchedule.unit}
                onChange={(e) => setNewSchedule({...newSchedule, unit: e.target.value})}
                placeholder="e.g., ICU-1, ER-2"
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={newSchedule.notes}
                onChange={(e) => setNewSchedule({...newSchedule, notes: e.target.value})}
                rows={3}
                placeholder="Additional notes or special instructions"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddSchedule}>Add Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Details Modal */}
      {selectedStaff && editingSchedule && (
        <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedStaff.firstName?.[0]}{selectedStaff.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedStaff.firstName} {selectedStaff.lastName}</h2>
                  <p className="text-sm text-gray-500">Schedule Details</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Schedule Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Date:</span> {new Date(editingSchedule.date).toLocaleDateString()}</p>
                    <p><span className="font-medium">Shift:</span> 
                      <Badge className={`ml-2 ${getShiftColor(editingSchedule.shift)}`}>
                        {editingSchedule.shift}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Time:</span> {editingSchedule.startTime} - {editingSchedule.endTime}</p>
                    <p><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getStatusColor(editingSchedule.status)}`}>
                        {editingSchedule.status}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Assignment</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Department:</span> {editingSchedule.department}</p>
                    <p><span className="font-medium">Unit:</span> {editingSchedule.unit}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Staff Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedStaff.firstName} {selectedStaff.lastName}</p>
                    <p><span className="font-medium">Role:</span> {selectedStaff.role}</p>
                    <p><span className="font-medium">Department:</span> {selectedStaff.department}</p>
                    <p><span className="font-medium">Phone:</span> {selectedStaff.phone}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Notes</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{editingSchedule.notes || 'No notes available'}</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleModal(false)}>Close</Button>
              <Button onClick={() => {
                setShowScheduleModal(false);
                setEditingSchedule(editingSchedule);
              }}>Edit Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Time Slot Schedules Modal - Shows all schedules for a specific time slot */}
      <Dialog open={showTimeSlotModal} onOpenChange={setShowTimeSlotModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Clock className="w-5 h-5" />
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedTimeSlot?.day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <p className="text-sm text-gray-500">{selectedTimeSlot?.time} - All Schedules</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {selectedTimeSlotSchedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No schedules found for this time slot</p>
              </div>
            ) : (
              selectedTimeSlotSchedules.map((schedule, index) => {
                const staffMember = getStaffMember(schedule.staffId);
                const shiftColors: { [key: string]: string } = {
                  'day': 'bg-blue-100 border-blue-300 text-blue-800',
                  'night': 'bg-purple-100 border-purple-300 text-purple-800',
                  'evening': 'bg-orange-100 border-orange-300 text-orange-800',
                  'on-call': 'bg-yellow-100 border-yellow-300 text-yellow-800'
                };
                const shiftColor = shiftColors[schedule.shift?.toLowerCase() || ''] || 'bg-gray-100 border-gray-300';
                
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${shiftColor} cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => {
                      setSelectedStaff(staffMember);
                      setEditingSchedule(schedule);
                      setShowTimeSlotModal(false);
                      setShowScheduleModal(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {staffMember?.firstName?.[0] || 'U'}{staffMember?.lastName?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">
                            {staffMember?.firstName || 'Unknown'} {staffMember?.lastName || ''}
                          </div>
                          <div className="text-sm text-gray-600">
                            {schedule.shift} shift • {schedule.unit || schedule.department}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        <Badge className={`mt-1 ${getStatusColor(schedule.status)}`}>
                          {schedule.status}
                        </Badge>
                      </div>
                    </div>
                    {schedule.notes && (
                      <div className="mt-2 text-sm text-gray-600 italic">
                        {schedule.notes}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeSlotModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffScheduling; 