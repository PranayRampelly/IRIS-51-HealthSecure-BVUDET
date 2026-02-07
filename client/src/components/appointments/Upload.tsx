import React, { useRef, useState } from 'react';

interface UploadProps {
  onUpload: (fileMeta: any) => void;
}

const Upload: React.FC<UploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function encryptAndUpload(file: File) {
    setUploading(true);
    setError(null);
    setPreview(null);
    try {
      // Preview
      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file));
      }
      // Client-side encryption (AES-256-GCM)
      const key = crypto.getRandomValues(new Uint8Array(32));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const fileBuffer = await file.arrayBuffer();
      const cryptoKey = await window.crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['encrypt']);
      const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, fileBuffer);
      // Upload
      const formData = new FormData();
      formData.append('file', new Blob([new Uint8Array(encrypted)], { type: file.type }), file.name);
      // Optionally send iv and key encrypted with server public key
      const res = await fetch('/api/appointments/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const meta = await res.json();
      onUpload({ ...meta, iv: Array.from(iv), key: Array.from(key) });
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
      <label className="block w-full text-center cursor-pointer">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) encryptAndUpload(file);
          }}
        />
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-health-teal rounded-xl p-8 hover:bg-health-teal/5 transition">
          <span className="text-health-teal font-semibold text-lg mb-2">Upload Medical Document</span>
          <span className="text-gray-500 text-sm">PDF, JPG, PNG, max 10MB</span>
        </div>
      </label>
      {uploading && <div className="mt-4 text-health-teal">Encrypting & Uploading...</div>}
      {error && <div className="mt-4 text-red-600">{error}</div>}
      {preview && <img src={preview} alt="Preview" className="mt-4 max-h-40 rounded-lg shadow" />}
    </div>
  );
};

export default Upload; 