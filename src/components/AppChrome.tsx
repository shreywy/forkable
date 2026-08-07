"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// Cook mode is a full-viewport, distraction-free experience - showing the
// site chrome around it pushes the step content past 100vh and forces a
// page-level scroll on every step. Hide Navbar/Footer there so cook mode's
// own min-h-screen container is the only thing filling the viewport.
function isChromeless(pathname: string): boolean {
  return /\/[^/]+\/[^/]+\/cook(\/|$)/.test(pathname);
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const chromeless = isChromeless(pathname ?? "");

  if (chromeless) {
    return <main className="flex-1 flex flex-col">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
