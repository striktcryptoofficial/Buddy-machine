import { SiteStyles } from "@/components/home/site-styles";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteStyles />
      {children}
    </>
  );
}
