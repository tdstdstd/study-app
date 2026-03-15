"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { createSubject, updateSubject, deleteSubject } from "@/actions/subjects";
import { SUBJECT_COLORS, SUBJECT_ICONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Subject = {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string | null;
  _count: { sessions: number };
};

export function SubjectsClient({ initialSubjects }: { initialSubjects: Subject[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);
 
  const [selectedColor, setSelectedColor] = useState<string>(SUBJECT_COLORS[0]);
const [selectedIcon, setSelectedIcon] = useState<string>(SUBJECT_ICONS[0]);
  const router = useRouter();

  function openCreate() {
    setEditing(null);
    setSelectedColor(SUBJECT_COLORS[0]);
    setSelectedIcon(SUBJECT_ICONS[0]);
    setShowModal(true);
  }

  function openEdit(subject: Subject) {
    setEditing(subject);
    setSelectedColor(subject.color);
    setSelectedIcon(subject.icon);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("color", selectedColor);
    formData.set("icon", selectedIcon);

    if (editing) {
      await updateSubject(editing.id, formData);
    } else {
      await createSubject(formData);
    }

    setShowModal(false);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить предмет? Все сессии по нему тоже удалятся.")) return;
    await deleteSubject(id);
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={openCreate}>
          <Plus size={18} />
          Новый предмет
        </Button>
      </div>

      {initialSubjects.length === 0 ? (
        <EmptyState
          title="Нет предметов"
          description="Создайте первый предмет, чтобы начать учебную сессию"
          action={
            <Button onClick={openCreate}>
              <Plus size={18} />
              Создать предмет
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialSubjects.map((s) => (
            <Card key={s.id} className="relative group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: s.color }}
                  >
                    📚
                  </div>
                  <div>
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="text-xs text-text-muted">{s._count.sessions} сессий</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors"
                  >
                    <Pencil size={14} className="text-text-muted" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors"
                  >
                    <Trash2 size={14} className="text-danger" />
                  </button>
                </div>
              </div>
              {s.description && (
                <p className="text-sm text-text-secondary mt-3">{s.description}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Редактировать предмет" : "Новый предмет"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            name="name"
            label="Название"
            defaultValue={editing?.name}
            placeholder="Математика"
            required
          />
          <Input
            id="description"
            name="description"
            label="Описание (необязательно)"
            defaultValue={editing?.description || ""}
            placeholder="Линейная алгебра, теорвер..."
          />

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Цвет</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    selectedColor === c && "ring-2 ring-offset-2 ring-offset-bg-primary ring-accent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            {editing ? "Сохранить" : "Создать"}
          </Button>
        </form>
      </Modal>
    </>
  );
}