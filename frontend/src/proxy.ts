export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/validate/:path*", "/compare/:path*", "/seo-check/:path*"],
};
