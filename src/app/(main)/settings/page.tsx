import { Header } from "@/components/layout/Header";
import { Card, CardTitle } from "@/components/ui/Card";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { getCustomStatuses } from "@/actions/statuses";
import { CustomStatusManager } from "./custom-statuses";

export default async function SettingsPage() {
  const statuses = await getCustomStatuses();

  return (
    <div>
      <Header title="Настройки" />

      <Card className="mb-6">
        <CardTitle>Тема оформления</CardTitle>
        <p className="text-sm text-text-muted mt-1 mb-4">
          Выберите тему интерфейса
        </p>
        <ThemeSwitcher />
      </Card>

      <Card>
        <CardTitle>Кастомные статусы</CardTitle>
        <p className="text-sm text-text-muted mt-1 mb-4">
          Создайте свои статусы для использования во время сессий
        </p>
        <CustomStatusManager initialStatuses={statuses} />
      </Card>
    </div>
  );
}