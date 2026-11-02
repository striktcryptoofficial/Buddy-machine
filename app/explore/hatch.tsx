"use client";

import dynamic from "next/dynamic";

const Machine = dynamic(() => import("./machine"), { ssr: false });

export function Hatch() {
  return <Machine />;
}
