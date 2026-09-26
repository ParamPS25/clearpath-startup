import type { Metadata } from "next";

const TITLE = "SEO rank check";
const DESCRIPTION =
  "See where a domain currently ranks for the keywords that matter, and who's outranking it.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: `${TITLE} - Clearpath`, description: DESCRIPTION },
  twitter: { title: `${TITLE} - Clearpath`, description: DESCRIPTION },
};

export default function SeoCheckLayout({ children }: LayoutProps<"/seo-check">) {
  return children;
}
