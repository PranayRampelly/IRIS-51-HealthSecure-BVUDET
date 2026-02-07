import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, CreditCard, FileText, Clock, 
  CheckCircle, AlertTriangle, TrendingUp, Users
} from 'lucide-react';

const HospitalBilling: React.FC = () => {
  const billingData = {
    totalRevenue: 284750,
    pendingAmount: 45680,
    collectedAmount: 239070,
    outstandingClaims: 23,
    averagePaymentTime: 15
  };

  const bills = [
    {
      id: 1,
      patientName: 'John Smith',
      patientId: 'P001',
      amount: 2500,
      status: 'paid',
      dueDate: '2024-01-25',
      paymentDate: '2024-01-20',
      insurance: 'Blue Cross',
      services: ['Room Charges', 'Medication', 'Lab Tests'],
      department: 'Cardiology'
    },
    {
      id: 2,
      patientName: 'Sarah Wilson',
      patientId: 'P002',
      amount: 1800,
      status: 'pending',
      dueDate: '2024-01-30',
      paymentDate: null,
      insurance: 'Aetna',
      services: ['Surgery', 'Anesthesia', 'Post-op Care'],
      department: 'Orthopedics'
    },
    {
      id: 3,
      patientName: 'Mike Brown',
      patientId: 'P003',
      amount: 3200,
      status: 'overdue',
      dueDate: '2024-01-15',
      paymentDate: null,
      insurance: 'Cigna',
      services: ['Emergency Care', 'ICU', 'Medication'],
      department: 'Emergency'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Invoicing</h1>
          <p className="text-gray-600 mt-2">Manage hospital billing and payment processing</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button>
            <DollarSign className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingData.collectedAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Successfully collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingData.pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Claims</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingData.outstandingClaims}</div>
            <p className="text-xs text-muted-foreground">
              Insurance claims pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Payment Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingData.averagePaymentTime} days</div>
            <p className="text-xs text-muted-foreground">
              Average collection time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Billing List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bills.map((bill) => (
              <div key={bill.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{bill.patientName}</h3>
                      <p className="text-sm text-gray-600">
                        ID: {bill.patientId} • {bill.department}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">${bill.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">
                        Due: {bill.dueDate}
                      </p>
                    </div>
                    
                    <Badge className={getStatusColor(bill.status)}>
                      {bill.status}
                    </Badge>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <CreditCard className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Insurance</p>
                    <p className="font-medium">{bill.insurance}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Services</p>
                    <p className="font-medium">{bill.services.length} items</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Date</p>
                    <p className="font-medium">
                      {bill.paymentDate ? bill.paymentDate : 'Not paid'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-medium capitalize">{bill.status}</p>
                  </div>
                </div>
                
                {bill.services.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Services:</p>
                    <div className="flex flex-wrap gap-2">
                      {bill.services.map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalBilling; 