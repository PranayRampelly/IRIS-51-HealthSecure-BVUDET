
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

const AdminUserEdit = () => {
  const { userId } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admin/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Edit User</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete User
          </Button>
          <Button className="bg-health-teal hover:bg-health-teal/90">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="john.doe@example.com" />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="patient">
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label htmlFor="organization">Organization</Label>
                  <Input id="organization" placeholder="Hospital, clinic, or company" />
                </div>

                <div>
                  <Label htmlFor="licenseNumber">License Number (if applicable)</Label>
                  <Input id="licenseNumber" placeholder="Medical license or certification number" />
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="canRequestProofs" defaultChecked />
                  <Label htmlFor="canRequestProofs">Can request medical proofs</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="canVerifyProofs" defaultChecked />
                  <Label htmlFor="canVerifyProofs">Can verify proofs</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="canAccessAuditLogs" />
                  <Label htmlFor="canAccessAuditLogs">Can access audit logs</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="canManageUsers" />
                  <Label htmlFor="canManageUsers">Can manage users</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="canExportData" />
                  <Label htmlFor="canExportData">Can export data</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="emailVerified" defaultChecked />
                  <Label htmlFor="emailVerified">Email verified</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="twoFactorEnabled" defaultChecked />
                  <Label htmlFor="twoFactorEnabled">Two-factor authentication enabled</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="complianceTrainingComplete" />
                  <Label htmlFor="complianceTrainingComplete">Compliance training complete</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-health-charcoal">Created</span>
                  <span className="text-health-teal">Jan 15, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-health-charcoal">Last Login</span>
                  <span className="text-health-teal">2 hours ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-health-charcoal">Total Logins</span>
                  <span className="text-health-teal">247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-health-charcoal">Proofs Requested</span>
                  <span className="text-health-teal">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-health-charcoal">Proofs Generated</span>
                  <span className="text-health-teal">8</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="text-health-charcoal">
                  <span className="font-medium">Login:</span> 2 hours ago
                </div>
                <div className="text-health-charcoal">
                  <span className="font-medium">Proof requested:</span> Yesterday
                </div>
                <div className="text-health-charcoal">
                  <span className="font-medium">Profile updated:</span> 3 days ago
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminUserEdit;
