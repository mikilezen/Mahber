import dynamic from "next/dynamic";

const MahberSocial = dynamic(() => import("../mahber-social"), {
  ssr: false,
});

export default function HomePage() {
  return <MahberSocial />;
}
