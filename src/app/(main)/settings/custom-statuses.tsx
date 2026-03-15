"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createCustomStatus, deleteCustomStatus } from "@/actions/statuses";
import { useRouter } from "next/navigation";

interface Status {
  id: string;
  label: string;
  emoji: string | null;
}

export function CustomStatusManager({ initialStatuses }: { initialStatuses: Status[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await createCustomStatus(formData);
    (e.target as HTMLFormElement).reset();
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteCustomStatus(id);
    router.refresh();
  }

  return (
    <div>
      {/* Existing */}
      <div className="space-y-2 mb-4">
        {initialStatuses.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-bg-tertiary">
            <span className="text-sm">
              {s.emoji} {s.label}
            </span>
            <button onClick={() => handleDelete(s.id)} className="p-1 hover:text-danger transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add */}
      <form onSubmit={handleCreate} className="flex items-end gap-3">
        <Input id="emoji" name="emoji" label="Emoji" placeholder="🎯" className="w-20" />
        <Input id="label" name="label" label="Название" placeholder="Мой статус" required />
        <Button type="submit" loading={loading} size="md">
          <Plus size={16} />
        </Button>
      </form>
    </div>
  );
}