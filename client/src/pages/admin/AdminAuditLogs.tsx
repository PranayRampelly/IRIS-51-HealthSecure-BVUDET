import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  Activity,
  Search,
  Filter,
  Download,
  Calendar as CalendarIcon,
  User,
  Shield,
  Database,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Loader2,
  FileText,
  Share,
  Upload,
  Archive,
  MoreHorizontal,
  Trash2,
  Edit,
  Paperclip,
  ExternalLink,
  MapPin,
  Monitor,
  Globe,
  Lock,
  Unlock,
  Bell,
  FileCheck,
  FileX,
  CreditCard,
  Building,
  Server,
  Cog,
  Users,
  EyeOff,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Archive as ArchiveIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  FileText as FileTextIcon,
  Share as ShareIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  User as UserIcon,
  Database as DatabaseIcon,
  Settings as SettingsIcon2
} from 'lucide-react';
import { adminAuditLogService, auditLogUtils, type AuditLog, type AuditLogStats } from '@/services/adminAuditLogService';

const AdminAuditLogs = () => {
  const { toast } = useToast();
  
  // State management
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTargetType, setSelectedTargetType] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [complianceOnly, setComplianceOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showUserActivity, setShowUserActivity] = useState(false);
  const [userActivity, setUserActivity] = useState<any>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Action types for filtering
  const actionTypes = [
    'user_created', 'user_modified', 'user_suspended', 'user_reactivated', 'user_deleted',
    'user_login', 'user_logout', 'login_failed', 'password_changed', 'profile_updated',
    '2fa_enabled', '2fa_disabled', '2fa_verified', '2fa_failed',
    'session_created', 'session_expired', 'session_revoked',
    'access_denied', 'permission_denied', 'security_alert',
    'record_created', 'record_modified', 'record_deleted', 'record_viewed',
    'record_shared', 'record_exported', 'record_imported',
    'proof_created', 'proof_verified', 'proof_rejected', 'proof_shared',
    'proof_requested', 'proof_expired',
    'appointment_created', 'appointment_modified', 'appointment_cancelled',
    'appointment_completed', 'appointment_rescheduled',
    'claim_submitted', 'claim_approved', 'claim_rejected', 'claim_modified',
    'policy_created', 'policy_modified', 'policy_cancelled',
    'backup_created', 'backup_restored', 'backup_failed',
    'system_maintenance', 'system_update', 'system_error',
    'data_export', 'data_import', 'data_archived',
    'settings_modified', 'config_changed', 'admin_action',
    'bulk_operation', 'user_bulk_modified',
    'compliance_check', 'audit_report', 'regulatory_update',
    'data_retention', 'privacy_consent', 'gdpr_request'
  ];

  // Target types for filtering
  const targetTypes = [
    'user', 'health_record', 'proof', 'appointment', 'claim', 'policy', 'system', 'settings', 'database'
  ];

  // Fetch audit logs with filters
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        ...(selectedAction !== 'all' && { action: selectedAction }),
        ...(selectedSeverity !== 'all' && { severity: selectedSeverity }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedTargetType !== 'all' && { targetType: selectedTargetType }),
        ...(selectedUser !== 'all' && { userId: selectedUser }),
        ...(complianceOnly && { complianceOnly: true }),
        ...(dateRange?.from && { startDate: dateRange.from.toISOString() }),
        ...(dateRange?.to && { endDate: dateRange.to.toISOString() })
      };

      const data = await adminAuditLogService.getAuditLogs(params);
      setLogs(data.logs);
      setTotalPages(data.pagination.totalPages);
      setTotalLogs(data.pagination.totalLogs);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, selectedAction, selectedSeverity, selectedStatus, selectedTargetType, selectedUser, complianceOnly, dateRange]);

  // Fetch audit log statistics
  const fetchAuditLogStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params: any = {};
      if (dateRange?.from) params.startDate = dateRange.from.toISOString();
      if (dateRange?.to) params.endDate = dateRange.to.toISOString();
      
      const data = await adminAuditLogService.getAuditLogStats(params.startDate, params.endDate);
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch audit log stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch audit log statistics",
        variant: "destructive"
      });
    } finally {
      setStatsLoading(false);
    }
  }, [dateRange]);

  // Fetch user activity
  const fetchUserActivity = async (userId: string) => {
    setActivityLoading(true);
    try {
      const data = await adminAuditLogService.getUserActivity(userId);
      setUserActivity(data);
      setShowUserActivity(true);
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user activity",
        variant: "destructive"
      });
    } finally {
      setActivityLoading(false);
    }
  };

  // Export audit logs
  const exportAuditLogs = async (format: 'json' | 'csv' = 'json') => {
    try {
      const filters: any = {};
      if (dateRange?.from) filters.startDate = dateRange.from.toISOString();
      if (dateRange?.to) filters.endDate = dateRange.to.toISOString();
      if (selectedAction !== 'all') filters.action = selectedAction;
      if (selectedSeverity !== 'all') filters.severity = selectedSeverity;
      if (selectedStatus !== 'all') filters.status = selectedStatus;
      if (selectedTargetType !== 'all') filters.targetType = selectedTargetType;
      if (selectedUser !== 'all') filters.userId = selectedUser;
      if (complianceOnly) filters.complianceOnly = true;

      const blob = await adminAuditLogService.exportAuditLogs(format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${Date.now()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Audit logs exported as ${format.toUpperCase()}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to export audit logs",
        variant: "destructive"
      });
    }
  };

  // Bulk operations
  const performBulkOperation = async () => {
    if (!selectedLogs.length || !bulkAction) return;

    try {
      const operationData: any = {
        operation: bulkAction,
        logIds: selectedLogs
      };

      if (bulkAction === 'update_severity') {
        operationData.data = { severity: 'high' }; // You can make this configurable
      } else if (bulkAction === 'add_tags') {
        operationData.data = { tags: ['compliance'] }; // You can make this configurable
      }

      await adminAuditLogService.bulkOperation(operationData);
      
      toast({
        title: "Success",
        description: `Bulk ${bulkAction} completed successfully`,
        variant: "default"
      });
      
      setSelectedLogs([]);
      setBulkAction('');
      fetchAuditLogs();
      fetchAuditLogStats();
    } catch (error) {
      console.error('Failed to perform bulk operation:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk operation",
        variant: "destructive"
      });
    }
  };

  // Handle log selection for bulk operations
  const handleLogSelection = (logId: string, checked: boolean) => {
    if (checked) {
      setSelectedLogs(prev => [...prev, logId]);
    } else {
      setSelectedLogs(prev => prev.filter(id => id !== logId));
    }
  };

  // Handle select all logs
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLogs(logs.map(log => log._id));
    } else {
      setSelectedLogs([]);
    }
  };

  // View log details
  const viewLogDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowLogDetails(true);
  };

  // Get icon component for action
  const getActionIcon = (action: string) => {
    const iconMap: Record<string, any> = {
      user_created: UserIcon,
      user_modified: UserIcon,
      user_suspended: UserIcon,
      user_deleted: UserIcon,
      user_login: ShieldIcon,
      user_logout: ShieldIcon,
      login_failed: XCircleIcon,
      password_changed: ShieldIcon,
      profile_updated: UserIcon,
      '2fa_enabled': ShieldIcon,
      '2fa_disabled': ShieldIcon,
      '2fa_verified': ShieldIcon,
      '2fa_failed': XCircleIcon,
      session_created: ShieldIcon,
      session_expired: ShieldIcon,
      session_revoked: ShieldIcon,
      access_denied: AlertTriangleIcon,
      permission_denied: AlertTriangleIcon,
      security_alert: AlertTriangleIcon,
      record_created: FileTextIcon,
      record_modified: FileTextIcon,
      record_deleted: FileTextIcon,
      record_viewed: Eye,
      record_shared: ShareIcon,
      record_exported: DownloadIcon,
      record_imported: UploadIcon,
      proof_created: ShieldIcon,
      proof_verified: CheckCircleIcon,
      proof_rejected: XCircleIcon,
      proof_shared: ShareIcon,
      proof_requested: ShieldIcon,
      proof_expired: ClockIcon,
      appointment_created: CalendarIcon,
      appointment_modified: CalendarIcon,
      appointment_cancelled: XCircleIcon,
      appointment_completed: CheckCircleIcon,
      appointment_rescheduled: CalendarIcon,
      claim_submitted: FileTextIcon,
      claim_approved: CheckCircleIcon,
      claim_rejected: XCircleIcon,
      claim_modified: FileTextIcon,
      policy_created: FileTextIcon,
      policy_modified: FileTextIcon,
      policy_cancelled: XCircleIcon,
      backup_created: DatabaseIcon,
      backup_restored: DatabaseIcon,
      backup_failed: DatabaseIcon,
      system_maintenance: SettingsIcon2,
      system_update: SettingsIcon2,
      system_error: AlertTriangleIcon,
      data_export: DownloadIcon,
      data_import: UploadIcon,
      data_archived: ArchiveIcon,
      settings_modified: SettingsIcon2,
      config_changed: SettingsIcon2,
      admin_action: ShieldIcon,
      bulk_operation: SettingsIcon2,
      user_bulk_modified: Users,
      compliance_check: ShieldIcon,
      audit_report: FileTextIcon,
      regulatory_update: ShieldIcon,
      data_retention: ArchiveIcon,
      privacy_consent: ShieldIcon,
      gdpr_request: ShieldIcon,
    };
    return iconMap[action] || Activity;
  };

  // Load data on component mount
  useEffect(() => {
    fetchAuditLogs();
    fetchAuditLogStats();
  }, [fetchAuditLogs, fetchAuditLogStats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-montserrat font-bold text-health-teal">Audit Logs</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              fetchAuditLogs();
              fetchAuditLogStats();
            }}
            disabled={loading || statsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(loading || statsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => exportAuditLogs('csv')}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportAuditLogs('json')}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-health-charcoal">Total Events</p>
              <p className="text-2xl font-bold text-health-teal">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats?.systemStats.totalEvents || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-health-charcoal">Critical</p>
              <p className="text-2xl font-bold text-health-danger">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats?.systemStats.criticalEvents || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-health-charcoal">High</p>
              <p className="text-2xl font-bold text-orange-500">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats?.systemStats.highEvents || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-health-charcoal">Failed</p>
              <p className="text-2xl font-bold text-health-danger">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats?.systemStats.failedEvents || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-health-charcoal">Blocked</p>
              <p className="text-2xl font-bold text-health-warning">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats?.systemStats.blockedEvents || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-health-charcoal">Compliance</p>
              <p className="text-2xl font-bold text-health-aqua">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats?.complianceStats.totalComplianceEvents || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-health-blue-gray" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actionTypes.map(action => (
                  <SelectItem key={action} value={action}>
                    {auditLogUtils.getActionDisplayName(action)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="All Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Select value={selectedTargetType} onValueChange={setSelectedTargetType}>
              <SelectTrigger>
                <SelectValue placeholder="All Target Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Target Types</SelectItem>
                {targetTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {auditLogUtils.getTargetTypeDisplayName(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="complianceOnly"
                checked={complianceOnly}
                onCheckedChange={(checked) => setComplianceOnly(checked as boolean)}
              />
              <Label htmlFor="complianceOnly">Compliance Only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedLogs.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-health-charcoal">
                {selectedLogs.length} log(s) selected
              </span>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mark_compliance">Mark Compliance</SelectItem>
                  <SelectItem value="update_severity">Update Severity</SelectItem>
                  <SelectItem value="add_tags">Add Tags</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={performBulkOperation} disabled={!bulkAction}>
                Apply
              </Button>
              <Button variant="outline" onClick={() => setSelectedLogs([])}>
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-health-teal" />
              Audit Logs ({totalLogs})
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-health-charcoal">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-health-teal" />
              <span className="ml-2">Loading audit logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-health-blue-gray mb-4" />
              <p className="text-health-charcoal">No audit logs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="flex items-center p-4 rounded-lg bg-health-light-gray/50 border border-health-blue-gray/20">
                <div className="w-8">
                  <Checkbox
                    checked={selectedLogs.length === logs.length && logs.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </div>
                <div className="flex-1 font-semibold text-health-charcoal">Event</div>
                <div className="w-24 text-center font-semibold text-health-charcoal">Severity</div>
                <div className="w-24 text-center font-semibold text-health-charcoal">Status</div>
                <div className="w-32 text-center font-semibold text-health-charcoal">Actions</div>
              </div>

              {/* Log Rows */}
              {logs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                return (
                  <div key={log._id} className="flex items-center justify-between p-4 rounded-lg border border-health-blue-gray/20 hover:bg-health-light-gray/50 transition-colors">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-8">
                        <Checkbox
                          checked={selectedLogs.includes(log._id)}
                          onCheckedChange={(checked) => handleLogSelection(log._id, checked as boolean)}
                        />
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${auditLogUtils.getSeverityColorClass(log.severity)}`}>
                          <ActionIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-health-charcoal">
                              {auditLogUtils.getActionDisplayName(log.action)}
                            </h3>
                            {auditLogUtils.isSecurityRelevant(log) && (
                              <AlertTriangle className="h-4 w-4 text-health-danger" />
                            )}
                            {auditLogUtils.isComplianceRelevant(log) && (
                              <Shield className="h-4 w-4 text-health-aqua" />
                            )}
                          </div>
                          <p className="text-sm text-health-blue-gray">{log.details}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-health-blue-gray flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {log.userName} ({log.userRole})
                            </span>
                            <span className="text-xs text-health-blue-gray flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {auditLogUtils.formatTimeAgo(log.timestamp)}
                            </span>
                            {log.targetName && (
                              <span className="text-xs text-health-blue-gray flex items-center">
                                <FileText className="h-3 w-3 mr-1" />
                                {log.targetName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={auditLogUtils.getSeverityColorClass(log.severity)}>
                        {log.severity}
                      </Badge>
                      <Badge className={auditLogUtils.getStatusColorClass(log.status)}>
                        {log.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => viewLogDetails(log)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => fetchUserActivity(log.userId)}>
                            <User className="h-4 w-4 mr-2" />
                            User Activity
                          </DropdownMenuItem>
                          {log.attachments.length > 0 && (
                            <DropdownMenuItem>
                              <Paperclip className="h-4 w-4 mr-2" />
                              View Attachments ({log.attachments.length})
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-health-charcoal">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalLogs)} of {totalLogs} logs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-health-charcoal">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={showLogDetails} onOpenChange={setShowLogDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Action</Label>
                  <p className="text-sm text-health-charcoal font-medium">
                    {auditLogUtils.getActionDisplayName(selectedLog.action)}
                  </p>
                </div>
                <div>
                  <Label>Timestamp</Label>
                  <p className="text-sm text-health-charcoal">
                    {auditLogUtils.formatTimestamp(selectedLog.timestamp)}
                  </p>
                </div>
                <div>
                  <Label>User</Label>
                  <p className="text-sm text-health-charcoal">
                    {selectedLog.userName} ({selectedLog.userEmail})
                  </p>
                </div>
                <div>
                  <Label>Role</Label>
                  <p className="text-sm text-health-charcoal capitalize">
                    {selectedLog.userRole}
                  </p>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Badge className={auditLogUtils.getSeverityColorClass(selectedLog.severity)}>
                    {selectedLog.severity}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={auditLogUtils.getStatusColorClass(selectedLog.status)}>
                    {selectedLog.status}
                  </Badge>
                </div>
                <div>
                  <Label>IP Address</Label>
                  <p className="text-sm text-health-charcoal">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <Label>Request Method</Label>
                  <p className="text-sm text-health-charcoal">{selectedLog.requestMethod}</p>
                </div>
                <div>
                  <Label>Target Type</Label>
                  <p className="text-sm text-health-charcoal">
                    {auditLogUtils.getTargetTypeDisplayName(selectedLog.targetType)}
                  </p>
                </div>
                {selectedLog.targetName && (
                  <div>
                    <Label>Target Name</Label>
                    <p className="text-sm text-health-charcoal">{selectedLog.targetName}</p>
                  </div>
                )}
              </div>
              
              <div>
                <Label>Details</Label>
                <p className="text-sm text-health-charcoal mt-1">{selectedLog.details}</p>
              </div>

              {selectedLog.attachments.length > 0 && (
                <div>
                  <Label>Attachments</Label>
                  <div className="mt-2 space-y-2">
                    {selectedLog.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                        <Paperclip className="h-4 w-4 text-health-blue-gray" />
                        <span className="text-sm text-health-charcoal">{attachment.filename}</span>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLog.complianceTags.length > 0 && (
                <div>
                  <Label>Compliance Tags</Label>
                  <div className="mt-2 flex gap-2">
                    {selectedLog.complianceTags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <Label>Metadata</Label>
                  <pre className="text-sm text-health-charcoal mt-1 bg-gray-50 p-2 rounded overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Activity Dialog */}
      <Dialog open={showUserActivity} onOpenChange={setShowUserActivity}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Activity</DialogTitle>
          </DialogHeader>
          {activityLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-health-teal" />
              <span className="ml-2">Loading user activity...</span>
            </div>
          ) : userActivity ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User</Label>
                  <p className="text-sm text-health-charcoal">
                    {userActivity.user?.firstName} {userActivity.user?.lastName} ({userActivity.user?.email})
                  </p>
                </div>
                <div>
                  <Label>Role</Label>
                  <p className="text-sm text-health-charcoal capitalize">
                    {userActivity.user?.role}
                  </p>
                </div>
              </div>
              <div>
                <Label>Recent Activity</Label>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {userActivity.logs.length > 0 ? (
                    userActivity.logs.map((log: AuditLog, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {auditLogUtils.getActionDisplayName(log.action)}
                          </span>
                          <span className="text-xs text-health-blue-gray">
                            {auditLogUtils.formatTimeAgo(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-health-charcoal mt-1">{log.details}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge className={auditLogUtils.getSeverityColorClass(log.severity)}>
                            {log.severity}
                          </Badge>
                          <Badge className={auditLogUtils.getStatusColorClass(log.status)}>
                            {log.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-health-charcoal">No activity found</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-health-charcoal">No activity data available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAuditLogs;
