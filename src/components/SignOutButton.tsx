"use client";
import { signOut } from "@/app/actions";

// Sign-out clears the drafts and keeps UI preferences (§5.11).
export function SignOutButton({ className = "", scope = "local", label = "Sign out" }: {
  className?: string;
  scope?: "local" | "global";
  label?: string;
}) {
  return (
    <form
      action={signOut}
      onSubmit={() => {
        try {
          localStorage.removeItem("wb.askDraft");
          localStorage.removeItem("wb.pendingVideo");
          sessionStorage.removeItem("wb.otp");
        } catch {}
      }}
    >
      <input type="hidden" name="scope" value={scope} />
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
