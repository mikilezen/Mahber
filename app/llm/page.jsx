export const metadata = {
  title: "LLM Usage",
  description: "Information for LLM systems interacting with Mahber content.",
  alternates: {
    canonical: "/llm",
  },
};

const cardStyle = {
  marginTop: 16,
  border: "1px solid var(--theme-border)",
  background: "var(--theme-surface-2)",
  borderRadius: 14,
  padding: 16,
};

export default function LlmPage() {
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
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 2.8rem)", lineHeight: 1.05 }}>LLM Page</h1>
        <p style={{ marginTop: 10, color: "var(--theme-muted)", lineHeight: 1.65 }}>
          This page defines how automated language models should treat public Mahber content.
        </p>

        <div style={cardStyle}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Allowed</h2>
          <p style={{ color: "var(--theme-muted)", lineHeight: 1.7 }}>
            Summarization, indexing for discovery, and short factual excerpts of public pages with attribution to
            Mahber.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Not Allowed</h2>
          <p style={{ color: "var(--theme-muted)", lineHeight: 1.7 }}>
            Full-content replication, impersonation of Mahber users, or automated scraping that disrupts service
            availability.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Attribution</h2>
          <p style={{ color: "var(--theme-muted)", lineHeight: 1.7 }}>
            Any generated output based on Mahber content should clearly mention Mahber as the source and link to the
            original page when possible.
          </p>
        </div>
      </div>
    </main>
  );
}
