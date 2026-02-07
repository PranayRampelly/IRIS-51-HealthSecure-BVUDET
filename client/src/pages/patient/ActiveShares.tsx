import React, { useState, ReactNode, useEffect } from 'react';
import { Share2, Link2, Trash, Search, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const TRUST_KEY = 'vault_trusted_device';

interface Share {
  id: string;
  fileIds: { filename: string; cloudinaryUrl?: string }[];
  link: string;
  expiresAt: string;
  createdAt: string;
  revoked: boolean;
}

const ActiveShares: React.FC = () => {
  const [shares, setShares] = useState<Share[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const sharesPerPage = 10;
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);

  useEffect(() => {
    async function fetchShares() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/vault/shares', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok && data.shares) {
          setShares(data.shares);
        } else {
          setNotification({ type: 'Error', message: data.message || 'Failed to fetch shares.' });
        }
      } catch (err: unknown) {
        setNotification({ type: 'Error', message: 'Failed to fetch shares.' });
      }
    }
    fetchShares();
  }, []);

  // Filtering
  const filtered = shares.filter(share => {
    const matchesSearch = share.fileIds.some((f) => f.filename.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      status === 'all' ||
      (status === 'active' && !share.revoked) ||
      (status === 'revoked' && share.revoked);
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / sharesPerPage);
  const paginated = filtered.slice((currentPage - 1) * sharesPerPage, currentPage * sharesPerPage);
  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handlePageClick = (page: number) => setCurrentPage(page);

  // Revoke share (real API)
  const handleRevokeShare = (link: string) => {
    const doRevoke = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/vault/share/${link}/revoke`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setShares((prev) => prev.map((s) => s.link === link ? { ...s, revoked: true } : s));
          setNotification({ type: 'Share Revoked', message: 'Share revoked.' });
        } else {
          setNotification({ type: 'Error', message: data.message || 'Revoke failed.' });
        }
      } catch (err: unknown) {
        setNotification({ type: 'Error', message: 'Revoke failed.' });
      }
    };
    setRevokingId(link);
    doRevoke();
  };

  const handleSelectShare = (link: string): void => {
    setSelectedLinks((prev) =>
      prev.includes(link) ? prev.filter((l) => l !== link) : [...prev, link]
    );
  };
  const handleSelectAllShares = (): void => {
    if (selectedLinks.length === paginated.length) {
      setSelectedLinks([]);
    } else {
      setSelectedLinks(paginated.map((s) => s.link));
    }
  };
  const handleBulkRevoke = async (): Promise<void> => {
    if (selectedLinks.length === 0) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/vault/share/bulk-revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shareLinks: selectedLinks }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Bulk revoke failed.');
      setShares((prev) => prev.map((s) => selectedLinks.includes(s.link) ? { ...s, revoked: true } : s));
      setSelectedLinks([]);
      setNotification({ type: 'Bulk Revoke', message: `Revoked ${data.revoked.length} share(s).` });
    } catch (err: unknown) {
      setNotification({ type: 'Error', message: err instanceof Error ? err.message : 'Bulk revoke failed.' });
    }
  };

  // Notification logic (modal dialog)
  React.useEffect(() => {
    if (notification) {
      setShowDialog(true);
    }
  }, [notification]);

  return (
    <div className="space-y-6 bg-health-light-gray min-h-screen px-2 md:px-6 py-8 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/patient/document-vault')} className="font-semibold border-health-teal text-health-teal hover:bg-health-teal/10 text-base px-3 py-1.5">
            ← Back
          </Button>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal flex items-center ml-3 tracking-tight">
            <Share2 className="w-8 h-8 mr-2" /> Active Shares
          </h1>
        </div>
      </div>
      {/* Filters */}
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by file name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-52 border-health-teal focus:ring-health-teal text-base px-2 py-1"
            />
          </div>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="border rounded px-2 py-1 text-sm border-health-teal focus:ring-health-teal"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
          </select>
        </CardContent>
      </Card>
      {/* Shares Table */}
      <Card>
        <CardContent className="p-0">
          <Button variant="outline" onClick={handleBulkRevoke} disabled={selectedLinks.length === 0} className="flex items-center gap-1 mb-4 ml-4 mt-4">
            <Trash className="w-4 h-4 text-red-500 mr-1" /> Bulk Revoke
          </Button>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-health-light-gray">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-health-charcoal uppercase tracking-wider">
                  <button onClick={handleSelectAllShares} className="focus:outline-none">
                    {selectedLinks.length === paginated.length && paginated.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-health-teal" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-health-charcoal uppercase tracking-wider">Files</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-health-charcoal uppercase tracking-wider">Link</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-health-charcoal uppercase tracking-wider">Expires</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-health-charcoal uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-health-charcoal uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-8 text-base">No active shares.</td>
                </tr>
              ) : (
                paginated.map((share) => (
                  <tr key={share.id} className="hover:bg-health-teal/5 transition text-base">
                    <td className="px-4 py-3">
                      <button onClick={() => handleSelectShare(share.link)} className="focus:outline-none">
                        {selectedLinks.includes(share.link) ? (
                          <CheckSquare className="w-5 h-5 text-health-teal" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {share.fileIds.map((file) => (
                        <span key={file.filename} className="inline-block bg-health-teal/10 text-health-teal text-xs px-2 py-1 rounded mr-1 font-semibold">{file.filename}</span>
                      ))}
                    </td>
                    <td className="px-4 py-3">
                      <a href={share.link} target="_blank" rel="noopener noreferrer" className="text-health-teal underline flex items-center gap-1 font-semibold">
                        <Link2 className="w-4 h-4" /> Link
                      </a>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">{share.expiresAt}</td>
                    <td className="px-4 py-3">
                      {share.revoked ? (
                        <span className="text-xs text-red-500 font-semibold">Revoked</span>
                      ) : (
                        <span className="text-xs text-green-600 font-semibold">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!share.revoked && (
                        <Button size="sm" variant="outline" className="border-health-teal text-health-teal hover:bg-health-teal/10 text-base px-3 py-1.5" onClick={() => handleRevokeShare(share.link)}>
                          <Trash className="w-4 h-4 text-red-500 mr-1" /> Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 py-3 pr-4">
          <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1} className="border-health-teal text-health-teal text-base px-3 py-1.5">
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageClick(i + 1)}
              className={currentPage === i + 1 ? 'bg-health-teal text-white text-base px-3 py-1.5' : 'border-health-teal text-health-teal text-base px-3 py-1.5'}
            >
              {i + 1}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages} className="border-health-teal text-health-teal text-base px-3 py-1.5">
            Next
          </Button>
        </div>
      )}
      {/* Notification Dialog */}
      <Dialog open={showDialog && !!notification} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{notification?.type}</DialogTitle>
            <DialogDescription>{notification?.message}</DialogDescription>
          </DialogHeader>
          <Button onClick={() => { setShowDialog(false); setNotification(null); }} className="mt-4 w-full">Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActiveShares; 