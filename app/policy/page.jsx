export const metadata = {
  title: "Policy",
  description: "Mahber platform policy in clear and readable language.",
  alternates: {
    canonical: "/policy",
  },
};

const sectionStyle = {
  marginTop: 22,
  paddingTop: 14,
  borderTop: "1px solid #e5e7eb",
};

export default function PolicyPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px 16px 56px",
        background: "#f8fafc",
        color: "#111827",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <article
        style={{
          width: "min(940px, 100%)",
          margin: "0 auto",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: "26px 24px",
          boxShadow: "0 8px 30px rgba(17,24,39,.05)",
        }}
      >
        <p style={{ margin: 0, color: "#6b7280", fontSize: 12, letterSpacing: 0.4, fontWeight: 700 }}>MAHBER</p>
        <h1
          style={{
            margin: "8px 0 0",
            fontSize: "clamp(2rem, 4vw, 2.8rem)",
            lineHeight: 1.05,
            letterSpacing: -0.4,
          }}
        >
          Platform Policy
        </h1>
        <p style={{ marginTop: 10, color: "#4b5563", lineHeight: 1.75 }}>
          Effective date: March 25, 2026. These rules explain acceptable use, moderation standards, and account
          responsibilities on Mahber.
        </p>

        <section style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Acceptable Use</h2>
          <p style={{ color: "#4b5563", lineHeight: 1.75 }}>
            Do not post illegal content, harassment, impersonation, scam campaigns, or coordinated abuse. Keep
            communities respectful and relevant to their purpose.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Moderation and Enforcement</h2>
          <p style={{ color: "#4b5563", lineHeight: 1.75 }}>
            Mahber may remove content, limit visibility, or suspend accounts when policy violations are found. Serious
            or repeated violations may result in permanent restrictions.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Account Responsibility</h2>
          <p style={{ color: "#4b5563", lineHeight: 1.75 }}>
            You are responsible for activity from your account. Protect your login credentials and report unauthorized
            use immediately.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Service Integrity</h2>
          <p style={{ color: "#4b5563", lineHeight: 1.75 }}>
            Do not automate abusive actions, manipulate engagement counters, or bypass security controls. Fair use and
            authentic participation are required.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Policy Updates and Contact</h2>
          <p style={{ color: "#4b5563", lineHeight: 1.75 }}>
            We may update this policy as Mahber evolves. For questions or appeals, contact the Mahber team through
            official support links in the app.
          </p>
        </section>
      </article>
    </main>
  );
}
