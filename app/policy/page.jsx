export const metadata = {
  title: "Policy",
  description: "Privacy and platform policy for Mahber.",
  alternates: {
    canonical: "/policy",
  },
};

const sectionStyle = {
  marginTop: 22,
  paddingTop: 16,
  borderTop: "1px solid var(--theme-border)",
};

export default function PolicyPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "28px 16px 56px", color: "var(--theme-text)" }}>
      <div
        style={{
          width: "min(860px, 100%)",
          margin: "0 auto",
          background: "var(--theme-surface)",
          border: "1px solid var(--theme-border)",
          borderRadius: 16,
          padding: 24,
        }}
      >
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 2.8rem)", lineHeight: 1.05 }}>Mahber Policy</h1>
        <p style={{ marginTop: 10, color: "var(--theme-muted)", lineHeight: 1.65 }}>
          Effective date: March 25, 2026. This page explains how Mahber handles account data, community content,
          and platform safety.
        </p>

        <section style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: 22 }}>1. Data We Store</h2>
          <p style={{ color: "var(--theme-muted)", lineHeight: 1.7 }}>
            We store account profile data, created mahber records, interaction counters, and moderation actions needed
            to run the platform. Authentication cookies are used for signed-in sessions.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: 22 }}>2. How Data Is Used</h2>
          <p style={{ color: "var(--theme-muted)", lineHeight: 1.7 }}>
            Data is used to power feed ranking, show joins and boosts, secure admin features, and improve reliability.
            We do not sell personal data.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: 22 }}>3. Content and Safety</h2>
          <p style={{ color: "var(--theme-muted)", lineHeight: 1.7 }}>
            Users are responsible for content they post. Mahber may remove abusive, illegal, or deceptive content and
            may suspend accounts that repeatedly violate platform rules.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: 22 }}>4. Your Choices</h2>
          <p style={{ color: "var(--theme-muted)", lineHeight: 1.7 }}>
            You can update or remove your own community content and log out at any time. For support or removal
            requests, contact the Mahber admin team.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: 22 }}>5. Contact</h2>
          <p style={{ color: "var(--theme-muted)", lineHeight: 1.7 }}>
            For policy questions, use the official Mahber support channel linked from the app homepage.
          </p>
        </section>
      </div>
    </main>
  );
}
