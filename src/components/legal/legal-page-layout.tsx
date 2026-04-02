import Link from "next/link";

export function LegalPageLayout({ title, lastUpdated, children }: { title: string; lastUpdated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-elevated">
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-base">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/images/logo.png" alt="MarchéLibre" className="w-7 h-7 object-contain" />
            <span className="font-bold text-[16px] tracking-tight text-text-primary">MarchéLibre</span>
          </Link>
          <Link href="/" className="text-[13px] text-text-muted hover:text-text-primary transition-colors">
            Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-[28px] font-bold text-text-primary tracking-[-0.02em]">{title}</h1>
          <p className="text-[13px] text-text-muted mt-2">Dernière mise à jour : {lastUpdated}</p>
        </div>
        <div className="prose-legal space-y-8 text-[14px] leading-relaxed text-text-secondary [&_h2]:text-[18px] [&_h2]:font-bold [&_h2]:text-text-primary [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:tracking-[-0.01em] [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:text-text-primary [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_a]:text-primary-500 [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-text-primary [&_strong]:font-semibold">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-text-muted">&copy; 2026 MarchéLibre &mdash; Tous droits réservés</p>
          <div className="flex items-center gap-6 text-[12px] text-text-muted">
            <Link href="/mentions-legales" className="hover:text-text-primary transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-text-primary transition-colors">Confidentialité</Link>
            <Link href="/cgu" className="hover:text-text-primary transition-colors">CGU</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
