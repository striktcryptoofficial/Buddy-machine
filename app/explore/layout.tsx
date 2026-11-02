export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
