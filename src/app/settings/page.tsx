"use client";

import { useState } from "react";
import { MOCK_USERS } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User, KeyRound, Lock, Bell, Palette,
  Globe, MapPin, AlertTriangle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Section = "profile" | "account" | "privacy" | "notifications" | "appearance";

interface NavItem {
  key: Section;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { key: "profile",       label: "Profile",       icon: <User className="w-4 h-4" /> },
  { key: "account",       label: "Account",       icon: <KeyRound className="w-4 h-4" /> },
  { key: "privacy",       label: "Privacy",       icon: <Lock className="w-4 h-4" /> },
  { key: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { key: "appearance",    label: "Appearance",    icon: <Palette className="w-4 h-4" /> },
];

// ── Toggle component ──────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={`relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors ${
          checked ? "bg-yellow-brand" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </label>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  );
}

// ── Input with optional icon prefix ──────────────────────────────────────────

function InputField({
  label,
  placeholder,
  defaultValue = "",
  icon,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  icon?: React.ReactNode;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`w-full h-9 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground ${
            icon ? "pl-9 pr-3" : "px-3"
          }`}
        />
      </div>
    </div>
  );
}

// ── Main Settings page ────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile");

  const shrey = MOCK_USERS.shrey;

  // Bio counter
  const [bio, setBio] = useState(shrey.bio);

  // Privacy toggles
  const [publicProfile, setPublicProfile] = useState(true);
  const [showStarred, setShowStarred] = useState(true);
  const [allowForking, setAllowForking] = useState(true);
  const [showInSearch, setShowInSearch] = useState(true);

  // Notification toggles
  const [notifyStars, setNotifyStars] = useState(true);
  const [notifyForks, setNotifyForks] = useState(true);
  const [notifyTasteTests, setNotifyTasteTests] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  // Appearance
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1080px] mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-8">Settings</h1>

        <div className="flex gap-8">
          {/* ── Sidebar ──────────────────────────────────────────────────────── */}
          <nav className="w-48 shrink-0">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                      activeSection === item.key
                        ? "bg-yellow-subtle dark:bg-yellow-muted text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Content ──────────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* ── Profile ──────────────────────────────────────────────────── */}
            {activeSection === "profile" && (
              <div className="space-y-6">
                <SectionTitle
                  title="Profile"
                  description="This is how others will see you on Forkable."
                />

                {/* Avatar */}
                <div className="flex items-center gap-5 pb-6 border-b border-border">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={shrey.avatarUrl} />
                    <AvatarFallback className="text-xl bg-yellow-light">
                      {shrey.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <button className="h-8 px-3 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors">
                      Change photo
                    </button>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      JPG, PNG or GIF · Max 2 MB
                    </p>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  <InputField
                    label="Display name"
                    defaultValue={shrey.displayName}
                    placeholder="Your name"
                  />

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        @
                      </span>
                      <input
                        type="text"
                        defaultValue={shrey.username}
                        className="w-full h-9 pl-7 pr-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand"
                      />
                    </div>
                  </div>

                  {/* Bio with char counter */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-foreground">Bio</label>
                      <span
                        className={`text-xs ${
                          bio.length > 160 ? "text-red-500" : "text-muted-foreground"
                        }`}
                      >
                        {bio.length}/160
                      </span>
                    </div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      maxLength={160}
                      placeholder="A short bio about yourself"
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground resize-none"
                    />
                  </div>

                  <InputField
                    label="Location"
                    placeholder="San Francisco, CA"
                    icon={<MapPin className="w-3.5 h-3.5" />}
                  />
                  <InputField
                    label="Website"
                    placeholder="https://yoursite.com"
                    icon={<Globe className="w-3.5 h-3.5" />}
                  />

                  {/* Social links */}
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm font-medium text-foreground mb-3">Social links</p>
                    <div className="space-y-3">
                      <InputField
                        label="GitHub"
                        placeholder="yourusername"
                        icon={<span className="text-xs font-bold text-muted-foreground">GH</span>}
                      />
                      <InputField
                        label="X (Twitter)"
                        placeholder="@yourusername"
                        icon={<span className="text-xs font-bold text-muted-foreground">𝕏</span>}
                      />
                      <InputField
                        label="Instagram"
                        placeholder="@yourusername"
                        icon={<span className="text-xs font-bold text-muted-foreground">IG</span>}
                      />
                    </div>
                  </div>
                </div>

                <button className="h-9 px-5 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-sm font-semibold hover:bg-yellow-hover transition-colors">
                  Save profile
                </button>
              </div>
            )}

            {/* ── Account ──────────────────────────────────────────────────── */}
            {activeSection === "account" && (
              <div className="space-y-8">
                <SectionTitle title="Account" />

                {/* Email */}
                <div className="space-y-4 pb-6 border-b border-border">
                  <InputField
                    label="Email address"
                    defaultValue="shrey@example.com"
                    placeholder="you@example.com"
                    type="email"
                  />
                  <button className="h-9 px-5 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-sm font-semibold hover:bg-yellow-hover transition-colors">
                    Update email
                  </button>
                </div>

                {/* Change password */}
                <div className="space-y-4 pb-6 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">Change password</p>
                  <InputField label="Current password" type="password" placeholder="••••••••" />
                  <InputField label="New password" type="password" placeholder="••••••••" />
                  <InputField label="Confirm new password" type="password" placeholder="••••••••" />
                  <button className="h-9 px-5 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-sm font-semibold hover:bg-yellow-hover transition-colors">
                    Change password
                  </button>
                </div>

                {/* Danger zone */}
                <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <p className="text-sm font-semibold text-red-500">Danger zone</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    Once you delete your account, there is no going back. All your recipes, forks,
                    and cookbooks will be permanently deleted.
                  </p>
                  <button className="h-9 px-4 rounded-lg border border-red-500/60 text-red-500 text-sm font-medium hover:bg-red-500/10 transition-colors">
                    Delete account
                  </button>
                </div>
              </div>
            )}

            {/* ── Privacy ──────────────────────────────────────────────────── */}
            {activeSection === "privacy" && (
              <div>
                <SectionTitle
                  title="Privacy"
                  description="Control who can see your profile and recipes."
                />
                <div className="rounded-xl border border-border bg-card px-5">
                  <ToggleRow
                    label="Public profile"
                    description="Others can find and view your profile page."
                    checked={publicProfile}
                    onChange={setPublicProfile}
                  />
                  <ToggleRow
                    label="Show starred recipes"
                    description="Your starred recipes are visible on your profile."
                    checked={showStarred}
                    onChange={setShowStarred}
                  />
                  <ToggleRow
                    label="Allow recipe forking"
                    description="Other cooks can remix your public recipes."
                    checked={allowForking}
                    onChange={setAllowForking}
                  />
                  <ToggleRow
                    label="Show in search results"
                    description="Your profile appears in Explore searches."
                    checked={showInSearch}
                    onChange={setShowInSearch}
                  />
                </div>
              </div>
            )}

            {/* ── Notifications ─────────────────────────────────────────────── */}
            {activeSection === "notifications" && (
              <div>
                <SectionTitle
                  title="Notifications"
                  description="Choose what you want to be notified about."
                />
                <div className="rounded-xl border border-border bg-card px-5">
                  <ToggleRow
                    label="Someone stars my recipe"
                    checked={notifyStars}
                    onChange={setNotifyStars}
                  />
                  <ToggleRow
                    label="Someone forks my recipe"
                    checked={notifyForks}
                    onChange={setNotifyForks}
                  />
                  <ToggleRow
                    label="New taste test comment"
                    checked={notifyTasteTests}
                    onChange={setNotifyTasteTests}
                  />
                  <ToggleRow
                    label="Weekly digest"
                    description="A roundup of activity on your recipes every Monday."
                    checked={weeklyDigest}
                    onChange={setWeeklyDigest}
                  />
                </div>
              </div>
            )}

            {/* ── Appearance ───────────────────────────────────────────────── */}
            {activeSection === "appearance" && (
              <div>
                <SectionTitle
                  title="Appearance"
                  description="Customise how Forkable looks for you."
                />

                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(["system", "light", "dark"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          theme === t
                            ? "border-yellow-brand bg-yellow-subtle dark:bg-yellow-muted"
                            : "border-border bg-card hover:border-yellow-brand/40"
                        }`}
                      >
                        {/* Mini theme preview */}
                        <div
                          className={`w-12 h-8 rounded-md border border-border overflow-hidden ${
                            t === "dark"
                              ? "bg-[oklch(0.18_0_0)]"
                              : t === "light"
                              ? "bg-white"
                              : "bg-gradient-to-br from-white to-[oklch(0.18_0_0)]"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium capitalize ${
                            theme === t ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {t}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Theme changes apply immediately.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
