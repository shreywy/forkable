import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClientProviders } from "@/components/ClientProviders";
import { auth } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forkable: Version control for recipes",
  description:
    "Fork, remix, and collaborate on recipes. The friendly way to cook together.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background" suppressHydrationWarning>
        {/* FOUC prevention — beforeInteractive runs before React hydrates, no warning */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('forkable-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}else{document.documentElement.classList.add('dark');document.documentElement.classList.remove('light')}}catch(e){}})();`,
          }}
        />
        <ClientProviders session={session}>
          <ThemeProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
