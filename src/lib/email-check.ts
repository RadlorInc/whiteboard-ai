// One person, one account (founder, 22 Oct 2026): every account gets free videos, so sign-up refuses addresses that
// mint endless accounts: a "+tag" alias (ali+1@gmail.com) and throwaway inbox services. Checked in the browser before
// a code is sent (SignInMethods) and again on the server before the account is made (completeSignup).
// ponytail: a hand-kept list of the common throwaway domains, not every one; swap in a maintained list if farms get past it.
// ponytail: Gmail ignores dots (a.li@ = ali@), which only a stored, normalised address could catch.
const THROWAWAY = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "sharklasers.com", "grr.la",
  "10minutemail.com", "10minutemail.net", "temp-mail.org", "tempmail.com", "tempmail.net", "tempmailo.com",
  "temp-mail.io", "tempail.com", "throwawaymail.com", "yopmail.com", "yopmail.net", "yopmail.fr", "getnada.com",
  "nada.email", "maildrop.cc", "dispostable.com", "trashmail.com", "trashmail.de", "fakeinbox.com", "mintemail.com",
  "mohmal.com", "emailondeck.com", "mailnesia.com", "spamgourmet.com", "mytemp.email", "tempr.email",
  "discard.email", "moakt.com", "mailcatch.com", "inboxkitten.com", "mail.tm", "mail.gw", "burnermail.io",
  "1secmail.com", "1secmail.net", "1secmail.org", "emailfake.com", "fakemail.net", "luxusmail.org", "tmail.ws",
  "tmpmail.org", "tmpmail.net", "minuteinbox.com", "spambox.us", "wegwerfmail.de", "einrot.com", "cuvox.de",
  "armyspy.com", "dayrep.com", "fleckens.hu", "gustr.com", "jourrapide.com", "rhyta.com", "superrito.com",
  "teleworm.us", "harakirimail.com", "mailpoof.com", "easytrashmail.com", "anonaddy.me", "33mail.com",
]);

/** What the person sees when emailProblem() refuses an address (founder, 22 Oct 2026: "ask for a valid email address"). */
export const EMAIL_PROBLEM = "Please enter a valid email address. Addresses with a + tag and temporary inboxes can't make an account.";

/** Why an address can't make an account, or null when it can. */
export function emailProblem(email: string): "alias" | "throwaway" | null {
  const [local = "", domain = ""] = email.trim().toLowerCase().split("@");
  if (local.includes("+")) return "alias";
  if (THROWAWAY.has(domain)) return "throwaway";
  return null;
}
