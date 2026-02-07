import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Star, 
  TrendingUp, 
  Calendar, 
  Search, 
  Filter,
  Plus,
  Edit,
  Eye,
  Trash2,
  Award,
  Target,
  BarChart3
} from 'lucide-react';

interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  reviewDate: string;
  reviewer: string;
  overallRating: number;
  status: 'pending' | 'completed' | 'overdue';
  goals: string[];
  achievements: string[];
  areasForImprovement: string[];
  nextReviewDate: string;
}

const PerformanceReviews: React.FC = () => {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Mock data
  useEffect(() => {
    const mockReviews: PerformanceReview[] = [
      {
        id: '1',
        employeeId: 'EMP001',
        employeeName: 'Dr. Sarah Johnson',
        department: 'Cardiology',
        position: 'Senior Cardiologist',
        reviewDate: '2024-01-15',
        reviewer: 'Dr. Michael Chen',
        overallRating: 4.5,
        status: 'completed',
        goals: ['Improve patient satisfaction scores', 'Complete advanced certification'],
        achievements: ['Reduced readmission rates by 15%', 'Mentored 3 junior doctors'],
        areasForImprovement: ['Documentation timeliness', 'Team collaboration'],
        nextReviewDate: '2024-07-15'
      },
      {
        id: '2',
        employeeId: 'EMP002',
        employeeName: 'Nurse Emily Davis',
        department: 'Emergency',
        position: 'Charge Nurse',
        reviewDate: '2024-01-20',
        reviewer: 'Dr. Lisa Rodriguez',
        overallRating: 4.2,
        status: 'completed',
        goals: ['Lead emergency response training', 'Improve triage efficiency'],
        achievements: ['Implemented new triage protocol', 'Reduced wait times by 20%'],
        areasForImprovement: ['Stress management', 'Advanced life support skills'],
        nextReviewDate: '2024-07-20'
      }
    ];
    setReviews(mockReviews);
    setLoading(false);
  }, []);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || review.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading performance reviews...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Reviews</h1>
          <p className="text-gray-600 mt-2">Manage and track employee performance evaluations</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Review
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.filter(r => r.status === 'overdue').length}
                </p>
              </div>
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
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by employee name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Cardiology">Cardiology</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Surgery">Surgery</SelectItem>
                <SelectItem value="Pediatrics">Pediatrics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Employee</th>
                  <th className="text-left p-4">Department</th>
                  <th className="text-left p-4">Review Date</th>
                  <th className="text-left p-4">Rating</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{review.employeeName}</p>
                        <p className="text-sm text-gray-500">{review.employeeId}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{review.department}</p>
                        <p className="text-sm text-gray-500">{review.position}</p>
                      </div>
                    </td>
                    <td className="p-4">{review.reviewDate}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <Star className={`w-4 h-4 ${getRatingColor(review.overallRating)}`} />
                        <span className={`ml-1 font-medium ${getRatingColor(review.overallRating)}`}>
                          {review.overallRating}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(review.status)}>
                        {review.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReview(review);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Review Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Performance Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Employee</Label>
                  <p className="text-lg font-medium">{selectedReview.employeeName}</p>
                  <p className="text-sm text-gray-500">{selectedReview.employeeId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Department</Label>
                  <p className="text-lg font-medium">{selectedReview.department}</p>
                  <p className="text-sm text-gray-500">{selectedReview.position}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Review Date</Label>
                  <p className="text-lg font-medium">{selectedReview.reviewDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Overall Rating</Label>
                  <div className="flex items-center">
                    <Star className={`w-5 h-5 ${getRatingColor(selectedReview.overallRating)}`} />
                    <span className={`ml-1 text-lg font-medium ${getRatingColor(selectedReview.overallRating)}`}>
                      {selectedReview.overallRating}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Goals</Label>
                <ul className="mt-2 space-y-1">
                  {selectedReview.goals.map((goal, index) => (
                    <li key={index} className="flex items-center">
                      <Target className="w-4 h-4 text-blue-600 mr-2" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Achievements</Label>
                <ul className="mt-2 space-y-1">
                  {selectedReview.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-center">
                      <Award className="w-4 h-4 text-green-600 mr-2" />
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Areas for Improvement</Label>
                <ul className="mt-2 space-y-1">
                  {selectedReview.areasForImprovement.map((area, index) => (
                    <li key={index} className="flex items-center">
                      <BarChart3 className="w-4 h-4 text-yellow-600 mr-2" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Review Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Performance Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeName">Employee Name</Label>
                <Input id="employeeName" placeholder="Enter employee name" />
              </div>
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input id="employeeId" placeholder="Enter employee ID" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input id="position" placeholder="Enter position" />
              </div>
            </div>
            <div>
              <Label htmlFor="goals">Goals</Label>
              <Textarea id="goals" placeholder="Enter goals (one per line)" />
            </div>
            <div>
              <Label htmlFor="achievements">Achievements</Label>
              <Textarea id="achievements" placeholder="Enter achievements (one per line)" />
            </div>
            <div>
              <Label htmlFor="improvements">Areas for Improvement</Label>
              <Textarea id="improvements" placeholder="Enter areas for improvement (one per line)" />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Save Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PerformanceReviews; 