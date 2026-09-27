import type { Metadata } from "next";

const TITLE = "Sign up";
const DESCRIPTION = "Create a Clearpath account.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: `${TITLE} - Clearpath`, description: DESCRIPTION },
  twitter: { title: `${TITLE} - Clearpath`, description: DESCRIPTION },
};

export default function RegisterLayout({ children }: LayoutProps<"/register">) {
  return children;
}
