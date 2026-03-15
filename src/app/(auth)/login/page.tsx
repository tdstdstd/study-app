"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Неверный email или пароль");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Card>
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3">
          <Timer size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold">Вход в StudyTracker</h1>
        {registered && (
          <p className="text-sm text-success mt-1">Регистрация успешна! Войдите.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="email" name="email" type="email" label="Email" placeholder="email@example.com" required />
        <Input id="password" name="password" type="password" label="Пароль" placeholder="Ваш пароль" required />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Войти
        </Button>
      </form>

      <p className="text-sm text-text-muted text-center mt-4">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </Card>
  );
}