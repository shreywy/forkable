import { Suspense } from "react";

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
