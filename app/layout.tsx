import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Profesor de Inglés · camino a nativo (C2)",
  description: "Lecciones adaptativas de inglés desde B1 hasta C2: phrasal verbs, idioms, gramática avanzada y registro nativo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
          <nav className="mx-auto flex max-w-2xl items-center justify-between p-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              🎓 Profe<span className="text-emerald-600">Inglés</span>
            </Link>
            <div className="flex gap-1 text-sm font-medium">
              <Link
                href="/lesson"
                className="rounded-full px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Lección
              </Link>
              <Link
                href="/progress"
                className="rounded-full px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Progreso
              </Link>
            </div>
          </nav>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-500 dark:border-zinc-800">
          MVP · B1–B2 · texto · tus datos se guardan entre sesiones
        </footer>
      </body>
    </html>
  );
}
