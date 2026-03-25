export const metadata = {
  title: "Privacy",
  description: "Mahber privacy notice in clear and readable language.",
  alternates: {
    canonical: "/privacy",
  },
};

const sectionStyle = {
  marginTop: 22,
  paddingTop: 14,
  borderTop: "1px solid #e5e7eb",
};

export default function PrivacyPage() {
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
          width: "min(920px, 100%)",
          margin: "0 auto",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: "26px 24px",
          boxShadow: "0 8px 30px rgba(17,24,39,.05)",
        }}
      >
        <p style={{ margin: 0, color: "#6b7280", fontSize: 12, letterSpacing: 0.4, fontWeight: 700 }}>MAHBER</p>
        <h1 style={{ margin: "8px 0 0", fontSize: "clamp(2rem, 4vw, 2.8rem)", lineHeight: 1.05, letterSpacing: -0.4 }}>
          Privacy Notice
        </h1>
        <p style={{ marginTop: 10, color: "#4b5563", lineHeight: 1.75 }}>
          Effective date: March 25, 2026. This page explains what information we collect, why we collect it, and what
          options you have.
        </p>

        <section style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Information We Collect</h2>
          <p style={{ color: "#4b5563", lineHeight: 1.75 }}>
            We collect account profile details, mahber content you create, interaction history (such as join and boost
            actions), and limited technical logs needed for security and troubleshooting.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: 22 }}>How We Use Information</h2>
          <p style={{ color: "#4b5563", lineHeight: 1.75 }}>
            We use data to provide core app features, personalize feed rankings, prevent abuse, and keep the platform
            reliable. We do not sell personal information.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: 22 }}>How Long We Keep Data</h2>
          <p style={{ color: "#4b5563", lineHeight: 1.75 }}>
            We keep data as long as needed to operate Mahber, comply with legal requirements, and enforce trust and
            safety rules.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Your Choices</h2>
          <p style={{ color: "#4b5563", lineHeight: 1.75 }}>
            You can request updates or removals of your content and account-linked information through Mahber support
            channels.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Contact</h2>
          <p style={{ color: "#4b5563", lineHeight: 1.75 }}>
            For privacy questions or requests, contact Mahber using official support links shown in the app.
          </p>
        </section>
      </article>
    </main>
  );
}
