export function FooterBar() {
  return (
    <footer className="fixed bottom-0 z-30 w-full border-t border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-8 w-full max-w-[1600px] items-center justify-between px-4 md:px-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">2026 pseudoWeb IDE · Estado del sistema: Operativo</span>
        <div className="hidden items-center gap-4 sm:flex">
          <a href="#" className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 transition hover:text-blue-600">
            Privacidad
          </a>
          <a href="#" className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 transition hover:text-blue-600">
            Terminos
          </a>
          <a href="#" className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 transition hover:text-blue-600">
            Estado API
          </a>
        </div>
      </div>
    </footer>
  )
}
