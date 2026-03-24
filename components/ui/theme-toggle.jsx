"use client";

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Toggle color theme"
      style={{
        border: "1px solid var(--border)",
        background: "var(--s2)",
        color: "var(--txt)",
        borderRadius: 10,
        padding: "8px 12px",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: 12,
      }}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
