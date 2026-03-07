"use client";

interface WhatsAppModalProps {
  data: {
    guest_name: string;
    guest_phone: string;
    reservation_date: string;
    reservation_time: string;
    observation: string | null;
  };
  companyWhatsapp?: string | null;
  onClose: () => void;
}

function formatWhatsAppDisplay(num: string): string {
  const d = num.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length >= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return num;
}

export function WhatsAppModal({ data, companyWhatsapp, onClose }: WhatsAppModalProps) {
  const phone = data.guest_phone.replace(/\D/g, "");
  const text = encodeURIComponent(
    `Olá ${data.guest_name}! Sua reserva foi confirmada para o dia ${data.reservation_date} às ${data.reservation_time}.${data.observation ? ` Observação: ${data.observation}` : ""} Qualquer dúvida, pode entrar em contato conosco através do WhatsApp. Obrigado!`
  );
  const whatsappUrl = `https://wa.me/55${phone}?text=${text}`;

  function openWhatsApp() {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-[#32C76A]">
          Reserva concluída
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          Envie a confirmação para o cliente pelo WhatsApp (abre na mesma janela do navegador).
        </p>
        <div className="mt-4 rounded-xl bg-black/30 p-3 text-sm text-slate-200">
          <p><strong className="text-slate-300">Nome:</strong> {data.guest_name}</p>
          <p><strong className="text-slate-300">Telefone:</strong> {data.guest_phone}</p>
          <p><strong className="text-slate-300">Data:</strong> {data.reservation_date}</p>
          <p><strong className="text-slate-300">Horário:</strong> {data.reservation_time}</p>
          {data.observation && (
            <p><strong className="text-slate-300">Observação:</strong> {data.observation}</p>
          )}
        </div>
        <p className="mt-4 text-sm text-slate-300">
          Qualquer dúvida, pode entrar em contato conosco através do WhatsApp.
          {companyWhatsapp ? (
            <> <strong className="text-[#32C76A]">{formatWhatsAppDisplay(companyWhatsapp)}</strong></>
          ) : (
            <> (Informe o WhatsApp cadastrado da empresa em Configurações ou no cadastro da empresa.)</>
          )}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={openWhatsApp}
            className="flex-1 rounded-xl bg-[#25D366] py-2.5 font-medium text-white hover:bg-[#20bd5a]"
          >
            Abrir WhatsApp
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 font-medium text-slate-200 hover:bg-white/20"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
