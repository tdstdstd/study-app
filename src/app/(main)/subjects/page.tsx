import { getSubjects } from "@/actions/subjects";
import { Header } from "@/components/layout/Header";
import { SubjectsClient } from "./client";

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  return (
    <div>
      <Header title="Предметы" description="Управляйте списком предметов для учёбы" />
      <SubjectsClient initialSubjects={subjects} />
    </div>
  );
}