import * as dns from 'node:dns';
import { Agent, setGlobalDispatcher } from 'undici';

/**
 * On some Windows/corporate networks, Node's default `dns.lookup()` (which goes through
 * the OS resolver) hangs or returns stale/IPv6-only results for specific hosts (seen with
 * generativelanguage.googleapis.com and serpapi.com) even though the OS itself reaches
 * those hosts fine over plain TCP/TLS. Querying DNS directly (bypassing the OS resolver,
 * the same mechanism `dns.resolve4`/`resolve6` use) reliably works. This swaps the lookup
 * function undici's fetch uses for outbound connections app-wide.
 */
type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  address?: string | dns.LookupAddress[],
  family?: number,
) => void;

export function useDirectDnsResolution(): void {
  const customLookup = (
    hostname: string,
    options: dns.LookupOptions,
    callback: LookupCallback,
  ) => {
    const wantsAll = Boolean(options?.all);

    dns.resolve4(hostname, (err, addresses) => {
      if (!err && addresses.length) {
        if (wantsAll)
          return callback(
            null,
            addresses.map((address) => ({ address, family: 4 })),
          );
        return callback(null, addresses[0], 4);
      }

      dns.resolve6(hostname, (err6, addr6) => {
        if (!err6 && addr6.length) {
          if (wantsAll)
            return callback(
              null,
              addr6.map((address) => ({ address, family: 6 })),
            );
          return callback(null, addr6[0], 6);
        }
        callback(err ?? err6);
      });
    });
  };

  setGlobalDispatcher(new Agent({ connect: { lookup: customLookup } }));
}
