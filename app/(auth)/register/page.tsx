"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME, APP_TAGLINE } from "@/lib/app-config";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  if (!supabase) {
    return (
      <div className="card space-y-4 text-center">
        <p className="text-slate-300">
          O Supabase não está configurado. Você pode testar o app em modo
          demonstração ou configurar o .env.local para criar conta e usar reservas.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/reservas" className="btn-primary inline-block rounded-xl px-4 py-2 text-sm">
            Continuar em modo demonstração
          </Link>
          <Link href="/setup" className="inline-block rounded-xl border border-slate-500 bg-[#22252a] px-4 py-2 text-sm font-medium text-slate-200 hover:bg-[#2a2e34]">
            Ver instruções de configuração
          </Link>
        </div>
        <p className="text-sm text-slate-400">
          <Link href="/" className="text-[#32C76A] hover:underline">Voltar ao início</Link>
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError("");
    setLoading(true);
    const { error: signError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
        <p className="mt-1 text-sm text-slate-400">{APP_TAGLINE}</p>
        <h2 className="mt-6 text-lg font-semibold text-slate-100">
          Criar conta
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Preencha os dados para se cadastrar
        </p>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="seu@email.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-300">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            minLength={6}
            required
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full rounded-xl py-2.5"
        >
          {loading ? "Criando…" : "Criar conta"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-medium text-[#32C76A] hover:underline">
          Entrar
        </Link>
      </p>
    </>
  );
}
