export const metadata = {
  title: "Policy & Privacy",
  description: "Simple policy and privacy information for Mahber users.",
  alternates: {
    canonical: "/policy",
  },
};

export default function PolicyPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 16px 64px",
        color: "var(--theme-text)",
        background:
          "radial-gradient(ellipse 60% 35% at 0% 0%,rgba(218,18,26,.06) 0%,transparent 55%),radial-gradient(ellipse 55% 40% at 100% 100%,rgba(7,137,48,.07) 0%,transparent 55%),var(--theme-bg)",
        fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
      }}
    >
      <div
        style={{
          width: "min(920px, 100%)",
          margin: "0 auto",
          background: "color-mix(in srgb, var(--theme-surface) 92%, transparent)",
          border: "1px solid var(--theme-border)",
          borderRadius: 18,
          padding: "28px 24px",
          backdropFilter: "blur(8px)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: 1.1,
            textTransform: "uppercase",
            color: "var(--theme-muted)",
            fontWeight: 700,
          }}
        >
          Mahber Policy
        </p>
        <h1
          style={{
            margin: "8px 0 0",
            fontSize: "clamp(2rem, 4.5vw, 3rem)",
            lineHeight: 1.06,
            fontWeight: 800,
            letterSpacing: -0.6,
          }}
        >
          Clear, simple rules for privacy and content
        </h1>
        <p style={{ marginTop: 12, color: "var(--theme-muted)", lineHeight: 1.75, fontSize: 15 }}>
          Effective date: March 25, 2026. We keep this page short and readable so everyone can understand how Mahber
          handles data, community safety, and user rights.
        </p>

        <section style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--theme-border)" }}>
          <h2 style={{ margin: 0, fontSize: 21 }}>1. What We Collect</h2>
          <p style={{ color: "var(--theme-muted)", lineHeight: 1.75, fontSize: 15 }}>
            We store profile basics, mahber content you create, interaction counters, and moderation records needed to
            run the app safely.
          </p>
        </section>

        <section style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--theme-border)" }}>
          <h2 style={{ margin: 0, fontSize: 21 }}>2. Why We Use It</h2>
          <p style={{ color: "var(--theme-muted)", lineHeight: 1.75, fontSize: 15 }}>
            Data is used for feed ranking, join and boost actions, fraud prevention, and core platform reliability. We
            do not sell personal data.
          </p>
        </section>

        <section style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--theme-border)" }}>
          <h2 style={{ margin: 0, fontSize: 21 }}>3. Safety and Moderation</h2>
          <p style={{ color: "var(--theme-muted)", lineHeight: 1.75, fontSize: 15 }}>
            Users are responsible for what they post. We may remove abusive, illegal, scam, or impersonation content,
            and we may suspend repeat violators.
          </p>
        </section>

        <section style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--theme-border)" }}>
          <h2 style={{ margin: 0, fontSize: 21 }}>4. Your Controls</h2>
          <p style={{ color: "var(--theme-muted)", lineHeight: 1.75, fontSize: 15 }}>
            You can edit your own content, request removals, and log out anytime. If you need account help, contact
            support through official Mahber channels.
          </p>
        </section>

        <section style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--theme-border)" }}>
          <h2 style={{ margin: 0, fontSize: 21 }}>5. Contact</h2>
          <p style={{ color: "var(--theme-muted)", lineHeight: 1.75, fontSize: 15 }}>
            For policy questions, privacy concerns, or takedown requests, contact the Mahber team from the official
            links available in the app.
          </p>
        </section>
      </div>
    </main>
  );
}
