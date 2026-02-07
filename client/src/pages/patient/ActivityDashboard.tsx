import React, { useState } from 'react';
import { ActivitySquare, Upload, Download, Share2, Trash2, Search, Calendar, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';

const mockActivity = [
  { id: 1, type: 'upload', file: 'Prescription.pdf', date: '2024-07-14 10:00' },
  { id: 2, type: 'share', file: 'BloodTestResults.png', date: '2024-07-14 09:30' },
  { id: 3, type: 'download', file: 'InsuranceCard.jpg', date: '2024-07-13 18:30' },
  { id: 4, type: 'delete', file: 'OldReport.pdf', date: '2024-07-13 17:00' },
  { id: 5, type: 'upload', file: 'LabResults.pdf', date: '2024-07-12 15:00' },
  { id: 6, type: 'share', file: 'XRay.png', date: '2024-07-12 14:30' },
  { id: 7, type: 'download', file: 'InsuranceCard.jpg', date: '2024-07-12 13:30' },
  { id: 8, type: 'delete', file: 'OldPrescription.pdf', date: '2024-07-12 12:00' },
];

const activityIcon = (type: string) => {
  switch (type) {
    case 'upload':
      return <Upload className="w-5 h-5 text-health-teal" />;
    case 'download':
      return <Download className="w-5 h-5 text-blue-500" />;
    case 'share':
      return <Share2 className="w-5 h-5 text-green-500" />;
    case 'delete':
      return <Trash2 className="w-5 h-5 text-red-500" />;
    default:
      return <ActivitySquare className="w-5 h-5 text-gray-400" />;
  }
};

const ActivityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [actionType, setActionType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [analyticsRange, setAnalyticsRange] = useState('30d');
  const analyticsRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: 'all', label: 'All time' },
  ];
  // Mock trend/percent change
  const trends = {
    upload: { change: '+10%', up: true },
    download: { change: '-5%', up: false },
    share: { change: '+20%', up: true },
    delete: { change: '+2%', up: true },
  };

  // Advanced filtering
  const filtered = mockActivity.filter(a => {
    const matchesSearch = a.file.toLowerCase().includes(search.toLowerCase());
    const matchesType = actionType === 'all' || a.type === actionType;
    const matchesDate = (!dateFrom || a.date >= dateFrom) && (!dateTo || a.date <= dateTo);
    return matchesSearch && matchesType && matchesDate;
  });

  // Analytics summary
  const totalUploads = mockActivity.filter(a => a.type === 'upload').length;
  const totalDownloads = mockActivity.filter(a => a.type === 'download').length;
  const totalShares = mockActivity.filter(a => a.type === 'share').length;
  const totalDeletes = mockActivity.filter(a => a.type === 'delete').length;

  // Export to CSV (mock)
  const handleExport = () => {
    const csv = [
      'Type,File,Date',
      ...filtered.map(a => `${a.type},${a.file},${a.date}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activity_log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 bg-health-light-gray min-h-screen px-2 md:px-6 py-8 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/patient/document-vault')} className="font-semibold border-health-teal text-health-teal hover:bg-health-teal/10 text-base px-3 py-1.5">
            ← Back
          </Button>
          <div>
            <h1 className="text-3xl font-montserrat font-bold text-health-teal">Activity Dashboard</h1>
            <p className="text-health-charcoal mt-2">View and analyze your recent document activity</p>
          </div>
        </div>
        <Button onClick={handleExport} className="bg-health-aqua hover:bg-health-aqua/90 text-white">
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Uploads */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-teal/10 rounded-lg">
                <Upload className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal flex items-center gap-1">
                  Uploads
                  <Tooltip><TooltipTrigger asChild><Info className="w-3 h-3 text-gray-400 ml-1" /></TooltipTrigger><TooltipContent>Total uploads in selected range</TooltipContent></Tooltip>
                </p>
                <p className="text-2xl font-bold text-health-teal">{totalUploads}</p>
                <span className={`flex items-center text-xs mt-1 ${trends.upload.up ? 'text-green-600' : 'text-red-500'}`}>
                  {trends.upload.up ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />} {trends.upload.change}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Downloads */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal flex items-center gap-1">
                  Downloads
                  <Tooltip><TooltipTrigger asChild><Info className="w-3 h-3 text-gray-400 ml-1" /></TooltipTrigger><TooltipContent>Total downloads in selected range</TooltipContent></Tooltip>
                </p>
                <p className="text-2xl font-bold text-blue-500">{totalDownloads}</p>
                <span className={`flex items-center text-xs mt-1 ${trends.download.up ? 'text-green-600' : 'text-red-500'}`}>
                  {trends.download.up ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />} {trends.download.change}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Shares */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Share2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal flex items-center gap-1">
                  Shares
                  <Tooltip><TooltipTrigger asChild><Info className="w-3 h-3 text-gray-400 ml-1" /></TooltipTrigger><TooltipContent>Total shares in selected range</TooltipContent></Tooltip>
                </p>
                <p className="text-2xl font-bold text-green-600">{totalShares}</p>
                <span className={`flex items-center text-xs mt-1 ${trends.share.up ? 'text-green-600' : 'text-red-500'}`}>
                  {trends.share.up ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />} {trends.share.change}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Deletes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal flex items-center gap-1">
                  Deletes
                  <Tooltip><TooltipTrigger asChild><Info className="w-3 h-3 text-gray-400 ml-1" /></TooltipTrigger><TooltipContent>Total deletes in selected range</TooltipContent></Tooltip>
                </p>
                <p className="text-2xl font-bold text-red-500">{totalDeletes}</p>
                <span className={`flex items-center text-xs mt-1 ${trends.delete.up ? 'text-green-600' : 'text-red-500'}`}>
                  {trends.delete.up ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />} {trends.delete.change}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by file name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-52 border-health-teal focus:ring-health-teal text-base px-2 py-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={actionType}
                onChange={e => setActionType(e.target.value)}
                className="border rounded px-2 py-1 text-sm border-health-teal focus:ring-health-teal"
              >
                <option value="all">All Types</option>
                <option value="upload">Upload</option>
                <option value="download">Download</option>
                <option value="share">Share</option>
                <option value="delete">Delete</option>
              </select>
              <Calendar className="w-3 h-3 text-gray-400 ml-2" />
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-28 border-health-teal focus:ring-health-teal text-sm px-2 py-1" />
              <span className="mx-1 text-gray-400 text-xs">to</span>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-28 border-health-teal focus:ring-health-teal text-sm px-2 py-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <li className="text-center text-gray-400 py-8 text-base">No activity found.</li>
            ) : (
              filtered.map((act) => (
                <li key={act.id} className="flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-health-teal/5 transition text-base">
                  {activityIcon(act.type)}
                  <span className="text-base text-health-charcoal">
                    <span className="font-semibold capitalize text-health-teal">{act.type}</span> <span className="font-medium">{act.file}</span>
                  </span>
                  <span className="ml-auto text-xs text-gray-400 font-mono">{act.date}</span>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityDashboard; 