import type { Metadata } from "next";

const TITLE = "Check a name";
const DESCRIPTION =
  "See if a startup name clashes with existing companies or trademarks, how crowded the market is, and where search interest is headed.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: `${TITLE} - Clearpath`, description: DESCRIPTION },
  twitter: { title: `${TITLE} - Clearpath`, description: DESCRIPTION },
};

export default function ValidateLayout({ children }: LayoutProps<"/validate">) {
  return children;
}
