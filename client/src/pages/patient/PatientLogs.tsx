
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Activity, Search, Filter, Eye, Download, Shield, Database, User, FileText, 
  Calendar, Clock, AlertTriangle, CheckCircle, XCircle, MoreHorizontal,
  RefreshCw, Save, Trash2, ExternalLink, Bell, Settings, BarChart3,
  TrendingUp, TrendingDown, Wifi, WifiOff, Zap, FilterX, CalendarDays, Key, Share2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import apiService from '@/services/api';
import realtimeService from '@/services/realtimeService';

interface Log {
  _id: string;
  timestamp: string;
  type: string;
  action: string;
  entity: string;
  details: string;
  ipAddress: string;
  userAgent?: string;
  resourceId?: string;
  resourceType?: string;
  status?: string;
  originalLog?: any; // For detailed view
}

const PatientLogs = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [selectedLogs, setSelectedLogs] = useState(new Set<string>());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    proofs: 0,
    auth: 0,
    access: 0,
    updates: 0,
    shares: 0
  });
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [realTimeStatus, setRealTimeStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [viewMode, setViewMode] = useState('table'); // table, timeline
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(30); // seconds
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const reconnectTimeout = useRef(null);
  const reconnectAttempts = useRef(0);
  const lastToastTime = useRef(0);
  const toastCooldown = 3000; // 3 seconds cooldown between toasts

  // Initial data fetch and WebSocket setup
  useEffect(() => {
    // Set up WebSocket listeners
    const messageHandler = (data: any) => {
      if (data.type === 'log') {
        setLogs(prevLogs => {
          // Check if log already exists
          const exists = prevLogs.some(log => log._id === data.log._id);
          if (exists) return prevLogs;
          
          // Add new log at the beginning
          const newLogs = [data.log, ...prevLogs];
          const filtered = applyFilters(newLogs, { searchQuery, typeFilter, actionFilter, dateRange });
          setFilteredLogs(filtered);
          updateStats(data.log);
          return newLogs;
        });
      } else if (data.type === 'logs_deleted') {
        // Remove deleted logs from state
        const deletedLogIds = new Set(data.logIds);
        setLogs(prevLogs => prevLogs.filter(log => !deletedLogIds.has(log._id)));
        setFilteredLogs(prevFiltered => prevFiltered.filter(log => !deletedLogIds.has(log._id)));
      } else if (data.type === 'log_created') {
        // Add new log to state
        const newLog = data.log;
        setLogs(prevLogs => [newLog, ...prevLogs]);
        setFilteredLogs(prevFiltered => {
          const updatedLogs = [newLog, ...prevFiltered];
          return applyFilters(updatedLogs, { searchQuery, typeFilter, actionFilter, dateRange });
        });
      } else if (data.type === 'log_updated') {
        // Update existing log
        const updatedLog = data.log;
        setLogs(prevLogs => prevLogs.map(log => 
          log._id === updatedLog._id ? updatedLog : log
        ));
        setFilteredLogs(prevFiltered => {
          const updatedLogs = prevFiltered.map(log => 
            log._id === updatedLog._id ? updatedLog : log
          );
          return applyFilters(updatedLogs, { searchQuery, typeFilter, actionFilter, dateRange });
        });
      }
    };

    const connectionHandler = (status: 'connected' | 'disconnected') => {
      setRealTimeStatus(status);
      const now = Date.now();
      if (now - lastToastTime.current > toastCooldown) {
        if (status === 'disconnected') {
          toast.error('Real-time connection lost', {
            description: 'Attempting to reconnect...'
          });
        }
        lastToastTime.current = now;
      }
    };

    // Add listeners
    const removeMessageListener = realtimeService.addListener(messageHandler);
    const removeConnectionListener = realtimeService.addConnectionListener(connectionHandler);

    // Connect to WebSocket
    const token = localStorage.getItem('token');
    if (token) {
      realtimeService.connect(token);
    }

    // Initial data fetch
    fetchLogs();

    // Cleanup
    return () => {
      removeMessageListener();
      removeConnectionListener();
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Handle auto-refresh
  useEffect(() => {
    if (!autoRefresh || autoRefreshInterval <= 0) {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      return;
    }

    const scheduleNextRefresh = () => {
      const timeSinceLastRefresh = Date.now() - lastRefresh;
      const nextRefreshDelay = Math.max(0, (autoRefreshInterval * 1000) - timeSinceLastRefresh);

      refreshTimeoutRef.current = setTimeout(() => {
        fetchLogs();
        setLastRefresh(Date.now());
        scheduleNextRefresh();
      }, nextRefreshDelay);
    };

    scheduleNextRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, autoRefreshInterval, lastRefresh]);

  const updateStats = (logData: Log) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const newStats = {
      total: logs.length,
      today: logs.filter(log => new Date(log.timestamp) >= today).length,
      proofs: logs.filter(log => log.action?.toLowerCase().includes('proof')).length,
      auth: logs.filter(log => log.action?.toLowerCase().includes('login') || log.action?.toLowerCase().includes('logout')).length,
      access: logs.filter(log => log.action?.toLowerCase().includes('view')).length,
      updates: logs.filter(log => log.action?.toLowerCase().includes('update') || log.action?.toLowerCase().includes('create')).length,
      shares: logs.filter(log => log.action?.toLowerCase().includes('share')).length
    };

    setStats(newStats);
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAccessLogs();
      if (response.logs) {
        setLogs(response.logs);
        setFilteredLogs(applyFilters(response.logs, { searchQuery, typeFilter, actionFilter, dateRange }));
        updateStats(response.logs[0]); // Assuming the first log is representative for stats
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      toast.error('Failed to fetch access logs');
      // Clear logs on error
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (logsToFilter: Log[], filters: { 
    searchQuery: string, 
    typeFilter: string, 
    actionFilter: string, 
    dateRange: { start: Date | null, end: Date | null } 
  }) => {
    // Apply search filter
    let filtered = logsToFilter;
    if (filters.searchQuery) {
      filtered = filtered.filter(log => 
        Object.values(log).some(value => 
          String(value).toLowerCase().includes(filters.searchQuery.toLowerCase())
        )
      );
    }

    // Apply type filter
    if (filters.typeFilter && filters.typeFilter !== 'All Types') {
      filtered = filtered.filter(log => log.type === filters.typeFilter);
    }

    // Apply action filter
    if (filters.actionFilter && filters.actionFilter !== 'All Actions') {
      filtered = filtered.filter(log => log.action === filters.actionFilter);
    }

    // Apply date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= filters.dateRange.start! && logDate <= filters.dateRange.end!;
      });
    }

    return filtered;
  };

  // Update filtered logs when filters change
  useEffect(() => {
    setFilteredLogs(applyFilters(logs, { searchQuery, typeFilter, actionFilter, dateRange }));
  }, [logs, searchQuery, typeFilter, actionFilter, dateRange]);

  const handleRefreshIntervalChange = (value: string) => {
    const interval = parseInt(value, 10);
    setAutoRefreshInterval(interval);
    setLastRefresh(Date.now()); // Reset the refresh timer
  };

  // Export functionality
  const exportLogs = async () => {
    try {
      const dataToExport = exportFormat === 'selected' 
        ? filteredLogs.filter(log => selectedLogs.has(log._id))
        : filteredLogs;

      if (exportFormat === 'csv') {
        const csvContent = generateCSV(dataToExport);
        downloadFile(csvContent, 'access-logs.csv', 'text/csv');
      } else if (exportFormat === 'json') {
        const jsonContent = JSON.stringify(dataToExport, null, 2);
        downloadFile(jsonContent, 'access-logs.json', 'application/json');
      }

      toast.success('Export completed', {
        description: `${dataToExport.length} logs exported successfully`
      });
      setIsExportOpen(false);
    } catch (error) {
      toast.error('Export failed', {
        description: error.message || 'Please try again'
      });
    }
  };

  const generateCSV = (data: Log[]) => {
    const headers = ['Timestamp', 'Action', 'Resource Type', 'Details', 'IP Address', 'User Agent', 'Type'];
    const csvData = data.map(log => [
      log.timestamp,
      log.action,
      log.entity,
      log.details,
      log.ipAddress,
      log.userAgent || '',
      log.type
    ]);
    
    return [headers, ...csvData].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Bulk actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLogs(new Set(filteredLogs.map(log => log._id)));
    } else {
      setSelectedLogs(new Set());
    }
  };

  const handleSelectLog = (logId: string, checked: boolean) => {
    const newSelected = new Set(selectedLogs);
    if (checked) {
      newSelected.add(logId);
    } else {
      newSelected.delete(logId);
    }
    setSelectedLogs(newSelected);
  };

  const deleteSelectedLogs = async () => {
    if (selectedLogs.size === 0) return;

    try {
      const logIdsArray = Array.from(selectedLogs);
      await apiService.deleteAccessLogs(logIdsArray);
      
      // Update local state
      setLogs(prevLogs => prevLogs.filter(log => !selectedLogs.has(log._id)));
      setFilteredLogs(prevFiltered => prevFiltered.filter(log => !selectedLogs.has(log._id)));
      
      // Clear selection
      setSelectedLogs(new Set());
      
      toast.success('Selected logs deleted', {
        description: `${logIdsArray.length} logs removed`
      });
      
      // Refresh logs to ensure sync with server
      fetchLogs();
    } catch (error: any) {
      console.error('Failed to delete logs:', error);
      toast.error('Failed to delete logs', {
        description: error.message || 'Please try again'
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'access': return 'bg-health-aqua text-white';
      case 'proof': return 'bg-health-success text-white';
      case 'auth': return 'bg-health-warning text-white';
      case 'update': return 'bg-health-primary text-white';
      case 'share': return 'bg-health-secondary text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'access': return <Eye className="w-4 h-4" />;
      case 'proof': return <Shield className="w-4 h-4" />;
      case 'auth': return <Key className="w-4 h-4" />;
      case 'update': return <RefreshCw className="w-4 h-4" />;
      case 'share': return <Share2 className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'text-health-success';
    return status.toLowerCase() === 'success' ? 'text-health-success' : 'text-health-danger';
  };

  const getStatusIcon = (status: string | undefined) => {
    if (!status) return <CheckCircle className="w-4 h-4" />;
    return status.toLowerCase() === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  // Map backend log to UI log
  const mapLog = (log: any): Log => ({
    _id: log._id,
    timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : '',
    action: log.action,
    entity: log.resourceType,
    details: log.details || log.resourceId || '',
    type: log.action?.toLowerCase().includes('proof') ? 'proof' :
          log.action?.toLowerCase().includes('login') ? 'auth' :
          log.action?.toLowerCase().includes('access') ? 'access' :
          log.action?.toLowerCase().includes('update') ? 'update' :
          log.action?.toLowerCase().includes('share') ? 'share' : 'other',
    ipAddress: log.ipAddress || log.ip || '',
    userAgent: log.userAgent || '',
    status: 'success',
    originalLog: log
  });

  const getConnectionStatusIcon = () => {
    switch (realTimeStatus) {
      case 'connected': return <Wifi className="w-4 h-4 text-green-500" />;
      case 'disconnected': return <WifiOff className="w-4 h-4 text-red-500" />;
      default: return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Access Logs</h1>
          <p className="text-health-charcoal mt-2">Monitor all activities and access to your health data</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            {getConnectionStatusIcon()}
            <span className="capitalize">{realTimeStatus}</span>
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            className="bg-health-aqua hover:bg-health-aqua/90 text-white"
            onClick={() => setIsExportOpen(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-aqua/10 rounded-lg">
                <Eye className="w-6 h-6 text-health-aqua" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Total Access</p>
                <p className="text-2xl font-bold text-health-teal">{stats.total}</p>
                <p className="text-xs text-health-blue-gray">All time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-success/10 rounded-lg">
                <Shield className="w-6 h-6 text-health-success" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Proofs Generated</p>
                <p className="text-2xl font-bold text-health-teal">{stats.proofs}</p>
                <p className="text-xs text-health-blue-gray">Secure proofs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-warning/10 rounded-lg">
                <User className="w-6 h-6 text-health-warning" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Today's Activity</p>
                <p className="text-2xl font-bold text-health-teal">{stats.today}</p>
                <p className="text-xs text-health-blue-gray">Live updates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-teal/10 rounded-lg">
                <Activity className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Updates</p>
                <p className="text-2xl font-bold text-health-teal">{stats.updates}</p>
                <p className="text-xs text-health-blue-gray">Records modified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-health-teal">Advanced Filters</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('All Types');
                    setActionFilter('All Actions');
                    setDateRange({ start: null, end: null });
                  }}
                >
                  <FilterX className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={autoRefresh ? 'bg-health-aqua text-white' : ''}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Auto-refresh
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-blue-gray w-4 h-4" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Types">All Types</SelectItem>
                    <SelectItem value="access">Data Access</SelectItem>
                    <SelectItem value="proof">Proof Generated</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="update">Record Updates</SelectItem>
                    <SelectItem value="share">Data Sharing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Action</Label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Actions">All Actions</SelectItem>
                    <SelectItem value="VIEW_RECORD">View Record</SelectItem>
                    <SelectItem value="CREATE_RECORD">Create Record</SelectItem>
                    <SelectItem value="UPDATE_RECORD">Update Record</SelectItem>
                    <SelectItem value="DELETE_RECORD">Delete Record</SelectItem>
                    <SelectItem value="CREATE_PROOF">Create Proof</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                    <SelectItem value="LOGOUT">Logout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">View Mode</Label>
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table View</SelectItem>
                    <SelectItem value="timeline">Timeline View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Date Range</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Input
                    type="date"
                    value={dateRange.start ? dateRange.start.toISOString().slice(0, 10) : ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value ? new Date(e.target.value) : null }))}
                    placeholder="Start date"
                  />
                  <Input
                    type="date"
                    value={dateRange.end ? dateRange.end.toISOString().slice(0, 10) : ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value ? new Date(e.target.value) : null }))}
                    placeholder="End date"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Auto-refresh Interval</Label>
                <Select 
                  value={autoRefreshInterval.toString()} 
                  onValueChange={handleRefreshIntervalChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Disabled</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedLogs.size > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-health-charcoal">
                {selectedLogs.size} log(s) selected
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const selectedData = filteredLogs.filter(log => selectedLogs.has(log._id));
                    const csvContent = generateCSV(selectedData);
                    downloadFile(csvContent, 'selected-logs.csv', 'text/csv');
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteSelectedLogs}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logs Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Timeline ({filteredLogs.length} logs)</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                Real-time
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedLogs.size === filteredLogs.length && filteredLogs.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-health-blue-gray">
                      No logs found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log._id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedLogs.has(log._id)}
                          onCheckedChange={(checked) => handleSelectLog(log._id, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(log.type)}>
                          {getTypeIcon(log.type)}
                          <span className="ml-1 capitalize">{log.type}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>{log.entity}</TableCell>
                      <TableCell className="max-w-xs truncate" title={log.details}>
                        {log.details || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                      <TableCell className={getStatusColor(log.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(log.status)}
                          <span>{log.status?.toUpperCase() || 'SUCCESS'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedLog(log);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log._id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-full ${getTypeColor(log.type)}`}>
                      {getTypeIcon(log.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{log.action}</h4>
                      <span className="text-xs text-gray-500">{log.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {log.entity} • {log.details || 'No details'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>IP: {log.ipAddress}</span>
                      <span className={getStatusColor(log.status)}>
                        {getStatusIcon(log.status)}
                        {log.status || 'SUCCESS'}
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedLog(log);
                      setIsDetailOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Action</Label>
                  <p className="text-sm text-gray-600">{selectedLog.action}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Resource Type</Label>
                  <p className="text-sm text-gray-600">{selectedLog.resourceType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Timestamp</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">IP Address</Label>
                  <p className="text-sm text-gray-600">{selectedLog.ipAddress}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Details</Label>
                <Textarea
                  value={selectedLog.details || 'No details available'}
                  readOnly
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">User Agent</Label>
                <p className="text-sm text-gray-600 break-all">{selectedLog.userAgent || 'Not available'}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Resource ID</Label>
                <p className="text-sm text-gray-600 font-mono">{selectedLog.resourceId || 'N/A'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Access Logs</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV File</SelectItem>
                  <SelectItem value="json">JSON File</SelectItem>
                  <SelectItem value="selected">Selected Logs Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600">
              {exportFormat === 'selected' 
                ? `Export ${selectedLogs.size} selected logs`
                : `Export ${filteredLogs.length} filtered logs`
              }
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsExportOpen(false)}>
                Cancel
              </Button>
              <Button onClick={exportLogs}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientLogs;
