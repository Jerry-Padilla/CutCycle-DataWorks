"use client";

import dynamic from "next/dynamic";

const ClientApplication = dynamic(() => import("@/components/ClientApplication"), {
  ssr: false,
  loading: () => (
    <main className="boot-shell" aria-label="Loading CutCycle DataWorks">
      <div className="brand-mark brand-mark--large">C</div>
      <p className="eyebrow">CutCycle DataWorks</p>
      <div className="boot-line" />
    </main>
  ),
});

export function AppLoader() {
  return <ClientApplication />;
}
