export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[var(--bg-nav)] py-6">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-[var(--text-muted)]">
        © {new Date().getFullYear()} SO.RH.IA. Todos os direitos reservados.
      </div>
    </footer>
  );
}
