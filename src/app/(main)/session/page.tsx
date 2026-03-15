import { getSubjects } from "@/actions/subjects";
import { getCustomStatuses } from "@/actions/statuses";
import { Header } from "@/components/layout/Header";
import { SessionClient } from "./client";

export default async function SessionPage() {
  const [subjects, customStatuses] = await Promise.all([
    getSubjects(),
    getCustomStatuses(),
  ]);

  return (
    <div>
      <Header title="Учебная сессия" description="Выбери предмет и начни учиться" />
      <SessionClient
        subjects={subjects.map((s) => ({ id: s.id, name: s.name, color: s.color, icon: s.icon }))}
        customStatuses={customStatuses.map((s) => ({ id: s.id, label: s.label, emoji: s.emoji }))}
      />
    </div>
  );
}