"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { updateSessionImage } from "@/actions/sessions";
import { useRouter } from "next/navigation";

interface Props {
  sessionId: string;
  currentImage: string | null;
}

export function SessionImageUpload({ sessionId, currentImage }: Props) {
  const [preview, setPreview] = useState(currentImage);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleUpload(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sessionId);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.url) {
        await updateSessionImage(sessionId, data.url);
        setPreview(data.url);
        router.refresh();
      }
    } catch (e) {
      console.error("Upload error:", e);
    }
    setUploading(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Файл слишком большой (макс. 5 МБ)");
      return;
    }
    handleUpload(file);
  }

  return (
    <div>
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Session"
            className="w-full h-48 lg:h-full object-cover rounded-lg"
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
          >
            <Upload size={24} className="text-white" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-48 rounded-lg border-2 border-dashed border-border hover:border-accent transition-colors flex flex-col items-center justify-center gap-2"
          disabled={uploading}
        >
          <ImageIcon size={32} className="text-text-muted" />
          <span className="text-sm text-text-muted">
            {uploading ? "Загрузка..." : "Загрузить фото"}
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}