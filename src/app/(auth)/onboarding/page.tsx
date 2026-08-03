"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Camera, MapPin, Globe, AtSign,
  Check, ChevronRight, ChevronLeft,
  Sparkles, Sun, Moon, Monitor, UserPlus, Utensils, Link2,
} from "lucide-react";
import { MOCK_USERS } from "@/lib/mock-data";

// ── Data ──────────────────────────────────────────────────────────────────────

const CUISINE_TAGS = [
  "Italian", "Japanese", "Mexican", "Indian", "Thai", "French",
  "Mediterranean", "Chinese", "Korean", "Middle Eastern", "American", "Greek",
];

const DIETARY_TAGS = [
  "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto",
  "Paleo", "Nut-Free", "Low-Carb", "High-Protein", "Low-Calorie",
];

const COOKING_STYLE_TAGS = [
  "Quick & Easy", "Meal Prep", "Baking", "BBQ & Grilling", "One-Pot",
  "Budget-Friendly", "Fine Dining", "Comfort Food", "Healthy", "Kid-Friendly",
];

const SUGGESTED_USERS = [
  MOCK_USERS.nonna_rosa,
  MOCK_USERS.kenji_tokyo,
  MOCK_USERS.vegan_vivienne,
  MOCK_USERS.gluten_free_gary,
];

const STEPS = [
  { id: "profile", label: "Profile" },
  { id: "about", label: "About you" },
  { id: "taste", label: "Taste profile" },
  { id: "theme", label: "Theme" },
  { id: "follow", label: "Who to follow" },
];

// ── Step sub-components ───────────────────────────────────────────────────────

function TagPill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
        selected
          ? "bg-yellow-brand border-yellow-brand text-[oklch(0.12_0_0)]"
          : "border-border bg-card hover:border-yellow-brand/50 text-foreground"
      }`}
    >
      {selected && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
      {label}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 0: Profile
  const [avatarUrl, setAvatarUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");

  // Step 1: About
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [githubHandle, setGithubHandle] = useState("");

  // Step 2: Taste profile
  const [selectedCuisines, setSelectedCuisines] = useState<Set<string>>(new Set());
  const [selectedDietary, setSelectedDietary] = useState<Set<string>>(new Set());
  const [selectedStyle, setSelectedStyle] = useState<Set<string>>(new Set());

  // Step 3: Theme
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");

  // Step 4: Who to follow
  const [following, setFollowing] = useState<Set<string>>(new Set());

  // Step 5: Done
  const [saving, setSaving] = useState(false);

  const toggleSet = (set: Set<string>, setFn: (s: Set<string>) => void, value: string) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value); else next.add(value);
    setFn(next);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  };

  const handleFinish = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    router.push("/feed");
  };

  const totalSteps = STEPS.length;
  const isLast = step === totalSteps - 1;

  // Progress %
  const progressPct = ((step) / totalSteps) * 100;

  return (
    <div className="w-full max-w-lg">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Step {step + 1} of {totalSteps}
          </span>
          <span className="text-xs text-muted-foreground">{STEPS[step].label}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-brand rounded-full transition-all duration-500"
            style={{ width: `${progressPct + (1 / totalSteps) * 100}%` }}
          />
        </div>
        {/* Step pills */}
        <div className="flex items-center justify-between mt-3">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                i < step
                  ? "bg-green-500 text-white"
                  : i === step
                    ? "bg-yellow-brand text-[oklch(0.12_0_0)]"
                    : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-[9px] font-medium hidden sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Step 0: Profile setup ──────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Set up your profile</h2>
            <p className="text-sm text-muted-foreground mt-1">This is how other cooks will see you</p>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border cursor-pointer group"
              onClick={() => fileRef.current?.click()}
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-muted-foreground">
                    {displayName ? displayName[0].toUpperCase() : "?"}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-yellow-brand hover:underline"
            >
              Upload photo
            </button>
            {/* Or use DiceBear */}
            {!avatarUrl && (
              <div className="flex gap-2 flex-wrap justify-center">
                {["shrey2", "cook1", "chef99", "foody"].map((seed) => (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => setAvatarUrl(`https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}`)}
                    className="w-9 h-9 rounded-full overflow-hidden border-2 border-border hover:border-yellow-brand transition-colors"
                  >
                    <Image
                      src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}`}
                      alt={seed}
                      width={36}
                      height={36}
                    />
                  </button>
                ))}
                <span className="text-[10px] text-muted-foreground self-center ml-1">or pick an avatar</span>
              </div>
            )}
          </div>

          {/* Display name */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (!username) {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, ""));
                  }
                }}
                placeholder="Nonna Rosa"
                className="w-full h-10 px-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="nonna_rosa"
                  className="w-full h-10 pl-7 pr-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground font-mono"
                />
              </div>
              {username && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  forkable.io/<span className="text-foreground">{username}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 1: About you ──────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">Tell us about yourself</h2>
            <p className="text-sm text-muted-foreground mt-1">Help other cooks get to know you — all optional</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={160}
              placeholder="Home cook. Obsessed with pasta and anything umami."
              className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground resize-none"
            />
            <p className="text-[10px] text-muted-foreground text-right mt-1">{bio.length}/160</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="London, UK"
                  className="w-full h-9 pl-8 pr-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="yoursite.com"
                  className="w-full h-9 pl-8 pr-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-medium text-foreground">Social links</label>
            {[
              { label: "X / Twitter", value: twitter, set: setTwitter, icon: AtSign, placeholder: "@yourhandle" },
              { label: "Instagram", value: instagram, set: setInstagram, icon: AtSign, placeholder: "@yourhandle" },
              { label: "GitHub", value: githubHandle, set: setGithubHandle, icon: Link2, placeholder: "@yourhandle" },
            ].map(({ label, value, set, icon: Icon, placeholder }) => (
              <div key={label} className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={`${label} — ${placeholder}`}
                  className="w-full h-9 pl-8 pr-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2: Taste profile ─────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Your taste profile</h2>
            <p className="text-sm text-muted-foreground mt-1">We&apos;ll use this to personalise your feed and recommendations</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Utensils className="w-4 h-4 text-yellow-brand" />
              <p className="text-sm font-semibold text-foreground">Favourite cuisines</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TAGS.map((t) => (
                <TagPill
                  key={t}
                  label={t}
                  selected={selectedCuisines.has(t)}
                  onClick={() => toggleSet(selectedCuisines, setSelectedCuisines, t)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Dietary preferences</p>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map((t) => (
                <TagPill
                  key={t}
                  label={t}
                  selected={selectedDietary.has(t)}
                  onClick={() => toggleSet(selectedDietary, setSelectedDietary, t)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Cooking style</p>
            <div className="flex flex-wrap gap-2">
              {COOKING_STYLE_TAGS.map((t) => (
                <TagPill
                  key={t}
                  label={t}
                  selected={selectedStyle.has(t)}
                  onClick={() => toggleSet(selectedStyle, setSelectedStyle, t)}
                />
              ))}
            </div>
          </div>

          {(selectedCuisines.size + selectedDietary.size + selectedStyle.size) === 0 && (
            <p className="text-xs text-muted-foreground">Pick at least one to personalise your feed — or skip for now</p>
          )}
        </div>
      )}

      {/* ── Step 3: Theme ─────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Choose your theme</h2>
            <p className="text-sm text-muted-foreground mt-1">You can change this any time in settings</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(["dark", "light", "system"] as const).map((t) => {
              const icons = { dark: Moon, light: Sun, system: Monitor };
              const labels = { dark: "Dark", light: "Light", system: "System" };
              const descriptions = {
                dark: "Easy on the eyes",
                light: "Crisp and bright",
                system: "Follows your OS",
              };
              const Icon = icons[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    theme === t
                      ? "border-yellow-brand bg-yellow-subtle dark:bg-yellow-muted"
                      : "border-border bg-card hover:border-yellow-brand/40"
                  }`}
                >
                  {/* Mini preview */}
                  <div className={`w-full h-16 rounded-xl overflow-hidden ${t === "light" ? "bg-white border border-gray-200" : t === "dark" ? "bg-[#1a1a1a]" : "bg-gradient-to-br from-[#1a1a1a] to-white"}`}>
                    <div className={`h-3 mx-2 mt-2 rounded-full ${t === "light" ? "bg-gray-200" : "bg-white/10"}`} />
                    <div className={`h-2 mx-2 mt-1.5 w-3/4 rounded-full ${t === "light" ? "bg-yellow-300" : "bg-yellow-brand/60"}`} />
                    <div className={`h-2 mx-2 mt-1.5 w-1/2 rounded-full ${t === "light" ? "bg-gray-100" : "bg-white/5"}`} />
                  </div>
                  <Icon className={`w-4 h-4 ${theme === t ? "text-yellow-brand" : "text-muted-foreground"}`} />
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${theme === t ? "text-foreground" : "text-foreground"}`}>{labels[t]}</p>
                    <p className="text-[10px] text-muted-foreground">{descriptions[t]}</p>
                  </div>
                  {theme === t && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-yellow-brand flex items-center justify-center">
                      <Check className="w-3 h-3 text-[oklch(0.12_0_0)]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Dark mode</strong> is our recommended default —
              great for late-night cooking sessions and easier on the eyes in the kitchen.
            </p>
          </div>
        </div>
      )}

      {/* ── Step 4: Who to follow ─────────────────────────────────── */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Follow some cooks</h2>
            <p className="text-sm text-muted-foreground mt-1">Your feed will be empty without some follows. Here are some great chefs to start with.</p>
          </div>

          <div className="space-y-3">
            {SUGGESTED_USERS.map((user) => {
              const isFollowing = following.has(user.username);
              return (
                <div
                  key={user.username}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                >
                  <Image
                    src={user.avatarUrl}
                    alt={user.displayName}
                    width={44}
                    height={44}
                    className="rounded-full bg-muted shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.bio}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:block">{user.followers.toLocaleString()} followers</span>
                    <button
                      type="button"
                      onClick={() => toggleSet(following, setFollowing, user.username)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isFollowing
                          ? "bg-muted text-foreground border border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
                          : "bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)]"
                      }`}
                    >
                      {isFollowing ? (
                        <><Check className="w-3 h-3" /> Following</>
                      ) : (
                        <><UserPlus className="w-3 h-3" /> Follow</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {following.size === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Follow at least one cook to get started, or skip and discover later on the{" "}
              <span className="text-yellow-brand">Explore</span> page.
            </p>
          )}
        </div>
      )}

      {/* ── Navigation ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-2 px-4 h-10 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="button"
          onClick={() => {
            if (isLast) { handleFinish(); }
            else { setStep((s) => s + 1); }
          }}
          disabled={saving}
          className="flex items-center gap-2 px-6 h-10 rounded-xl bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {saving ? (
            "Setting up your account…"
          ) : isLast ? (
            <><Sparkles className="w-4 h-4" /> Start cooking!</>
          ) : (
            <>Continue <ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>

      {/* Skip link */}
      {!isLast && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="hover:underline"
          >
            Skip this step
          </button>
        </p>
      )}
    </div>
  );
}
