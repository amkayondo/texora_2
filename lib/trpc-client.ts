import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/server/api/root";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
