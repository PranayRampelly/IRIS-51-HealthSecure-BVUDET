import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, Image as ImageIcon, XCircle } from 'lucide-react';

interface SharedFile {
  filename: string;
  cloudinaryUrl?: string;
}

const PublicShare: React.FC = () => {
  const { link } = useParams<{ link: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    async function fetchShare() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/api/vault/share/${link}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Share not found or expired.');
        setFiles(data.files || []);
        setExpiresAt(data.expiresAt || null);
        setMessage(data.message || '');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Share not found or expired.');
      } finally {
        setLoading(false);
      }
    }
    fetchShare();
  }, [link]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-health-light-gray">
        <Loader2 className="w-10 h-10 animate-spin text-health-teal mb-4" />
        <span className="text-health-teal font-semibold text-lg">Loading share...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-health-light-gray">
        <XCircle className="w-10 h-10 text-red-500 mb-4" />
        <span className="text-red-600 font-semibold text-lg">{error}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-screen bg-health-light-gray flex flex-col items-center justify-center p-0 m-0">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold text-health-teal text-center mb-4 mt-8">Shared Document(s)</h1>
        {message && <div className="mb-4 text-base text-health-charcoal text-center">{message}</div>}
        {expiresAt && (
          <div className="mb-8 text-lg text-gray-500 text-center">Expires at: {new Date(expiresAt).toLocaleString()}</div>
        )}
        <div className="flex flex-wrap justify-center items-center gap-12 w-full h-full">
          {files.map((file, idx) => {
            const isImage = file.filename.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
            const isPDF = file.filename.match(/\.pdf$/i);
            return (
              <div key={idx} className="flex flex-col items-center bg-white rounded-2xl shadow-xl p-8 w-full h-full max-w-none max-h-none">
                <div className="flex items-center gap-3 mb-6">
                  {isImage ? <ImageIcon className="w-9 h-9 text-blue-400" /> : isPDF ? <FileText className="w-9 h-9 text-red-500" /> : <FileText className="w-9 h-9 text-gray-400" />}
                  <span className="font-bold text-2xl text-health-teal break-all">{file.filename}</span>
                </div>
                {isImage && file.cloudinaryUrl && (
                  <img
                    src={file.cloudinaryUrl}
                    alt={file.filename}
                    className="max-w-[100vw] max-h-[90vh] object-contain rounded-xl border shadow-lg"
                    style={{ imageRendering: 'auto', width: 'auto', height: 'auto', display: 'block', margin: '0 auto' }}
                  />
                )}
                {isPDF && file.cloudinaryUrl && (
                  <iframe src={file.cloudinaryUrl} title={file.filename} className="w-[90vw] h-[80vh] border rounded-xl shadow-lg" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PublicShare; 