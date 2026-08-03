import Link from "next/link";

export const metadata = { title: "Terms of Service — Forkable" };

const EFFECTIVE_DATE = "1 August 2026";
const CONTACT_EMAIL = "legal@forkable.io";

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold text-yellow-brand uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-3xl font-bold text-foreground mb-3">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Effective date: {EFFECTIVE_DATE}</p>
      </div>

      <div className="prose-forkable space-y-8 text-sm text-foreground/90 leading-relaxed">
        <Section title="1. Acceptance of Terms">
          <p>By accessing or using Forkable (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. We may update these terms from time to time; continued use of the Service constitutes acceptance of any changes.</p>
        </Section>

        <Section title="2. Description of Service">
          <p>Forkable is a version-control platform for recipes. It allows users to create, share, fork, remix, and collaborate on recipes. The Service is currently in beta and provided &quot;as is&quot; without warranty of any kind.</p>
        </Section>

        <Section title="3. User Accounts">
          <p>You must be at least 13 years old to create an account. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account. Notify us immediately at <a href={`mailto:${CONTACT_EMAIL}`} className="text-yellow-brand hover:underline">{CONTACT_EMAIL}</a> if you suspect unauthorised access.</p>
        </Section>

        <Section title="4. User Content">
          <p>You retain ownership of recipes and content you post. By posting, you grant Forkable a worldwide, non-exclusive, royalty-free licence to host, display, and distribute your content as part of the Service. You are solely responsible for ensuring your content does not infringe third-party rights.</p>
          <p className="mt-3">You may not post content that is illegal, hateful, spam, or that impersonates others. We reserve the right to remove any content that violates these terms.</p>
        </Section>

        <Section title="5. Forks and Remixes">
          <p>Forking a recipe on Forkable creates a copy attributed to the original author. Unless the original author specifies a licence, all publicly posted recipes on Forkable are available under the <strong>Creative Commons Attribution 4.0 International (CC BY 4.0)</strong> licence by default, which requires attribution when adapting or redistributing.</p>
        </Section>

        <Section title="6. Prohibited Conduct">
          <p>You agree not to: (a) use the Service for unlawful purposes; (b) scrape or systematically collect data without permission; (c) attempt to gain unauthorised access to our systems; (d) use the Service to distribute malware or spam; (e) use automated means to create accounts or post content.</p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>The Forkable name, logo, and original software are owned by Forkable and protected by intellectual property laws. You may not use our trademarks without prior written permission.</p>
        </Section>

        <Section title="8. Disclaimer of Warranties">
          <p>The Service is provided &quot;as is&quot; and &quot;as available.&quot; We make no warranties, express or implied, regarding reliability, accuracy, or fitness for a particular purpose. We do not guarantee that recipes are safe, accurate, or free from allergens — always verify ingredients for dietary needs.</p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>To the maximum extent permitted by law, Forkable shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</p>
        </Section>

        <Section title="10. Termination">
          <p>We may suspend or terminate your account at any time for violation of these terms. You may delete your account at any time via Settings. Upon termination, your public recipes may remain visible under the CC BY 4.0 licence.</p>
        </Section>

        <Section title="11. Governing Law">
          <p>These terms are governed by the laws of England and Wales, without regard to conflict-of-law provisions.</p>
        </Section>

        <Section title="12. Contact">
          <p>Questions about these terms? Email us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-yellow-brand hover:underline">{CONTACT_EMAIL}</a>.</p>
        </Section>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
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
