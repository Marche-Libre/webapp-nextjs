import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-base-200 px-4 py-6">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-6">
        <img src="/images/drapeau.jpg" alt="MarchéLibre" className="w-8 h-8 object-contain" />
        <span className="font-bold text-[17px] text-base-content tracking-tight">
          MarchéLibre
        </span>
      </Link>

      <div className="w-full max-w-[400px]">{children}</div>

      <p className="mt-6 text-xs text-base-content/30">
        © 2026 MarchéLibre
      </p>
    </div>
  );
}
