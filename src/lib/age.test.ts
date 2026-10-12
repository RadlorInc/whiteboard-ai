import { describe, expect, it } from "vitest";
import { ageCheck, sign, verify } from "./age";

// Expected answers worked out by hand from §6.3's rule (last day of the month, Pago Pago's date, UTC−11).
describe("ageCheck", () => {
  const oct12 = new Date("2026-10-12T12:00:00Z"); // Pago Pago: 12 Oct
  it("13 only once the last day of the birth month is 13 years back", () => {
    expect(ageCheck(2013, 9, oct12)).toBe("ok"); // youngest 30 Sep 2013 → 13 on 30 Sep 2026
    expect(ageCheck(2013, 10, oct12)).toBe("under_13"); // youngest 31 Oct 2013 → 13 on 31 Oct 2026
    expect(ageCheck(1990, 1, oct12)).toBe("ok");
  });
  it("uses Pago Pago's date, not UTC's", () => {
    expect(ageCheck(2013, 9, new Date("2026-09-30T12:00:00Z"))).toBe("ok"); // PP 30 Sep 01:00
    expect(ageCheck(2013, 9, new Date("2026-09-30T10:00:00Z"))).toBe("under_13"); // PP 29 Sep 23:00
  });
  it("Feb 29 + 13 years is Feb 28, as in Postgres", () => {
    expect(ageCheck(2012, 2, new Date("2025-02-28T12:00:00Z"))).toBe("ok");
    expect(ageCheck(2012, 2, new Date("2025-02-28T10:00:00Z"))).toBe("under_13");
  });
  it("rejects future, >120 years and bad months", () => {
    expect(ageCheck(2026, 11, oct12)).toBe("invalid");
    expect(ageCheck(1900, 1, oct12)).toBe("invalid");
    expect(ageCheck(2000, 13, oct12)).toBe("invalid");
    expect(ageCheck(2000, 0, oct12)).toBe("invalid");
  });
});

describe("signed cookie", () => {
  process.env.AGE_COOKIE_KEY = "k".repeat(32);
  it("round-trips, and refuses a changed body or an expired one", () => {
    const v = sign({ year: 2000 }, 60);
    expect(verify<{ year: number }>(v)?.year).toBe(2000);
    const [body, sig] = v.split(".");
    const forged = Buffer.from(JSON.stringify({ year: 2020, exp: Date.now() + 60_000 })).toString("base64url");
    expect(verify(`${forged}.${sig}`)).toBeNull();
    expect(verify(`${body}.x${sig.slice(1)}`)).toBeNull();
    expect(verify(sign({ year: 2000 }, -1))).toBeNull();
  });
});
