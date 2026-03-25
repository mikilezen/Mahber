import HomeShell from "@/components/mahber/home-shell";

export const metadata = {
  title: "Mahber Social | Ethiopian Communities",
  description:
    "Discover, join, and boost Ethiopian mahbers. Explore trending communities, live wars, and creator activity in one place.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Mahber Social | Ethiopian Communities",
    description:
      "Discover, join, and boost Ethiopian mahbers. Explore trending communities, live wars, and creator activity in one place.",
    url: "https://www.mahber.social",
    images: [
      {
        url: "/assets/Group.png",
        width: 512,
        height: 512,
        alt: "Mahber logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahber Social | Ethiopian Communities",
    description:
      "Discover, join, and boost Ethiopian mahbers. Explore trending communities, live wars, and creator activity in one place.",
    images: ["/assets/Group.png"],
  },
};

export default function HomePage() {
  return <HomeShell />;
}
