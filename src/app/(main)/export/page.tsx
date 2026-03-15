import { getSubjects } from "@/actions/subjects";
import { Header } from "@/components/layout/Header";
import { ExportClient } from "./client";

export default async function ExportPage() {
  const subjects = await getSubjects();

  return (
    <div>
      <Header title="Экспорт данных" description="Скачайте ваши данные в удобном формате" />
      <ExportClient subjects={subjects.map((s) => ({ id: s.id, name: s.name }))} />
    </div>
  );
}