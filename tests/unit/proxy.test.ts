import { describe, expect, it } from "vitest";

import { decideAuthRedirect } from "@/proxy";

describe("decideAuthRedirect", () => {
  it("redirects unauthenticated application requests to login", () => {
    expect(decideAuthRedirect({ pathname: "/", hasCookie: false })).toBe("/login");
  });

  it("keeps login reachable even when an invalid cookie is present", () => {
    expect(decideAuthRedirect({ pathname: "/login", hasCookie: true })).toBeNull();
  });

  it("keeps unauthenticated login requests on the login page", () => {
    expect(decideAuthRedirect({ pathname: "/login", hasCookie: false })).toBeNull();
  });

  it("keeps application routes with dots protected", () => {
    expect(decideAuthRedirect({ pathname: "/students/ana.silva", hasCookie: false })).toBe("/login");
  });
});
