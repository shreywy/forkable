"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, GitFork, Check, X } from "lucide-react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/lib/actions/auth";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number or symbol", ok: /[0-9!@#$%^&*]/.test(password) },
  ];
  if (!password) return null;
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-red-500", "bg-orange-400", "bg-yellow-brand", "bg-green-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score] : "bg-muted"}`} />
        ))}
        <span className="text-[10px] text-muted-foreground ml-1">{labels[score]}</span>
      </div>
      <div className="flex gap-3">
        {checks.map((c) => (
          <span key={c.label} className={`flex items-center gap-1 text-[10px] ${c.ok ? "text-green-500" : "text-muted-foreground"}`}>
            {c.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate username from display name
  const handleNameChange = (v: string) => {
    setDisplayName(v);
    if (!username || username === displayName.toLowerCase().replace(/\s+/g, "_")) {
      setUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!displayName || !email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    const result = await registerUser({ displayName, username, email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo mark */}
      <div className="flex flex-col items-center mb-8">
        <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-yellow-brand text-white shadow mb-4">
          <GitFork className="w-6 h-6" strokeWidth={2.5} />
        </span>
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">Start forking recipes today - it&apos;s free</p>
      </div>

      {/* Google SSO */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
        className="w-full flex items-center justify-center gap-3 h-10 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium text-foreground transition-colors mb-4"
      >
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-muted-foreground">or sign up with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Display name */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Display name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={displayName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Nonna Rosa"
              autoComplete="name"
              className="w-full h-10 pl-9 pr-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground transition-all"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Username</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="nonna_rosa"
              autoComplete="username"
              className="w-full h-10 pl-7 pr-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground transition-all font-mono"
            />
          </div>
          {username && (
            <p className="text-[10px] text-muted-foreground mt-1">
              forkable.io/<span className="text-foreground">{username}</span>
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full h-10 pl-9 pr-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full h-10 pl-9 pr-10 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-xl bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-[10px] text-muted-foreground mt-4 leading-relaxed">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="text-yellow-brand hover:underline">Terms of Service</Link>
        {" "}and{" "}
        <Link href="/privacy" className="text-yellow-brand hover:underline">Privacy Policy</Link>.
      </p>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-yellow-brand hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}
