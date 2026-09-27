import type { Metadata } from "next";

const TITLE = "Log in";
const DESCRIPTION = "Log in to your Clearpath account.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: `${TITLE} - Clearpath`, description: DESCRIPTION },
  twitter: { title: `${TITLE} - Clearpath`, description: DESCRIPTION },
};

export default function LoginLayout({ children }: LayoutProps<"/login">) {
  return children;
}
