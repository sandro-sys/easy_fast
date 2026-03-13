"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createCompany, getMyCompany } from "@/app/actions/companies";
import { APP_NAME, APP_TAGLINE } from "@/lib/app-config";
import { Building2, MapPin, FileText, Phone, Image } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      const company = await getMyCompany();
      if (company) {
        router.replace("/dashboard");
        return;
      }
      setChecking(false);
    }
    check();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Informe o nome da empresa.");
      return;
    }
    setLoading(true);
    const result = await createCompany({
      name: name.trim(),
      cnpj,
      address,
      whatsapp_number: whatsapp,
      cover_image_url: coverImageUrl.trim() || undefined,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <p className="text-slate-400">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-slate-400">{APP_TAGLINE}</p>
          <h2 className="mt-6 text-lg font-semibold text-slate-100">
            Dados da empresa
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Preencha para começar a usar o sistema
          </p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-300">
              <Building2 className="h-4 w-4 text-[#32C76A]" />
              Nome da empresa *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Razão social ou nome fantasia"
              required
            />
          </div>
          <div>
            <label htmlFor="cnpj" className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-300">
              <FileText className="h-4 w-4 text-[#32C76A]" />
              CNPJ
            </label>
            <input
              id="cnpj"
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              className="input-field"
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <label htmlFor="address" className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-300">
              <MapPin className="h-4 w-4 text-[#32C76A]" />
              Endereço
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field"
              placeholder="Rua, número, bairro, cidade"
            />
          </div>
          <div>
            <label htmlFor="whatsapp" className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-300">
              <Phone className="h-4 w-4 text-[#32C76A]" />
              WhatsApp
            </label>
            <input
              id="whatsapp"
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="input-field"
              placeholder="(00) 00000-0000"
            />
          </div>
          <div>
            <label htmlFor="coverImageUrl" className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-300">
              <Image className="h-4 w-4 text-[#32C76A]" />
              Foto de capa (URL)
            </label>
            <input
              id="coverImageUrl"
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="input-field"
              placeholder="https://... (opcional)"
            />
            <p className="mt-1 text-xs text-slate-500">Aparece na página de reserva do seu restaurante.</p>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full rounded-xl py-2.5"
          >
            {loading ? "Salvando…" : "Continuar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-400">
          <Link href="/" className="text-[#32C76A] hover:underline">Voltar ao início</Link>
        </p>
      </div>
    </div>
  );
}
