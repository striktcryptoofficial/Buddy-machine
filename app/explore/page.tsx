import type { Metadata } from "next";
import { Hatch } from "./hatch";

export const metadata: Metadata = {
  title: "Hatch",
  description: "Hatch a cat of your own.",
};

export default function ExplorePage() {
  return <Hatch />;
}
