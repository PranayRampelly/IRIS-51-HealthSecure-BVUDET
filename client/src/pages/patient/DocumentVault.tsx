import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, FileText, Image as ImageIcon, Download, Trash2, Search, Tag, ChevronDown, ChevronUp, Eye, X, Edit2, Clock, Share2, CheckSquare, Square, Link2, Trash, ShieldCheck, ShieldAlert, ActivitySquare, KeyRound, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BiometricAuthModal from '@/components/auth/BiometricAuthModal';

// Define types for files, shares, audit logs, and versions
interface FileVersion {
  version: number;
  uploadedAt: string;
  size: number;
}

interface VaultFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  tags: string[];
  version: number;
  url: string;
  versions: FileVersion[];
  expiry?: string;
}

interface VaultShare {
  id: string;
  fileIds: string[];
  link: string;
  expiresAt: string;
  createdAt: string;
  revoked: boolean;
}

interface AuditLog {
  id: number;
  action: string;
  file: string;
  user: string;
  date: string;
}

const mockFiles: VaultFile[] = [
  {
    id: '1',
    name: 'Prescription.pdf',
    type: 'pdf',
    size: 234567,
    uploadedAt: '2024-07-14',
    tags: ['prescription'],
    version: 2,
    url: '',
    versions: [
      { version: 2, uploadedAt: '2024-07-14', size: 234567 },
      { version: 1, uploadedAt: '2024-07-10', size: 234000 },
    ],
    expiry: undefined,
  },
  {
    id: '2',
    name: 'BloodTestResults.png',
    type: 'image',
    size: 145678,
    uploadedAt: '2024-07-13',
    tags: ['lab', 'blood'],
    version: 1,
    url: '',
    versions: [
      { version: 1, uploadedAt: '2024-07-13', size: 145678 },
    ],
    expiry: undefined,
  },
  {
    id: '3',
    name: 'InsuranceCard.jpg',
    type: 'image',
    size: 95678,
    uploadedAt: '2024-07-12',
    tags: ['insurance'],
    version: 1,
    url: '',
    versions: [
      { version: 1, uploadedAt: '2024-07-12', size: 95678 },
    ],
    expiry: undefined,
  },
];

const mockShares: VaultShare[] = [
  {
    id: 'share-1',
    fileIds: ['1'],
    link: 'https://vault.healthsecure.com/share/abc123',
    expiresAt: '2024-07-20',
    createdAt: '2024-07-14',
    revoked: false,
  },
];

const mockAuditLogs: AuditLog[] = [
  { id: 1, action: 'Downloaded', file: 'Prescription.pdf', user: 'You', date: '2024-07-14 10:30' },
  { id: 2, action: 'Shared', file: 'BloodTestResults.png', user: 'You', date: '2024-07-14 09:15' },
  { id: 3, action: 'Deleted', file: 'InsuranceCard.jpg', user: 'You', date: '2024-07-13 18:00' },
];

const mockActivity = [
  { id: 1, type: 'upload', file: 'Prescription.pdf', date: '2024-07-14 10:00' },
  { id: 2, type: 'share', file: 'BloodTestResults.png', date: '2024-07-14 09:30' },
  { id: 3, type: 'download', file: 'InsuranceCard.jpg', date: '2024-07-13 18:30' },
  { id: 4, type: 'delete', file: 'OldReport.pdf', date: '2024-07-13 17:00' },
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

const fileTypeIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-6 h-6 text-red-500" />;
    case 'image':
      return <ImageIcon className="w-6 h-6 text-blue-400" />;
    default:
      return <FileText className="w-6 h-6 text-gray-400" />;
  }
};

const DocumentVault: React.FC = () => {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionFile, setVersionFile] = useState<VaultFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareExpiry, setShareExpiry] = useState('7');
  const [activeShares, setActiveShares] = useState<VaultShare[]>(mockShares);
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
  const [expiryModalFile, setExpiryModalFile] = useState<VaultFile | null>(null);
  const [expiryInput, setExpiryInput] = useState('');
  const navigate = useNavigate();
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(true); // Temporarily unlock vault for backend development
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const [lastShareLink, setLastShareLink] = useState<string | null>(null);

  // Fetch real files from backend on mount
  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await fetch('http://localhost:5000/api/vault/list', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.files) {
          setFiles(
            data.files.map(f => ({
              id: f._id,
              name: f.filename,
              type: f.filename.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
              size: f.size,
              uploadedAt: new Date(f.createdAt).toISOString().slice(0, 10),
              tags: f.tags || [],
              version: f.version || 1,
              url: f.cloudinaryUrl || '',
              versions: [{ version: f.version || 1, uploadedAt: new Date(f.createdAt).toISOString().slice(0, 10), size: f.size }],
              expiry: f.expiry,
            }))
          );
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setNotification({ type: 'Error', message: err.message || 'Failed to fetch files.' });
        } else {
          setNotification({ type: 'Error', message: 'An unexpected error occurred.' });
        }
      }
    }
    fetchFiles();
  }, []);

  // Helper to upload files to the backend
  const uploadFiles = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      // TODO: Add tags or other metadata if needed
      try {
        const res = await fetch('http://localhost:5000/api/vault/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          setFiles((prev) => [
            {
              id: data.file.id,
              name: data.file.filename,
              type: files[i].type.includes('pdf') ? 'pdf' : 'image',
              size: data.file.size,
              uploadedAt: new Date(data.file.createdAt).toISOString().slice(0, 10),
              tags: data.file.tags || [],
              version: data.file.version || 1,
              url: '',
              versions: [{ version: data.file.version || 1, uploadedAt: new Date(data.file.createdAt).toISOString().slice(0, 10), size: data.file.size }],
              expiry: data.file.expiry,
            },
            ...prev,
          ]);
          setNotification({ type: 'Upload', message: `${files[i].name} uploaded successfully.` });
        } else {
          setNotification({ type: 'Error', message: data.message || `Failed to upload ${files[i].name}` });
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setNotification({ type: 'Error', message: `Network error uploading ${files[i].name}: ${err.message}` });
        } else {
          setNotification({ type: 'Error', message: `Network error uploading ${files[i].name}.` });
        }
      }
    }
  };

  const filteredFiles = files
    .filter((file) => file.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  // Pagination logic (must come after filteredFiles)
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 10;
  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);
  const paginatedFiles = filteredFiles.slice((currentPage - 1) * filesPerPage, currentPage * filesPerPage);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handlePageClick = (page: number) => setCurrentPage(page);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadFiles(files);
    }
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFiles(files);
    }
  };
  const handleSort = () => setSortAsc((asc) => !asc);

  const handlePreview = async (file: VaultFile) => {
    if (file.type === 'image') {
      setPreviewFile({ ...file, url: file.url }); // url is already set from backend (cloudinaryUrl)
      setShowPreview(true);
    } else if (file.type === 'pdf') {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/vault/download/${file.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 404 && errorData.error === 'FILE_NOT_FOUND_IN_STORAGE') {
            throw new Error('This file is not available for preview. It may have been uploaded incorrectly or is missing from storage.');
          }
          throw new Error(errorData.message || 'Failed to fetch PDF');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPreviewFile({ ...file, url });
        setShowPreview(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to preview PDF.';
        setNotification({ type: 'Error', message });
      }
    } else {
      setPreviewFile(file);
      setShowPreview(true);
    }
  };
  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewFile(null);
  };
  const handleDownload = async (file: VaultFile) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/vault/download/${file.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404 && errorData.error === 'FILE_NOT_FOUND_IN_STORAGE') {
          throw new Error('This file is not available for download. It may have been uploaded incorrectly or is missing from storage.');
        }
        throw new Error(errorData.message || 'Failed to download file');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setNotification({ type: 'success', message: 'File downloaded successfully.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download file.';
      setNotification({ type: 'Error', message });
    }
  };
  const handleDelete = async (file: VaultFile): Promise<void> => {
    const doDelete = async (code?: string, isBackup?: boolean): Promise<void> => {
      try {
        // Real API call for file delete with 2FA
        const res = await fetch(`http://localhost:5000/api/vault/${file.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify({
            code: !isBackup ? code : undefined,
            backupCode: isBackup ? code : undefined,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setFiles((prev: VaultFile[]) => prev.filter((f: VaultFile) => f.id !== file.id));
          setNotification({ type: 'success', message: 'File deleted successfully.' });
        } else {
          setNotification({ type: 'error', message: data.message || 'Delete failed.' });
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setNotification({ type: 'error', message: `Delete failed: ${err.message}` });
        } else {
          setNotification({ type: 'error', message: 'Delete failed.' });
        }
      }
    };
    // Simulate backend requiring 2FA
    doDelete();
  };

  // Tag editing
  const handleEditTags = (file: VaultFile) => {
    setEditingTagsId(file.id);
    setTagInput(file.tags.join(', '));
  };
  const handleSaveTags = (file: VaultFile): void => {
    const doUpdateTags = async (): Promise<void> => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/vault/tags/${file.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tags: tagInput }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Update tags failed.');
        setFiles((prev: VaultFile[]) => prev.map((f: VaultFile) => f.id === file.id ? { ...f, tags: data.file.tags } : f));
        setEditingTagsId(null);
        setTagInput('');
        setNotification({ type: 'Tags Updated', message: `Tags updated for ${file.name}` });
      } catch (err: unknown) {
        if (err instanceof Error) {
          setNotification({ type: 'Error', message: err.message || 'Update tags failed.' });
        } else {
          setNotification({ type: 'Error', message: 'Update tags failed.' });
        }
      }
    };
    doUpdateTags();
  };
  const handleCancelTags = (): void => {
    setEditingTagsId(null);
    setTagInput('');
  };

  // Versioning
  const handleShowVersions = (file: VaultFile): void => {
    setVersionFile(file);
    setShowVersionModal(true);
  };
  const handleCloseVersionModal = () => {
    setShowVersionModal(false);
    setVersionFile(null);
  };

  // Bulk selection
  const handleSelectFile = (id: string): void => {
    setSelectedIds((prev: string[]) => prev.includes(id) ? prev.filter((sid: string) => sid !== id) : [...prev, id]);
  };
  const handleSelectAll = (): void => {
    if (selectedIds.length === filteredFiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFiles.map((f: VaultFile) => f.id));
    }
  };

  // Bulk actions
  const handleBulkDownload = async (): Promise<void> => {
    const token = localStorage.getItem('token');
    await Promise.all(selectedIds.map(async (id) => {
      const file = files.find(f => f.id === id);
      if (!file) return;
      try {
        const response = await fetch(`http://localhost:5000/api/vault/download/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to download file');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        setNotification({ type: 'Error', message: `Failed to download ${file.name}` });
      }
    }));
    setNotification({ type: 'success', message: 'Bulk download started.' });
  };
  const handleBulkDelete = async (): Promise<void> => {
    if (selectedIds.length === 0) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/vault/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileIds: selectedIds }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Bulk delete failed.');
      setFiles((prev: VaultFile[]) => prev.filter((f: VaultFile) => !selectedIds.includes(f.id)));
      setSelectedIds([]);
      setNotification({ type: 'Bulk Delete', message: `Deleted ${data.deleted.length} file(s).` });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setNotification({ type: 'Error', message: err.message || 'Bulk delete failed.' });
      } else {
        setNotification({ type: 'Error', message: 'Bulk delete failed.' });
      }
    }
  };
  const handleBulkShare = (): void => {
    setShowShareModal(true);
  };
  const handleCreateShare = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/vault/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileIds: selectedIds, expiresAt: new Date(Date.now() + Number(shareExpiry) * 24 * 60 * 60 * 1000) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Share failed.');
      const newShare: VaultShare = {
        id: data.share.id,
        fileIds: [...selectedIds],
        link: data.share.link,
        expiresAt: data.share.expiresAt,
        createdAt: new Date().toISOString().slice(0, 10),
        revoked: false,
      };
      setActiveShares((prev: VaultShare[]) => [newShare, ...prev]);
      setShowShareModal(false);
      setSelectedIds([]);
      setShareExpiry('7');
      setLastShareLink(`http://localhost:8080/share/${data.share.link}`);
      setNotification({ type: 'Share Created', message: 'Secure share link generated.' });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setNotification({ type: 'Error', message: err.message || 'Share failed.' });
      } else {
        setNotification({ type: 'Error', message: 'Share failed.' });
      }
    }
  };
  const handleRevokeShare = (id: string): void => {
    setActiveShares((prev: VaultShare[]) => prev.map((s: VaultShare) => s.id === id ? { ...s, revoked: true } : s));
  };

  // 2FA prompt logic (mock)
  // Remove show2FAPrompt, twoFACode, handle2FASubmit for initial unlock only

  // Notification logic (mock)
  useEffect(() => {
    if (notification) {
      toast({
        title: notification.type,
        description: notification.message,
        duration: 4000,
      });
      setNotification(null);
    }
  }, [notification]);

  // Expiry logic
  const handleOpenExpiryModal = (file: VaultFile): void => {
    setExpiryModalFile(file);
    setExpiryInput(file.expiry || '');
  };
  const handleSaveExpiry = (): void => {
    const doUpdateExpiry = async (): Promise<void> => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/vault/tags/${expiryModalFile!.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ expiry: expiryInput }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Update expiry failed.');
        setFiles((prev: VaultFile[]) => prev.map((f: VaultFile) => f.id === expiryModalFile!.id ? { ...f, expiry: data.file.expiry } : f));
        setNotification({ type: 'Expiry Set', message: `Expiry set for ${expiryModalFile!.name}` });
        setExpiryModalFile(null);
        setExpiryInput('');
      } catch (err: unknown) {
        if (err instanceof Error) {
          setNotification({ type: 'Error', message: err.message || 'Update expiry failed.' });
        } else {
          setNotification({ type: 'Error', message: 'Update expiry failed.' });
        }
      }
    };
    doUpdateExpiry();
  };
  const handleRemoveExpiry = () => {
    setFiles((prev) => prev.map((f) =>
      f.id === expiryModalFile!.id ? { ...f, expiry: undefined } : f
    ));
    setNotification({ type: 'Expiry Removed', message: `Expiry removed for ${expiryModalFile!.name}` });
    setExpiryModalFile(null);
    setExpiryInput('');
  };

  // Data integrity and virus scan status (mock)
  const getFileStatus = (file: VaultFile) => {
    // Mock: all files pass, but one is flagged
    if (file.name === 'BloodTestResults.png') {
      return { integrity: false, virus: true };
    }
    return { integrity: true, virus: false };
  };

  // Expiry notification banners (mock)
  const getExpiryBanner = (file: VaultFile) => {
    if (!file.expiry) return null;
    const now = new Date();
    const expiryDate = new Date(file.expiry);
    const diff = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) {
      return (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-xs font-semibold">
          This document expired on {file.expiry} and will be auto-deleted soon.
        </div>
      );
    } else if (diff < 3) {
      return (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-2 text-xs font-semibold">
          This document will expire on {file.expiry}.
        </div>
      );
    }
    return null;
  };

  // 2FA modal submit handler
  // const handle2FAModalSubmit = (code: string, isBackup: boolean) => {
  //   setTwoFACode(code);
  //   setTwoFAIsBackup(isBackup);
  //   if (pending2FAAction) pending2FAAction();
  // };

  if (!vaultUnlocked) {
    // Remove or bypass the BiometricAuthModal and related logic for now
    // return (
    //   <BiometricAuthModal
    //     open={!vaultUnlocked}
    //     onSuccess={() => setVaultUnlocked(true)}
    //     onError={setBiometricError}
    //     error={biometricError}
    //   />
    // );
    return (
      <div className="space-y-6 bg-health-light-gray min-h-screen px-2 md:px-6 py-8 w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Lock className="h-8 w-8 text-health-teal mr-3" />
            <h1 className="text-3xl font-montserrat font-bold text-health-teal">Document Vault</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/patient/document-vault/activity')} className="font-semibold">
              Activity Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/patient/document-vault/shares')} className="font-semibold">
              Active Shares
            </Button>
            <Button variant="outline" onClick={() => setShowAuditLog(true)} className="flex items-center gap-2">
              <ActivitySquare className="w-5 h-5 text-health-teal" /> Audit Log
            </Button>
          </div>
        </div>
        <p className="mb-4 text-health-charcoal text-base">
          Securely store, manage, and share your medical files, insurance documents, and prescriptions. All files are encrypted and access-controlled for your privacy and security.
        </p>
        {/* Upload Banner */}
        <Card>
          <CardContent className="p-6">
            {/* 2FA Prompt Modal */}
            {/* Remove the initial 2FA modal JSX (show2FAPrompt && ... block) from the render */}
            {/* <TwoFactorChallengeModal
              open={show2FAModal}
              onClose={() => setShow2FAModal(false)}
              onSubmit={handle2FAModalSubmit}
              loading={twoFALoading}
              error={twoFAError}
            /> */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors duration-200 ${dragActive ? 'border-health-teal bg-health-teal/10' : 'border-gray-300 bg-gray-50'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: 'pointer' }}
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center">
                <Lock className="w-10 h-10 text-health-teal mb-2" />
                <span className="font-semibold text-health-teal">Drag & drop files here or click to upload</span>
                <span className="text-sm text-gray-500">PDF, images, and more. Max 10MB per file.</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Filters and Actions */}
        <Card>
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSort} className="flex items-center gap-1">
                Sort by Name {sortAsc ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </Button>
              <Button variant="outline" onClick={handleBulkDownload} disabled={selectedIds.length === 0} className="flex items-center gap-1">
                <Download className="w-4 h-4" /> Download
              </Button>
              <Button variant="outline" onClick={handleBulkDelete} disabled={selectedIds.length === 0} className="flex items-center gap-1">
                <Trash2 className="w-4 h-4 text-red-500" /> Delete
              </Button>
              <Button variant="outline" onClick={handleBulkShare} disabled={selectedIds.length === 0} className="flex items-center gap-1">
                <Share2 className="w-4 h-4 text-health-teal" /> Share
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* File Table */}
        <Card>
          <CardContent className="p-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    <button onClick={handleSelectAll} className="focus:outline-none">
                      {selectedIds.length === filteredFiles.length && filteredFiles.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-health-teal" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Security</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFiles.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center text-gray-400 py-8">
                      No documents found.
                    </td>
                  </tr>
                ) : (
                  paginatedFiles.map((file) => {
                    const status = getFileStatus(file);
                    return (
                      <tr key={file.id} className={`hover:bg-gray-50 transition ${selectedIds.includes(file.id) ? 'bg-health-teal/10' : ''}`}>
                        <td className="px-2 py-2">
                          <button onClick={() => handleSelectFile(file.id)} className="focus:outline-none">
                            {selectedIds.includes(file.id) ? (
                              <CheckSquare className="w-5 h-5 text-health-teal" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-2">{fileTypeIcon(file.type)}</td>
                        <td className="px-4 py-2 font-medium text-health-teal">{file.name}</td>
                        <td className="px-4 py-2">
                          {editingTagsId === file.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={tagInput}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                                className="w-32"
                              />
                              <Button size="sm" onClick={() => handleSaveTags(file)} className="bg-health-teal text-white">Save</Button>
                              <Button size="sm" variant="outline" onClick={handleCancelTags}>Cancel</Button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {file.tags.map((tag: string) => (
                                <span key={tag} className="inline-block bg-health-teal/10 text-health-teal text-xs px-2 py-1 rounded font-semibold">{tag}</span>
                              ))}
                              <Button size="icon" variant="ghost" className="ml-1" title="Edit Tags" onClick={() => handleEditTags(file)}>
                                <Edit2 className="w-4 h-4 text-gray-400" />
                              </Button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          v{file.version}
                          <Button size="icon" variant="ghost" className="ml-1" title="View version history" onClick={() => handleShowVersions(file)}>
                            <Clock className="w-4 h-4 text-gray-400" />
                          </Button>
                        </td>
                        <td className="px-4 py-2">{file.uploadedAt}</td>
                        <td className="px-4 py-2">{(file.size / 1024).toFixed(1)} KB</td>
                        <td className="px-4 py-2">
                          {file.expiry ? (
                            <span className="text-xs text-yellow-700 font-semibold">{file.expiry}</span>
                          ) : (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                          <Button size="icon" variant="ghost" className="ml-1" title="Set Expiry" onClick={() => handleOpenExpiryModal(file)}>
                            <Clock className="w-4 h-4 text-gray-400" />
                          </Button>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            {status.integrity ? (
                              <ShieldCheck className="w-5 h-5 text-green-500" aria-label="Integrity Verified" />
                            ) : (
                              <ShieldAlert className="w-5 h-5 text-red-500" aria-label="Integrity Issue" />
                            )}
                            {status.virus ? (
                              <ShieldAlert className="w-5 h-5 text-red-500" aria-label="Virus Detected" />
                            ) : (
                              <ShieldCheck className="w-5 h-5 text-green-500" aria-label="No Virus" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 flex gap-2">
                          <Button size="icon" variant="ghost" title="Preview" onClick={() => handlePreview(file)}>
                            <Eye className="w-4 h-4 text-health-teal" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Download" onClick={() => handleDownload(file)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Delete" onClick={() => handleDelete(file)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
        {/* Modals and Banners remain unchanged, outside main layout */}
        {/* Notification banners for expiring/expired files */}
        {filteredFiles.map((file) => 
          getExpiryBanner(file)
        )}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 py-3 pr-4">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageClick(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-health-teal"
                onClick={handleClosePreview}
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center mb-4">
                {fileTypeIcon(previewFile.type)}
                <span className="ml-2 font-semibold text-lg text-health-teal">{previewFile.name}</span>
              </div>
              <div className="relative flex items-center justify-center min-h-[300px] bg-gray-50 border rounded">
                {/* Watermark overlay */}
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-20 text-4xl font-bold text-health-teal" style={{ zIndex: 2 }}>
                  HealthSecure
                </span>
                {/* File preview mock */}
                {previewFile.type === 'image' ? (
                  <img
                    src={previewFile.url || '/placeholder.svg'}
                    alt={previewFile.name}
                    className="max-h-72 max-w-full mx-auto rounded shadow"
                    style={{ zIndex: 1 }}
                  />
                ) : previewFile.type === 'pdf' ? (
                  <iframe
                    src={previewFile.url}
                    title={previewFile.name}
                    className="w-full h-72 rounded shadow"
                    style={{ zIndex: 1 }}
                  />
                ) : (
                  <div className="w-full h-72 flex items-center justify-center bg-gray-200 rounded">
                    <FileText className="w-16 h-16 text-gray-400" />
                    <span className="ml-4 text-gray-500">Preview not available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Version History Modal */}
        {showVersionModal && versionFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-health-teal"
                onClick={handleCloseVersionModal}
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center mb-4">
                <Clock className="w-6 h-6 text-gray-400 mr-2" />
                <span className="font-semibold text-lg text-health-teal">Version History: {versionFile.name}</span>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {versionFile.versions.map((v: FileVersion) => (
                    <tr key={v.version} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2">v{v.version}</td>
                      <td className="px-4 py-2">{v.uploadedAt}</td>
                      <td className="px-4 py-2">{(v.size / 1024).toFixed(1)} KB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Secure Sharing Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-health-teal"
                onClick={() => setShowShareModal(false)}
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center mb-4">
                <Share2 className="w-6 h-6 text-health-teal mr-2" />
                <span className="font-semibold text-lg text-health-teal">Share Documents Securely</span>
              </div>
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Selected files:</div>
                <ul className="list-disc list-inside text-sm mb-2">
                  {filteredFiles.filter(f => selectedIds.includes(f.id)).map(f => (
                    <li key={f.id}>{f.name}</li>
                  ))}
                </ul>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Expiry (days)</label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={shareExpiry}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShareExpiry(e.target.value)}
                  className="w-24"
                />
              </div>
              <Button className="w-full bg-health-teal text-white font-semibold" onClick={handleCreateShare}>
                Generate Secure Share Link
              </Button>
            </div>
          </div>
        )}

        {/* Share Link Modal */}
        {lastShareLink && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-health-teal"
                onClick={() => setLastShareLink(null)}
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold mb-4 text-health-teal flex items-center"><Share2 className="w-6 h-6 mr-2" />Share Link</h2>
              <div className="flex items-center gap-2 mb-4">
                <Input value={lastShareLink} readOnly className="flex-1 text-base" />
                <Button
                  onClick={() => { navigator.clipboard.writeText(lastShareLink); toast({ title: 'Copied!', description: 'Share link copied to clipboard.' }); }}
                  className="bg-health-teal text-white px-4 py-2"
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-gray-500">Anyone with this link can access the shared files until the link expires or is revoked.</p>
            </div>
          </div>
        )}

        {/* Audit Log Modal */}
        {showAuditLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-health-teal"
                onClick={() => setShowAuditLog(false)}
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center mb-4">
                <ActivitySquare className="w-6 h-6 text-health-teal mr-2" />
                <span className="font-semibold text-lg text-health-teal">Audit Log</span>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2">{log.action}</td>
                      <td className="px-4 py-2">{log.file}</td>
                      <td className="px-4 py-2">{log.user}</td>
                      <td className="px-4 py-2">{log.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expiry Modal */}
        {expiryModalFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-health-teal"
                onClick={() => setExpiryModalFile(null)}
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center mb-4">
                <Clock className="w-6 h-6 text-health-teal mr-2" />
                <span className="font-semibold text-lg text-health-teal">Set Document Expiry</span>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <Input
                type="date"
                value={expiryInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiryInput(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button className="bg-health-teal text-white font-semibold flex-1" onClick={handleSaveExpiry}>Save</Button>
                <Button variant="outline" className="flex-1" onClick={handleRemoveExpiry}>Remove</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-health-light-gray min-h-screen px-2 md:px-6 py-8 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Lock className="h-8 w-8 text-health-teal mr-3" />
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Document Vault</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/patient/document-vault/activity')} className="font-semibold">
            Activity Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/patient/document-vault/shares')} className="font-semibold">
            Active Shares
          </Button>
          <Button variant="outline" onClick={() => setShowAuditLog(true)} className="flex items-center gap-2">
            <ActivitySquare className="w-5 h-5 text-health-teal" /> Audit Log
          </Button>
        </div>
      </div>
      <p className="mb-4 text-health-charcoal text-base">
        Securely store, manage, and share your medical files, insurance documents, and prescriptions. All files are encrypted and access-controlled for your privacy and security.
      </p>
      {/* Upload Banner */}
      <Card>
        <CardContent className="p-6">
          {/* 2FA Prompt Modal */}
          {/* Remove the initial 2FA modal JSX (show2FAPrompt && ... block) from the render */}
          {/* <TwoFactorChallengeModal
            open={show2FAModal}
            onClose={() => setShow2FAModal(false)}
            onSubmit={handle2FAModalSubmit}
            loading={twoFALoading}
            error={twoFAError}
          /> */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors duration-200 ${dragActive ? 'border-health-teal bg-health-teal/10' : 'border-gray-300 bg-gray-50'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer' }}
          >
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center">
              <Lock className="w-10 h-10 text-health-teal mb-2" />
              <span className="font-semibold text-health-teal">Drag & drop files here or click to upload</span>
              <span className="text-sm text-gray-500">PDF, images, and more. Max 10MB per file.</span>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSort} className="flex items-center gap-1">
              Sort by Name {sortAsc ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
            <Button variant="outline" onClick={handleBulkDownload} disabled={selectedIds.length === 0} className="flex items-center gap-1">
              <Download className="w-4 h-4" /> Download
            </Button>
            <Button variant="outline" onClick={handleBulkDelete} disabled={selectedIds.length === 0} className="flex items-center gap-1">
              <Trash2 className="w-4 h-4 text-red-500" /> Delete
            </Button>
            <Button variant="outline" onClick={handleBulkShare} disabled={selectedIds.length === 0} className="flex items-center gap-1">
              <Share2 className="w-4 h-4 text-health-teal" /> Share
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* File Table */}
      <Card>
        <CardContent className="p-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <button onClick={handleSelectAll} className="focus:outline-none">
                    {selectedIds.length === filteredFiles.length && filteredFiles.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-health-teal" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Security</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFiles.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-gray-400 py-8">
                    No documents found.
                  </td>
                </tr>
              ) : (
                paginatedFiles.map((file) => {
                  const status = getFileStatus(file);
                  return (
                    <tr key={file.id} className={`hover:bg-gray-50 transition ${selectedIds.includes(file.id) ? 'bg-health-teal/10' : ''}`}>
                      <td className="px-2 py-2">
                        <button onClick={() => handleSelectFile(file.id)} className="focus:outline-none">
                          {selectedIds.includes(file.id) ? (
                            <CheckSquare className="w-5 h-5 text-health-teal" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-2">{fileTypeIcon(file.type)}</td>
                      <td className="px-4 py-2 font-medium text-health-teal">{file.name}</td>
                      <td className="px-4 py-2">
                        {editingTagsId === file.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={tagInput}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                              className="w-32"
                            />
                            <Button size="sm" onClick={() => handleSaveTags(file)} className="bg-health-teal text-white">Save</Button>
                            <Button size="sm" variant="outline" onClick={handleCancelTags}>Cancel</Button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {file.tags.map((tag: string) => (
                              <span key={tag} className="inline-block bg-health-teal/10 text-health-teal text-xs px-2 py-1 rounded font-semibold">{tag}</span>
                            ))}
                            <Button size="icon" variant="ghost" className="ml-1" title="Edit Tags" onClick={() => handleEditTags(file)}>
                              <Edit2 className="w-4 h-4 text-gray-400" />
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        v{file.version}
                        <Button size="icon" variant="ghost" className="ml-1" title="View version history" onClick={() => handleShowVersions(file)}>
                          <Clock className="w-4 h-4 text-gray-400" />
                        </Button>
                      </td>
                      <td className="px-4 py-2">{file.uploadedAt}</td>
                      <td className="px-4 py-2">{(file.size / 1024).toFixed(1)} KB</td>
                      <td className="px-4 py-2">
                        {file.expiry ? (
                          <span className="text-xs text-yellow-700 font-semibold">{file.expiry}</span>
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                        <Button size="icon" variant="ghost" className="ml-1" title="Set Expiry" onClick={() => handleOpenExpiryModal(file)}>
                          <Clock className="w-4 h-4 text-gray-400" />
                        </Button>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          {status.integrity ? (
                            <ShieldCheck className="w-5 h-5 text-green-500" aria-label="Integrity Verified" />
                          ) : (
                            <ShieldAlert className="w-5 h-5 text-red-500" aria-label="Integrity Issue" />
                          )}
                          {status.virus ? (
                            <ShieldAlert className="w-5 h-5 text-red-500" aria-label="Virus Detected" />
                          ) : (
                            <ShieldCheck className="w-5 h-5 text-green-500" aria-label="No Virus" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 flex gap-2">
                        <Button size="icon" variant="ghost" title="Preview" onClick={() => handlePreview(file)}>
                          <Eye className="w-4 h-4 text-health-teal" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Download" onClick={() => handleDownload(file)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Delete" onClick={() => handleDelete(file)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      {/* Modals and Banners remain unchanged, outside main layout */}
      {/* Notification banners for expiring/expired files */}
      {filteredFiles.map((file) => 
        getExpiryBanner(file)
      )}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 py-3 pr-4">
          <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageClick(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-health-teal"
              onClick={handleClosePreview}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center mb-4">
              {fileTypeIcon(previewFile.type)}
              <span className="ml-2 font-semibold text-lg text-health-teal">{previewFile.name}</span>
            </div>
            <div className="relative flex items-center justify-center min-h-[300px] bg-gray-50 border rounded">
              {/* Watermark overlay */}
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-20 text-4xl font-bold text-health-teal" style={{ zIndex: 2 }}>
                HealthSecure
              </span>
              {/* File preview mock */}
              {previewFile.type === 'image' ? (
                <img
                  src={previewFile.url || '/placeholder.svg'}
                  alt={previewFile.name}
                  className="max-h-72 max-w-full mx-auto rounded shadow"
                  style={{ zIndex: 1 }}
                />
              ) : previewFile.type === 'pdf' ? (
                <iframe
                  src={previewFile.url}
                  title={previewFile.name}
                  className="w-full h-72 rounded shadow"
                  style={{ zIndex: 1 }}
                />
              ) : (
                <div className="w-full h-72 flex items-center justify-center bg-gray-200 rounded">
                  <FileText className="w-16 h-16 text-gray-400" />
                  <span className="ml-4 text-gray-500">Preview not available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionModal && versionFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-health-teal"
              onClick={handleCloseVersionModal}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-gray-400 mr-2" />
              <span className="font-semibold text-lg text-health-teal">Version History: {versionFile.name}</span>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                </tr>
              </thead>
              <tbody>
                {versionFile.versions.map((v: FileVersion) => (
                  <tr key={v.version} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2">v{v.version}</td>
                    <td className="px-4 py-2">{v.uploadedAt}</td>
                    <td className="px-4 py-2">{(v.size / 1024).toFixed(1)} KB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Secure Sharing Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-health-teal"
              onClick={() => setShowShareModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center mb-4">
              <Share2 className="w-6 h-6 text-health-teal mr-2" />
              <span className="font-semibold text-lg text-health-teal">Share Documents Securely</span>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Selected files:</div>
              <ul className="list-disc list-inside text-sm mb-2">
                {filteredFiles.filter(f => selectedIds.includes(f.id)).map(f => (
                  <li key={f.id}>{f.name}</li>
                ))}
              </ul>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Expiry (days)</label>
              <Input
                type="number"
                min={1}
                max={30}
                value={shareExpiry}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShareExpiry(e.target.value)}
                className="w-24"
              />
            </div>
            <Button className="w-full bg-health-teal text-white font-semibold" onClick={handleCreateShare}>
              Generate Secure Share Link
            </Button>
          </div>
        </div>
      )}

      {/* Share Link Modal */}
      {lastShareLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-health-teal"
              onClick={() => setLastShareLink(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-health-teal flex items-center"><Share2 className="w-6 h-6 mr-2" />Share Link</h2>
            <div className="flex items-center gap-2 mb-4">
              <Input value={lastShareLink} readOnly className="flex-1 text-base" />
              <Button
                onClick={() => { navigator.clipboard.writeText(lastShareLink); toast({ title: 'Copied!', description: 'Share link copied to clipboard.' }); }}
                className="bg-health-teal text-white px-4 py-2"
              >
                Copy
              </Button>
            </div>
            <p className="text-xs text-gray-500">Anyone with this link can access the shared files until the link expires or is revoked.</p>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {showAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-health-teal"
              onClick={() => setShowAuditLog(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center mb-4">
              <ActivitySquare className="w-6 h-6 text-health-teal mr-2" />
              <span className="font-semibold text-lg text-health-teal">Audit Log</span>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {mockAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2">{log.action}</td>
                    <td className="px-4 py-2">{log.file}</td>
                    <td className="px-4 py-2">{log.user}</td>
                    <td className="px-4 py-2">{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expiry Modal */}
      {expiryModalFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-health-teal"
              onClick={() => setExpiryModalFile(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-health-teal mr-2" />
              <span className="font-semibold text-lg text-health-teal">Set Document Expiry</span>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <Input
              type="date"
              value={expiryInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiryInput(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button className="bg-health-teal text-white font-semibold flex-1" onClick={handleSaveExpiry}>Save</Button>
              <Button variant="outline" className="flex-1" onClick={handleRemoveExpiry}>Remove</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVault; 