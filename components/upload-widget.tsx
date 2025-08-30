"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type Props = {
  clientId: string;
  accept?: string;
  maxSizeBytes?: number;
  onUploaded?: (info: { path: string; filename: string; mime: string; size: number }) => void;
};

export function UploadWidget({ clientId, accept = "image/*,application/pdf", maxSizeBytes = 10 * 1024 * 1024, onUploaded }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.size > maxSizeBytes) {
      setError(`File too large. Max ${(maxSizeBytes / (1024 * 1024)).toFixed(1)}MB`);
      return;
    }

    try {
      setBusy(true);
      // 1) ask backend for signed upload
      const signRes = await fetch(`/api/media/signed-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, original: file.name })
      });
      const signJson = await signRes.json();
      if (!signRes.ok || !signJson?.ok) throw new Error(signJson?.message || 'Failed to sign upload');

      const { path, token } = signJson.data;

      // 2) upload directly to Supabase Storage via signed URL
      const { data, error } = await supabaseBrowser.storage
        .from('media')
        .uploadToSignedUrl(path, token, file);
      if (error) throw error;

      // 3) confirm upload so we store metadata and audit
      const confirmRes = await fetch(`/api/media/confirm-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          path,
          filename: file.name,
          mime_type: file.type || 'application/octet-stream',
          size_bytes: file.size,
        })
      });
      const confirmJson = await confirmRes.json();
      if (!confirmRes.ok || !confirmJson?.ok) throw new Error(confirmJson?.message || 'Failed to confirm upload');

      onUploaded?.({ path, filename: file.name, mime: file.type, size: file.size });
      e.currentTarget.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept={accept}
        disabled={busy}
        onChange={handleFileChange}
      />
      {busy && <div className="text-sm text-muted-foreground">Uploading…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
}

export default UploadWidget;

