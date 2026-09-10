/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Mock mode — copied to <app-path>/mock/auth.ts.
//
// This is the one mock file that is NOT verbatim. It is a module substitution,
// so its export list has to be your src/auth.ts's export list: add a mock of
// anything your auth module adds (a resolveRole, a Role type, a getGroups),
// drop what it does not have. Everything below is the standard surface.
//
// mock/plugin.ts resolves every import of src/auth.ts to this file under
// `--mode mock`, so it exports the same names and nothing under src/ changes.
// There is no IDP, no redirect and no token: the caller is always signed in,
// and `?role=` on the URL says as whom.
//
//   /todos              the first role in ./roles.ts
//   /todos?role=Owner   that role
//   /todos?role=        signed in with no role at all
//   /todos?auth=out     NOBODY is signed in, so the app's own sign-in guard
//                       runs; signIn() then drops the parameter, which is the
//                       mock's stand-in for coming back from the IDP. Without
//                       this every sign-in story is unwalkable.
//
// Switching roles is a navigation, so a reviewer compares two roles against one
// running server. A role absent from ./roles.ts is honoured too — that is how a
// screen is checked against a role that must NOT reach it.

import { mockRoles } from "./roles";

export interface MockUser {
  profile: { sub: string; name: string; email: string; groups: string[] };
  access_token: string;
  expired: boolean;
}

function signedOut(): boolean {
  return new URLSearchParams(window.location.search).get("auth") === "out";
}

// A real session (oidc-client-ts + localStorage) carries its roles in the
// persisted ID token, unaffected by client-side navigation. This mock instead
// reads ?role= off the URL — but react-router's <Navigate>/<Link> replace the
// whole location, query string included, the moment the app routes anywhere
// (e.g. a role-based landing redirect from "/"). Without persistence here, a
// role that isn't first in mock/roles.ts would silently fall back to the
// default on every request after the very first navigation. sessionStorage
// closes that gap: an explicit ?role= (including the empty "no role" case)
// is remembered for the rest of this tab's session, the same way a real
// token would be.
const ROLE_STORAGE_KEY = "aep-mock-role";

function activeRoles(): string[] {
  const asked = new URLSearchParams(window.location.search).get("role");
  if (asked !== null) {
    const roles = asked
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
    sessionStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(roles));
    return roles;
  }
  const stored = sessionStorage.getItem(ROLE_STORAGE_KEY);
  if (stored) {
    try {
      const roles = JSON.parse(stored) as unknown;
      if (Array.isArray(roles)) return roles as string[];
    } catch {
      // fall through to the default below
    }
  }
  return mockRoles.slice(0, 1);
}

function user(): MockUser {
  const groups = activeRoles();
  const who = groups[0] ?? "anonymous";
  const slug = who.toLowerCase().replace(/\s+/g, "-");
  return {
    profile: {
      sub: `mock-${slug}`,
      name: `Mock ${who}`,
      email: `${slug}@example.test`,
      groups,
    },
    access_token: `mock:${groups.map(encodeURIComponent).join(",")}`,
    expired: false,
  };
}

/**
 * The roles carried by an `Authorization: Bearer mock:Manager,Auditor` header.
 * Mock handlers scope their data with this, so a role-gated list is role-gated
 * in mock mode too.
 */
export function rolesFromToken(header: string | null): string[] {
  const token = header?.replace(/^Bearer\s+/i, "") ?? "";
  if (!token.startsWith("mock:")) return [];
  return token
    .slice("mock:".length)
    .split(",")
    .map((r) => decodeURIComponent(r).trim())
    .filter(Boolean);
}

// Signed in already, unless ?auth=out says otherwise — in which case this is
// the redirect coming back: drop the parameter and reload, and the caller finds
// a session where a moment ago there was none.
export async function signIn(): Promise<void> {
  if (!signedOut()) return;
  const url = new URL(window.location.href);
  url.searchParams.delete("auth");
  window.location.assign(url.toString());
}

export async function handleCallback(): Promise<MockUser> {
  return user();
}

export async function signOut(): Promise<void> {
  window.location.assign("/");
}

export async function currentUser(): Promise<MockUser | null> {
  return signedOut() ? null : user();
}

export async function getAccessToken(): Promise<string | null> {
  return signedOut() ? null : user().access_token;
}

export async function getRoles(): Promise<string[]> {
  return signedOut() ? [] : activeRoles();
}

// src/auth.ts's own additions beyond the standard surface — mirrored here so
// the module swap under --mode mock still compiles and behaves the same way.
export function hasRole(groups: string[], keyword: string): boolean {
  const needle = keyword.toLowerCase();
  return groups.some((g) => g.toLowerCase().includes(needle));
}

export type Role = "Dieter" | "Coach" | null;

export function resolveRole(groups: string[]): Role {
  if (hasRole(groups, "dieter")) return "Dieter";
  if (hasRole(groups, "coach")) return "Coach";
  return null;
}
