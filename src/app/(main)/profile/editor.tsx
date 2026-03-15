"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateProfile } from "@/actions/profile";
import { useRouter } from "next/navigation";

export function ProfileEditor({ name }: { name: string }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await updateProfile(formData);
    setEditing(false);
    setLoading(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
        Редактировать профиль
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <Input id="name" name="name" label="Имя" defaultValue={name} required />
      <Button type="submit" loading={loading} size="md">
        Сохранить
      </Button>
      <Button variant="ghost" size="md" onClick={() => setEditing(false)} type="button">
        Отмена
      </Button>
    </form>
  );
}