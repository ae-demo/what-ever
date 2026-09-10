import createClient from "openapi-fetch";
import type { paths } from "./generated/diet-api";
import { getAccessToken, signIn } from "./auth";

export const dietApiClient = createClient<paths>({ baseUrl: "/api" });

dietApiClient.use({
  async onRequest({ request }) {
    const token = await getAccessToken();
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  },
  async onResponse({ response }) {
    if (response.status === 401) {
      // The gateway rejected/expired the token — restart sign-in.
      await signIn();
    }
    return response;
  },
});

// diet-api declares `X-User-Id` as a required header in its openapi.yaml, but
// it is a GATEWAY-INJECTED value derived from the bearer token — never set by
// this app (thunder-authentication, react-webapp same-origin proxy). This
// placeholder only satisfies the generated client's required-header type; the
// same-origin nginx proxy clears any client-supplied X-User-Id before the
// request leaves the pod, and the platform gateway injects the real one.
const GATEWAY_INJECTED_HEADER = { "X-User-Id": "gateway-injected" } as const;

export function withUserHeader<T extends Record<string, unknown>>(extra?: T) {
  return { header: { ...GATEWAY_INJECTED_HEADER, ...(extra ?? {}) } };
}
