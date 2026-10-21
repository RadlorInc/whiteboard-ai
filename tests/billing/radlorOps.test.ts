// Market-rep referral plumbing (lib/radlorOps.ts). Expected values are written out, not built with the module's helpers.
import { afterEach, describe, expect, it, vi } from "vitest";
import { parseRef, refCookieValue, reportRef } from "@/lib/radlorOps";

describe("the ?ref link", () => {
  it("keeps a 10-hex code, marks the market rep's own link, and ignores anything else", () => {
    expect(refCookieValue(new URLSearchParams("ref=a1b2c3d4e5"))).toBe("a1b2c3d4e5");
    expect(refCookieValue(new URLSearchParams("ref=a1b2c3d4e5&me=1"))).toBe("a1b2c3d4e5.me");
    expect(refCookieValue(new URLSearchParams("ref=A1B2C3D4E5"))).toBeNull();
    expect(refCookieValue(new URLSearchParams("ref=a1b2c3d4e5f"))).toBeNull();
    expect(refCookieValue(new URLSearchParams("ref=<script>"))).toBeNull();
    expect(parseRef("a1b2c3d4e5.me")).toEqual({ code: "a1b2c3d4e5", self: true });
    expect(parseRef("a1b2c3d4e5")).toEqual({ code: "a1b2c3d4e5", self: false });
    expect(parseRef("a1b2c3d4e5.you")).toBeNull();
  });
});

describe("reportRef", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it("sends nothing when Radlor Ops is not configured", async () => {
    vi.stubEnv("RADLOR_OPS_URL", ""); vi.stubEnv("RADLOR_OPS_REF_SECRET", "");
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    await reportRef({ kind: "signup", code: "a1b2c3d4e5", app_user: "u1", event_key: "signup:u1" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("posts the event with the secret, and a failure never throws", async () => {
    vi.stubEnv("RADLOR_OPS_URL", "https://ops.example"); vi.stubEnv("RADLOR_OPS_REF_SECRET", "s3cret");
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 })); vi.stubGlobal("fetch", fetch);
    vi.spyOn(console, "error").mockImplementation(() => {});
    await reportRef({ kind: "payment", code: "a1b2c3d4e5", app_user: "u1", amount_cents: 999, paid_at: "2026-10-21T00:00:00.000Z", event_key: "invoice:in_1" });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("https://ops.example/api/ref");
    expect(init.headers.Authorization).toBe("Bearer s3cret");
    expect(JSON.parse(init.body)).toEqual({ kind: "payment", code: "a1b2c3d4e5", app_user: "u1", amount_cents: 999, paid_at: "2026-10-21T00:00:00.000Z", event_key: "invoice:in_1" });
    fetch.mockRejectedValueOnce(new Error("down"));
    await expect(reportRef({ kind: "join", code: "a1b2c3d4e5", app_user: "u1", event_key: "signup:u1" })).resolves.toBeUndefined();
  });
});
