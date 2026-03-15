"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { register } from "@/actions/auth";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await register(formData);

    if (result.success) {
      router.push("/login?registered=true");
    } else {
      setError(result.error);
    }
    setLoading(false);
  }
  return (
    <Card>
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3">
          <Timer size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold">Создать аккаунт</h1>
        <p className="text-sm text-text-muted mt-1">Начни отслеживать учебные сессии</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="name" name="name" label="Имя" placeholder="Твоё имя" required />
        <Input id="email" name="email" type="email" label="Email" placeholder="email@example.com" required />
        <Input id="password" name="password" type="password" label="Пароль" placeholder="Минимум 6 символов" required />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Зарегистрироваться
        </Button>
      </form>

      <p className="text-sm text-text-muted text-center mt-4">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Войти
        </Link>
      </p>
    </Card>
  );
}