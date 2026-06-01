import React from "react";

/**
 * Do not wrap with ConfigurationInitializer: it always mounts with isLoading=true
 * and only clears after useEffect, so headless PDF/PPTX export captures the
 * "Initializing Application" screen. Export only needs the slide renderer; no LLM check.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      {children}
    </>
  );
}
