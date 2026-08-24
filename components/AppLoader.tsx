"use client";

import dynamic from "next/dynamic";

const ClientApplication = dynamic(() => import("@/components/ClientApplication"), {
  ssr: false,
  loading: () => (
    <main className="boot-shell" aria-label="Loading FactoryOS">
      <div className="brand-mark brand-mark--large">F</div>
      <p className="eyebrow">FactoryOS</p>
      <div className="boot-line" />
    </main>
  ),
});

export function AppLoader() {
  return <ClientApplication />;
}
