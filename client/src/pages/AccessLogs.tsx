import React, { useEffect, useState } from 'react';
import apiService from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const AccessLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAccessLogs();
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          setLogs(response.logs || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    // Cleanup function
    return () => {
      setLogs([]);
      setError('');
    };
  }, []);

  // Add token change detection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLogs([]);
      setError('');
      return;
    }

    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAccessLogs();
        setLogs(response.logs || []);
      } catch (err) {
        setError(err.message || 'Failed to load logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [localStorage.getItem('token')]);

  if (loading) return <div>Loading access logs...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Access Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-health-light-gray">
                <th className="p-2 border">Action</th>
                <th className="p-2 border">Resource</th>
                <th className="p-2 border">Time</th>
                <th className="p-2 border">IP</th>
                <th className="p-2 border">Device</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={5} className="text-center p-4">No access logs found.</td></tr>
              )}
              {logs.map((log: any) => (
                <tr key={log._id}>
                  <td className="p-2 border">{log.action}</td>
                  <td className="p-2 border">{log.resourceType}</td>
                  <td className="p-2 border">{new Date(log.timestamp || log.createdAt).toLocaleString()}</td>
                  <td className="p-2 border">{log.ip}</td>
                  <td className="p-2 border">{log.userAgent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessLogs; 