"use client";

import { useState, useRef } from "react";
import { updateCompanyProfile, ensureCompanySlug } from "@/app/actions/companies";
import { createClient } from "@/lib/supabase/client";
import { Link2, Copy, Check, ExternalLink, UploadCloud, X, ImageIcon } from "lucide-react";

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
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(company.cover_image_url ?? null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const reservePath = company.slug ? `/reservar/${company.slug}` : null;
  const fullReserveUrl = reservePath ? `${baseUrl}${reservePath}` : null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local imediato
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setMessage(null);
    setUploading(true);

    const supabase = createClient();
    if (!supabase) {
      setMessage({ type: "error", text: "Erro ao conectar com o servidor de arquivos." });
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `covers/${company.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("company-images")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setMessage({ type: "error", text: `Erro no upload: ${uploadError.message}` });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("company-images")
      .getPublicUrl(path);

    setCoverImageUrl(urlData.publicUrl);
    setPreviewUrl(urlData.publicUrl);
    setUploading(false);
    setMessage({ type: "ok", text: "Foto carregada. Clique em Salvar para confirmar." });
  }

  function handleRemoveCover() {
    setCoverImageUrl("");
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

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
      <div className="mt-4 rounded-xl border border-[#32C76A]/30 p-4" style={{ background: "rgba(50,199,106,0.08)" }}>
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

      {/* Foto de capa — upload */}
      <div className="mt-5">
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
          <ImageIcon className="h-4 w-4" />
          Foto de capa
        </label>

        {/* Preview da imagem atual ou selecionada */}
        {previewUrl ? (
          <div className="relative mb-3 overflow-hidden rounded-xl border border-slate-600/40">
            <img src={previewUrl} alt="Capa do restaurante" className="h-40 w-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span className="ml-3 text-sm font-medium text-white">Enviando…</span>
              </div>
            )}
            {!uploading && (
              <button
                type="button"
                onClick={handleRemoveCover}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                title="Remover foto"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div
            className="mb-3 flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-600/50 transition hover:border-[#32C76A]/50"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="h-8 w-8 text-slate-500" />
            <p className="text-sm text-slate-400">Clique para selecionar a foto</p>
            <p className="text-xs text-slate-600">JPG, PNG ou WebP · máx. 5 MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-lg border border-slate-600/40 bg-slate-700/50 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-600/50 disabled:opacity-50"
        >
          <UploadCloud className="h-4 w-4" />
          {previewUrl ? "Trocar foto" : "Escolher foto"}
        </button>
      </div>

      {message && (
        <p className={`mt-3 text-sm ${message.type === "error" ? "text-red-400" : "text-[#32C76A]"}`}>
          {message.text}
        </p>
      )}

      <button
        type="button"
        onClick={handleSaveProfile}
        disabled={saving || uploading}
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
