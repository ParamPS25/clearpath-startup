import type { Metadata } from "next";

const TITLE = "Compare names";
const DESCRIPTION =
  "Check 2–3 candidate startup names side by side and see which one wins, with the reasoning shown.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: `${TITLE} - Clearpath`, description: DESCRIPTION },
  twitter: { title: `${TITLE} - Clearpath`, description: DESCRIPTION },
};

export default function CompareLayout({ children }: LayoutProps<"/compare">) {
  return children;
}
