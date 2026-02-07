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
  GraduationCap, BookOpen, Users, Calendar, Clock, CheckCircle,
  Search, Plus, Eye, Edit, Trash2, Phone, Mail, MapPin, User,
  Award, Star, TrendingUp, Download, Filter, ArrowRight,
  Shield, Activity, Thermometer, Pill, Syringe, Bed,
  Play, Pause, Square, FileText, Video, Headphones, Monitor, Stethoscope
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';

const StaffTraining: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [trainings, setTrainings] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<any>(null);
  const [newTraining, setNewTraining] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    instructor: '',
    location: '',
    maxParticipants: '',
    startDate: '',
    endDate: '',
    status: 'upcoming',
    materials: '',
    objectives: '',
    prerequisites: '',
    notes: ''
  });

  useEffect(() => {
    fetchTrainingsData();
    fetchStaffData();
  }, []);

  const fetchTrainingsData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hospital/trainings');
      if (response.data.success) {
        setTrainings(response.data.trainings || []);
      } else {
        setTrainings([]);
      }
    } catch (error) {
      console.error('Error fetching trainings data:', error);
      setTrainings([]);
      toast.error('Failed to load trainings data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffData = async () => {
    try {
      const response = await api.get('/hospital/staff');
      if (response.data.success) {
        setStaff(response.data.staff || []);
      } else {
        setStaff([]);
      }
    } catch (error) {
      console.error('Error fetching staff data:', error);
      setStaff([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500 text-white';
      case 'ongoing': return 'bg-health-aqua text-white';
      case 'completed': return 'bg-health-success text-white';
      case 'cancelled': return 'bg-health-danger text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'clinical': return <Stethoscope className="w-4 h-4" />;
      case 'safety': return <Shield className="w-4 h-4" />;
      case 'technology': return <Monitor className="w-4 h-4" />;
      case 'leadership': return <Users className="w-4 h-4" />;
      case 'compliance': return <FileText className="w-4 h-4" />;
      default: return <GraduationCap className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'clinical': return 'bg-blue-100 text-blue-800';
      case 'safety': return 'bg-red-100 text-red-800';
      case 'technology': return 'bg-purple-100 text-purple-800';
      case 'leadership': return 'bg-green-100 text-green-800';
      case 'compliance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || training.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || training.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddTraining = async () => {
    try {
      const response = await api.post('/hospital/trainings', newTraining);
      
      if (response.data.success) {
        setTrainings([...trainings, response.data.training]);
        setShowAddModal(false);
        setNewTraining({
          title: '', description: '', category: '', duration: '', instructor: '', location: '',
          maxParticipants: '', startDate: '', endDate: '', status: 'upcoming', materials: '',
          objectives: '', prerequisites: '', notes: ''
        });
        toast.success('Training added successfully');
        fetchTrainingsData();
      }
    } catch (error: any) {
      console.error('Error adding training:', error);
      toast.error(error.response?.data?.message || 'Failed to add training');
    }
  };

  const handleUpdateTraining = async () => {
    try {
      const response = await api.put(`/hospital/trainings/${editingTraining.id}`, editingTraining);
      
      if (response.data.success) {
        setTrainings(trainings.map(t => t.id === editingTraining.id ? response.data.training : t));
        setEditingTraining(null);
        toast.success('Training updated successfully');
        fetchTrainingsData();
      }
    } catch (error: any) {
      console.error('Error updating training:', error);
      toast.error(error.response?.data?.message || 'Failed to update training');
    }
  };

  const handleDeleteTraining = async (trainingId: string) => {
    if (!confirm('Are you sure you want to delete this training?')) return;
    
    try {
      await api.delete(`/hospital/trainings/${trainingId}`);
      
      setTrainings(trainings.filter(t => t.id !== trainingId));
      toast.success('Training deleted successfully');
      fetchTrainingsData();
    } catch (error) {
      console.error('Error deleting training:', error);
      toast.error('Failed to delete training');
    }
  };

  const trainingStats = {
    total: trainings.length,
    upcoming: trainings.filter(t => t.status === 'upcoming').length,
    ongoing: trainings.filter(t => t.status === 'ongoing').length,
    completed: trainings.filter(t => t.status === 'completed').length,
    cancelled: trainings.filter(t => t.status === 'cancelled').length
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Staff Training</h1>
          <p className="text-health-charcoal mt-2">Comprehensive staff training and development management</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/hospital/performance-reviews')}>
            <Award className="w-4 h-4 mr-2" />
            Performance
          </Button>
          <Button className="bg-health-aqua hover:bg-health-aqua/90 text-white" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Training
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-teal/10 rounded-lg">
                <GraduationCap className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Total Trainings</p>
                <p className="text-2xl font-bold text-health-teal">{trainingStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{trainingStats.upcoming}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-aqua/10 rounded-lg">
                <Play className="w-6 h-6 text-health-aqua" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Ongoing</p>
                <p className="text-2xl font-bold text-health-aqua">{trainingStats.ongoing}</p>
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
                <p className="text-sm text-health-charcoal">Completed</p>
                <p className="text-2xl font-bold text-health-success">{trainingStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                                        <Square className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{trainingStats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="trainings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trainings">All Trainings</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="trainings" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search trainings by title, description, or instructor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="clinical">Clinical</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Trainings Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5" />
                <span>Training Programs</span>
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
                        <TableHead>Training</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrainings.map((training) => (
                        <TableRow key={training.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{training.title}</p>
                              <p className="text-sm text-gray-500">{training.description}</p>
                              <p className="text-xs text-gray-400">{training.location}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getCategoryIcon(training.category)}
                              <Badge className={getCategoryColor(training.category)}>
                                {training.category}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {training.instructor?.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{training.instructor}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{training.duration}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{new Date(training.startDate).toLocaleDateString()}</p>
                              <p className="text-gray-500">to {new Date(training.endDate).toLocaleDateString()}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(training.status)}>
                              {training.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTraining(training);
                                  setShowTrainingModal(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingTraining(training)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTraining(training.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {filteredTrainings.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No trainings found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { category: 'Clinical', count: trainings.filter(t => t.category === 'clinical').length, color: 'bg-blue-500', icon: <Stethoscope className="w-6 h-6" /> },
              { category: 'Safety', count: trainings.filter(t => t.category === 'safety').length, color: 'bg-red-500', icon: <Shield className="w-6 h-6" /> },
              { category: 'Technology', count: trainings.filter(t => t.category === 'technology').length, color: 'bg-purple-500', icon: <Monitor className="w-6 h-6" /> },
              { category: 'Leadership', count: trainings.filter(t => t.category === 'leadership').length, color: 'bg-green-500', icon: <Users className="w-6 h-6" /> },
              { category: 'Compliance', count: trainings.filter(t => t.category === 'compliance').length, color: 'bg-orange-500', icon: <FileText className="w-6 h-6" /> },
              { category: 'General', count: trainings.filter(t => !['clinical', 'safety', 'technology', 'leadership', 'compliance'].includes(t.category)).length, color: 'bg-gray-500', icon: <GraduationCap className="w-6 h-6" /> },
            ].map((cat) => (
              <Card key={cat.category} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${cat.color} text-white`}>
                      {cat.icon}
                    </div>
                    <span>{cat.category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Trainings</span>
                      <span className="font-semibold">{cat.count}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {cat.count > 0 ? `${cat.count} training programs` : 'No trainings in this category'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Training Calendar</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Training calendar coming soon</p>
                <p className="text-sm text-gray-400">View all upcoming and ongoing training sessions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(trainingStats).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          status === 'total' ? 'bg-health-teal' :
                          status === 'upcoming' ? 'bg-blue-500' :
                          status === 'ongoing' ? 'bg-health-aqua' :
                          status === 'completed' ? 'bg-health-success' :
                          'bg-red-500'
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
                <CardTitle>Upcoming Trainings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainings
                    .filter(t => new Date(t.startDate) > new Date())
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                    .slice(0, 5)
                    .map((training) => (
                    <div key={training.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded-lg ${getCategoryColor(training.category).replace('bg-', 'bg-').replace(' text-', ' text-')}`}>
                        {getCategoryIcon(training.category)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{training.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(training.startDate).toLocaleDateString()} • {training.instructor}
                        </p>
                      </div>
                      <Badge className={getStatusColor(training.status)}>
                        {training.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Training Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Training</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Training Title</Label>
              <Input
                value={newTraining.title}
                onChange={(e) => setNewTraining({...newTraining, title: e.target.value})}
                placeholder="Enter training title"
              />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={newTraining.description}
                onChange={(e) => setNewTraining({...newTraining, description: e.target.value})}
                rows={3}
                placeholder="Training description"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={newTraining.category} onValueChange={(value) => setNewTraining({...newTraining, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinical">Clinical</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration</Label>
              <Input
                value={newTraining.duration}
                onChange={(e) => setNewTraining({...newTraining, duration: e.target.value})}
                placeholder="e.g., 2 hours, 1 day"
              />
            </div>
            <div>
              <Label>Instructor</Label>
              <Input
                value={newTraining.instructor}
                onChange={(e) => setNewTraining({...newTraining, instructor: e.target.value})}
                placeholder="Instructor name"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={newTraining.location}
                onChange={(e) => setNewTraining({...newTraining, location: e.target.value})}
                placeholder="Training location"
              />
            </div>
            <div>
              <Label>Max Participants</Label>
              <Input
                value={newTraining.maxParticipants}
                onChange={(e) => setNewTraining({...newTraining, maxParticipants: e.target.value})}
                type="number"
                placeholder="Maximum participants"
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newTraining.startDate}
                onChange={(e) => setNewTraining({...newTraining, startDate: e.target.value})}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={newTraining.endDate}
                onChange={(e) => setNewTraining({...newTraining, endDate: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <Label>Objectives</Label>
              <Textarea
                value={newTraining.objectives}
                onChange={(e) => setNewTraining({...newTraining, objectives: e.target.value})}
                rows={2}
                placeholder="Training objectives"
              />
            </div>
            <div className="col-span-2">
              <Label>Prerequisites</Label>
              <Textarea
                value={newTraining.prerequisites}
                onChange={(e) => setNewTraining({...newTraining, prerequisites: e.target.value})}
                rows={2}
                placeholder="Prerequisites for this training"
              />
            </div>
            <div className="col-span-2">
              <Label>Materials</Label>
              <Textarea
                value={newTraining.materials}
                onChange={(e) => setNewTraining({...newTraining, materials: e.target.value})}
                rows={2}
                placeholder="Required materials or resources"
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={newTraining.notes}
                onChange={(e) => setNewTraining({...newTraining, notes: e.target.value})}
                rows={2}
                placeholder="Additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddTraining}>Add Training</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Training Details Modal */}
      {selectedTraining && (
        <Dialog open={showTrainingModal} onOpenChange={setShowTrainingModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getCategoryColor(selectedTraining.category).replace('bg-', 'bg-').replace(' text-', ' text-')}`}>
                  {getCategoryIcon(selectedTraining.category)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedTraining.title}</h2>
                  <p className="text-sm text-gray-500">{selectedTraining.category} Training</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Training Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Duration:</span> {selectedTraining.duration}</p>
                    <p><span className="font-medium">Instructor:</span> {selectedTraining.instructor}</p>
                    <p><span className="font-medium">Location:</span> {selectedTraining.location}</p>
                    <p><span className="font-medium">Max Participants:</span> {selectedTraining.maxParticipants}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Schedule</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Start Date:</span> {new Date(selectedTraining.startDate).toLocaleDateString()}</p>
                    <p><span className="font-medium">End Date:</span> {new Date(selectedTraining.endDate).toLocaleDateString()}</p>
                    <Badge className={getStatusColor(selectedTraining.status)}>
                      {selectedTraining.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Objectives</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{selectedTraining.objectives || 'No objectives specified'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Prerequisites</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{selectedTraining.prerequisites || 'No prerequisites'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Materials</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{selectedTraining.materials || 'No materials specified'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Description</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedTraining.description}</p>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedTraining.notes || 'No notes available'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTrainingModal(false)}>Close</Button>
              <Button onClick={() => {
                setShowTrainingModal(false);
                setEditingTraining(selectedTraining);
              }}>Edit Training</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StaffTraining; 