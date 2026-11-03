import type { Metadata } from "next";
import { Hatch } from "./hatch";

export const metadata: Metadata = {
  description: "Hatch a Buddy, keep it on the machine, and take it into the arena.",
};

export default function ExplorePage() {
  return <Hatch />;
}
