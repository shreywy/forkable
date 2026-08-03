// Route group layout — centers auth pages in the remaining viewport below the Navbar.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-12">
      {children}
    </div>
  );
}
