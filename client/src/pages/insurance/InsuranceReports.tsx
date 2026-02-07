
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import insuranceReportService from '@/services/insuranceReportService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { FileText, Download, RefreshCw, Plus } from 'lucide-react';

const InsuranceReports = () => {
  const { toast } = useToast();
  const [financial, setFinancial] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [compliance, setCompliance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [fin, perf, comp] = await Promise.all([
        insuranceReportService.getFinancialReports(),
        insuranceReportService.getPerformanceReports(),
        insuranceReportService.getComplianceReports()
      ]);
      setFinancial(fin);
      setPerformance(perf);
      setCompliance(comp);
      setError(null);
    } catch (err) {
      setError('Failed to load reports');
      toast({ title: 'Error', description: 'Failed to load reports', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleExport = async (type: string, data: any, format: 'csv' | 'pdf', title: string) => {
    setLoading(true);
    setExportUrl(null);
    try {
      const response = await insuranceReportService.generateReport({
        type,
        data,
        format,
        title
      });
      setExportUrl(response.url);
      toast({ title: 'Export Ready', description: 'Download link generated.' });
    } catch (err) {
      toast({ title: 'Export Failed', description: 'Could not export report.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Insurance Reports</h1>
          <p className="text-health-charcoal mt-2">Generate, manage, and analyze comprehensive insurance reports and analytics</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-health-teal text-health-teal hover:bg-health-teal hover:text-white" onClick={loadReports} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button className="bg-health-teal hover:bg-health-teal/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {error && <div className="text-red-600">{error}</div>}
      {loading && <div className="text-health-teal">Loading...</div>}

      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Financial Tab */}
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Report</CardTitle>
            </CardHeader>
            <CardContent>
              {financial && (
                <>
                  <div className="flex space-x-2 mb-4">
                    <Button onClick={() => handleExport('financial', financial, 'pdf', 'Financial Report')}>Export as PDF</Button>
                    <Button onClick={() => handleExport('financial', financial, 'csv', 'Financial Report')}>Export as CSV</Button>
                    {exportUrl && <a href={exportUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">Download Report</a>}
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={financial.premiumData.map((item: any) => ({
                        month: insuranceReportService.getMonthName(item._id.month) + ' ' + item._id.year,
                        premium: item.totalPremium,
                        policies: item.policyCount
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="premium" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.1} name="Premium" />
                      <Area type="monotone" dataKey="policies" stroke="#10B981" fill="#10B981" fillOpacity={0.1} name="Policies" />
                    </AreaChart>
                  </ResponsiveContainer>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Report</CardTitle>
            </CardHeader>
            <CardContent>
              {performance && (
                <>
                  <div className="flex space-x-2 mb-4">
                    <Button onClick={() => handleExport('performance', performance, 'pdf', 'Performance Report')}>Export as PDF</Button>
                    <Button onClick={() => handleExport('performance', performance, 'csv', 'Performance Report')}>Export as CSV</Button>
                    {exportUrl && <a href={exportUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">Download Report</a>}
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={performance.claimProcessing.map((item: any) => ({
                        status: item._id,
                        count: item.count,
                        avgProcessingTime: item.avgProcessingTime
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0EA5E9" name="Claims" />
                      <Bar dataKey="avgProcessingTime" fill="#10B981" name="Avg Processing Time (days)" />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Report</CardTitle>
            </CardHeader>
            <CardContent>
              {compliance && (
                <>
                  <div className="flex space-x-2 mb-4">
                    <Button onClick={() => handleExport('compliance', compliance, 'pdf', 'Compliance Report')}>Export as PDF</Button>
                    <Button onClick={() => handleExport('compliance', compliance, 'csv', 'Compliance Report')}>Export as CSV</Button>
                    {exportUrl && <a href={exportUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">Download Report</a>}
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={compliance.claimAudits.map((item: any) => ({
                        status: item._id,
                        count: item.count,
                        flagged: item.flaggedCount
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0EA5E9" name="Claims" />
                      <Bar dataKey="flagged" fill="#F59E0B" name="Flagged" />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsuranceReports;
