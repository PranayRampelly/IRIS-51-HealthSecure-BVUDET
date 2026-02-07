import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, DollarSign, Users, Package, RefreshCw, Calendar as CalendarIcon, Filter, BarChart3, Star, ShoppingCart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import pharmacyService from '@/services/pharmacyService';

const Reports: React.FC = () => {
  const [since, setSince] = useState<string>(() => new Date(Date.now() - 30*24*60*60*1000).toISOString().substring(0,10));
  const [until, setUntil] = useState<string>(() => new Date().toISOString().substring(0,10));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    byStatus: Array<{ _id: string; count: number; total: number }>;
    revenueByDay: Array<{ _id: string; total: number }>;
    topItems: Array<{ _id: string; name: string; quantity: number; revenue: number }>;
    customers: Array<{ _id: string; orders: number; total: number }>;
  }>({ byStatus: [], revenueByDay: [], topItems: [], customers: [] });

  const load = async () => {
    setLoading(true);
    try {
      const res = await pharmacyService.getReports({ since, until });
      setData(res);
    } catch (error: any) {
      console.error('Failed to load reports:', error);
      if (error.response?.status === 401) {
        alert('Please log in as a pharmacy user to access reports.');
      } else if (error.response?.status === 500) {
        alert('Server error. Please check if you are logged in as a pharmacy user.');
      } else {
        alert('Failed to load reports. Please try again.');
      }
      // Set default empty data to prevent crashes
      setData({ byStatus: [], revenueByDay: [], topItems: [], customers: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalRevenue = useMemo(() => {
    if (!data || !data.revenueByDay) return 0;
    return data.revenueByDay.reduce((s, d) => s + (d.total || 0), 0);
  }, [data]);

  return (
    <div className="space-y-4 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header */}
      <div className="bg-health-teal rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2"><BarChart3 className="w-7 h-7" /> Pharmacy Reports</h1>
            <p className="text-white/80 mt-2">Monitor revenue, orders, and top-performing items</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-health-charcoal">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <Label className="text-xs text-health-blue-gray">Since</Label>
            <Input type="date" value={since} onChange={(e) => setSince(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-health-blue-gray">Until</Label>
            <Input type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
          </div>
          <Select defaultValue="all">
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div className="md:col-span-2 flex items-end">
            <Button className="bg-health-aqua" onClick={load} disabled={loading}>Apply</Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-health-blue-gray">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold text-health-charcoal">₹{totalRevenue.toFixed(2)}</div>
            <DollarSign className="w-6 h-6 text-health-aqua" />
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-health-blue-gray">Orders</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold text-health-charcoal">{data?.byStatus?.reduce((s, b) => s + (b.count || 0), 0) || 0}</div>
            <ShoppingCart className="w-6 h-6 text-health-aqua" />
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-health-blue-gray">Active Customers</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold text-health-charcoal">{data?.customers?.length || 0}</div>
            <Users className="w-6 h-6 text-health-aqua" />
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-health-blue-gray">Days Tracked</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold text-health-charcoal">{data?.revenueByDay?.length || 0}</div>
            <CalendarIcon className="w-6 h-6 text-health-aqua" />
          </CardContent>
        </Card>
      </div>

      {/* Orders by Status */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-health-charcoal">Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data?.byStatus || []).map((s) => (
              <div key={s._id} className="p-4 rounded-lg border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-health-charcoal capitalize">{s._id}</div>
                  <div className="text-sm text-health-blue-gray">₹{s.total.toFixed(2)}</div>
                </div>
                <div className="text-2xl font-bold text-health-charcoal">{s.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Day */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-health-charcoal">Revenue by Day</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(data?.revenueByDay || []).map((d) => (
            <div key={d._id} className="flex items-center gap-4">
              <div className="w-28 text-sm text-health-blue-gray">{d._id}</div>
              <div className="flex-1 bg-health-light-gray h-3 rounded">
                <div className="bg-health-aqua h-3 rounded" style={{ width: `${Math.min(100, (d.total / Math.max(1, totalRevenue)) * 100)}%` }} />
              </div>
              <div className="w-24 text-right text-sm">₹{d.total.toFixed(2)}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Items & Top Customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-health-charcoal">Top Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.topItems || []).map((i) => (
                  <TableRow key={i._id}>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell className="text-health-blue-gray">{i._id}</TableCell>
                    <TableCell>{i.quantity}</TableCell>
                    <TableCell className="text-right">₹{i.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-health-charcoal">Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.customers || []).map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c._id}</TableCell>
                    <TableCell>{c.orders}</TableCell>
                    <TableCell className="text-right">₹{c.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;



