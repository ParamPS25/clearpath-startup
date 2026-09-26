import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "@/components/Header";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const SITE_NAME = "Clearpath";
const DEFAULT_TITLE = "Clearpath - Startup Name & Market Validator";
const DEFAULT_DESCRIPTION =
  "Check name clash risk, market crowding, search demand, and SEO rankings for a startup name before you commit.";
const OG_IMAGE = { url: "/clearpath.png", width: 2172, height: 724, alt: SITE_NAME };

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: DEFAULT_TITLE,
    template: `%s - ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "startup name validator",
    "brand name check",
    "name clash checker",
    "market research tool",
    "SEO rank checker",
  ],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

// Runs before paint so the page never flashes the wrong theme on load.
const THEME_INIT_SCRIPT = `
  try {
    var stored = localStorage.getItem('theme');
    var isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${manrope.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
