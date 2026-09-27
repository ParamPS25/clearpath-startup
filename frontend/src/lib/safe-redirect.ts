// Normalizes a callbackUrl query param (which proxy.ts sets as an absolute
// URL) down to a same-origin relative path, so it's safe to pass to
// router.push and can't be used as an open redirect to another origin.
export function resolveCallbackUrl(raw: string | null): string {
  if (!raw) return "/";

  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return "/";
    return `${url.pathname}${url.search}` || "/";
  } catch {
    return "/";
  }
}
