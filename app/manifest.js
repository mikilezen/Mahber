export default function manifest() {
  return {
    name: "Mahber Platform",
    short_name: "Mahber",
    description: "Scalable community platform for Ethiopian Mahbers.",
    start_url: "/",
    display: "standalone",
    background_color: "#09131f",
    theme_color: "#0d1b2a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
