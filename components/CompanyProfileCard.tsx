"use client";

import { useState } from "react";
import { updateCompanyProfile, ensureCompanySlug } from "@/app/actions/companies";
import { Image, Link2, Copy, Check, ExternalLink } from "lucide-react";

type Company = {
  id: string;
  name: string;
  slug: string | null;
  cover_image_url: string | null;
};

export function CompanyProfileCard({ company }: { company: Company }) {
  const [coverImageUrl, setCoverImageUrl] = useState(company.cover_image_url ?? "");
  const [slug, setSlug] = useState(company.slug ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const reservePath = company.slug ? `/reservar/${company.slug}` : null;
  const fullReserveUrl = reservePath ? `${baseUrl}${reservePath}` : null;

  async function handleSaveProfile() {
    setSaving(true);
    setMessage(null);
    const res = await updateCompanyProfile(company.id, {
      cover_image_url: coverImageUrl.trim() || null,
      ...(slug.trim() && { slug: slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }),
    });
    setSaving(false);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
      return;
    }
    setMessage({ type: "ok", text: "Salvo com sucesso." });
  }

  async function handleGenerateSlug() {
    setSaving(true);
    setMessage(null);
    const res = await ensureCompanySlug(company.id);
    setSaving(false);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
      return;
    }
    if (res.slug) {
      setSlug(res.slug);
      setMessage({ type: "ok", text: "Link gerado com sucesso!" });
    }
    window.location.reload();
  }

  function copyLink() {
    if (!fullReserveUrl) return;
    navigator.clipboard.writeText(fullReserveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card mt-8">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
        <Link2 className="h-5 w-5 text-[#32C76A]" />
        Link e foto do restaurante
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Compartilhe o link abaixo com seus clientes para que eles façam reservas online.
      </p>

      {/* Destaque do link de reserva */}
      <div className="mt-4 rounded-xl border border-[#32C76A]/30 bg-[#32C76A]/8 p-4" style={{ background: "rgba(50,199,106,0.08)" }}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#32C76A]">
          Seu link de reservas
        </p>
        {fullReserveUrl ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="flex-1 break-all rounded-lg bg-black/30 px-3 py-2 text-sm font-medium text-white">
              {fullReserveUrl}
            </code>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={copyLink}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: "#32C76A" }}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
              <a
                href={reservePath ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-slate-600/40 bg-slate-700/50 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-600/50"
              >
                <ExternalLink className="h-4 w-4" />
                Ver
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-300">
              Gere seu link personalizado com o nome do restaurante.
            </p>
            <button
              type="button"
              onClick={handleGenerateSlug}
              disabled={saving}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "#32C76A" }}
            >
              {saving ? "Gerando…" : "Gerar link de reservas"}
            </button>
          </div>
        )}
      </div>

      {/* Slug customizado */}
      <div className="mt-5">
        <label htmlFor="profile-slug" className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-300">
          <Link2 className="h-4 w-4" />
          Personalizar o link (opcional)
        </label>
        <input
          id="profile-slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="input-field mt-1"
          placeholder="ex: meu-restaurante"
        />
        <p className="mt-1 text-xs text-slate-500">Só letras minúsculas, números e hífens.</p>
      </div>

      {/* Foto de capa */}
      <div className="mt-5">
        <label htmlFor="profile-cover" className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-300">
          <Image className="h-4 w-4" />
          Foto de capa (URL da imagem)
        </label>
        <input
          id="profile-cover"
          type="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          className="input-field mt-1"
          placeholder="https://..."
        />
        {coverImageUrl && (
          <div className="mt-2 overflow-hidden rounded-lg border border-slate-600/40">
            <img src={coverImageUrl} alt="Preview" className="h-32 w-full object-cover" />
          </div>
        )}
      </div>

      {message && (
        <p className={`mt-3 text-sm ${message.type === "error" ? "text-red-400" : "text-[#32C76A]"}`}>
          {message.text}
        </p>
      )}
      <button
        type="button"
        onClick={handleSaveProfile}
        disabled={saving}
        className="btn-primary mt-4"
      >
        {saving ? "Salvando…" : "Salvar alterações"}
      </button>

      <p className="mt-6 border-t border-slate-600/40 pt-4 text-xs text-slate-500">
        Fila de espera: em breve. Você poderá cadastrar interessados e avisar por WhatsApp quando houver vaga.
      </p>
    </div>
  );
}
