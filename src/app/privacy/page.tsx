import Link from "next/link";

export const metadata = { title: "Privacy Policy — Forkable" };

const EFFECTIVE_DATE = "1 August 2026";
const CONTACT_EMAIL = "privacy@forkable.io";

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold text-yellow-brand uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-3xl font-bold text-foreground mb-3">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Effective date: {EFFECTIVE_DATE}</p>
      </div>

      <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
        <Section title="1. Introduction">
          <p>Forkable (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our recipe-collaboration platform.</p>
        </Section>

        <Section title="2. Information We Collect">
          <Subsection title="2.1 Information you provide">
            <ul className="list-disc list-inside space-y-1 mt-1 text-muted-foreground">
              <li>Account details: name, email address, username, profile photo</li>
              <li>Profile information: bio, location, website, social links</li>
              <li>Recipe content: ingredients, instructions, photos, tags</li>
              <li>Communications: emails or messages sent to us</li>
            </ul>
          </Subsection>
          <Subsection title="2.2 Information collected automatically">
            <ul className="list-disc list-inside space-y-1 mt-1 text-muted-foreground">
              <li>Usage data: pages visited, features used, time spent</li>
              <li>Device information: browser type, operating system, IP address</li>
              <li>Cookies and similar tracking technologies (see Section 6)</li>
            </ul>
          </Subsection>
          <Subsection title="2.3 Information from third parties">
            <p className="text-muted-foreground mt-1">If you sign in via Google, we receive your name, email, and profile photo from Google as permitted by your Google account settings.</p>
          </Subsection>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use your information to:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
            <li>Provide, operate, and improve the Service</li>
            <li>Personalise your recipe feed and recommendations</li>
            <li>Send notifications about activity on your recipes</li>
            <li>Respond to support requests and enquiries</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="mt-3">We do not sell your personal information to third parties.</p>
        </Section>

        <Section title="4. Sharing of Information">
          <p>We may share your information with:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
            <li><strong className="text-foreground">Service providers:</strong> hosting (Neon/Vercel), storage (Cloudflare R2), authentication (NextAuth)</li>
            <li><strong className="text-foreground">Other users:</strong> your public profile, recipes, and activity are visible to other users</li>
            <li><strong className="text-foreground">Legal requirements:</strong> when required by law or to protect our legal rights</li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>We retain your account information for as long as your account is active. You may delete your account at any time in Settings, which will remove your personal information within 30 days. Public recipes may be retained in anonymised form.</p>
        </Section>

        <Section title="6. Cookies">
          <p>We use essential cookies for authentication sessions and preferences (e.g. theme). We do not use third-party advertising cookies. You can disable cookies in your browser, but this may affect Service functionality.</p>
        </Section>

        <Section title="7. Security">
          <p>We implement industry-standard security measures including HTTPS, hashed passwords (bcrypt), and access controls. No method of transmission over the internet is 100% secure; we cannot guarantee absolute security.</p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>The Service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, contact us and we will delete it promptly.</p>
        </Section>

        <Section title="9. Your Rights">
          <p>Depending on your location, you may have rights to:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
            <li>Access, correct, or delete your personal data</li>
            <li>Object to or restrict certain processing</li>
            <li>Data portability (export your recipes)</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p className="mt-3">To exercise these rights, contact us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-yellow-brand hover:underline">{CONTACT_EMAIL}</a>.</p>
        </Section>

        <Section title="10. International Transfers">
          <p>Your data may be transferred to and processed in countries outside your own, including the United States. We take steps to ensure appropriate safeguards are in place for such transfers.</p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on the Service. Your continued use after changes constitutes acceptance.</p>
        </Section>

        <Section title="12. Contact Us">
          <p>For privacy questions or to exercise your rights, contact our Privacy team at <a href={`mailto:${CONTACT_EMAIL}`} className="text-yellow-brand hover:underline">{CONTACT_EMAIL}</a>.</p>
        </Section>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
        <Link href="/" className="hover:text-foreground transition-colors">Back to Forkable</Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground mb-2">{title}</h2>
      {children}
    </div>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="font-medium text-foreground">{title}</p>
      {children}
    </div>
  );
}
