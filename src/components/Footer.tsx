import Link from "next/link";
import { getT } from "@/lib/lang";

// §5.2: public pages and Account. Pricing, Help and Contact arrive with their pages (M5/M6); until then they 404.
const LINKS: [string, string][] = [
  ["/pricing", "Pricing"],
  ["/help", "Help"],
  ["/contact", "Contact"],
  ["/legal/terms", "Terms"],
  ["/legal/privacy", "Privacy"],
  ["/legal/refunds", "Refunds and cancellation"],
  ["/legal/acceptable-use", "Acceptable use"],
  ["/legal/accessibility", "Accessibility"],
  ["/legal/copyright", "Copyright"],
];

export async function Footer() {
  const t = await getT();
  return (
    <footer className="site-footer">
      <ul>
        {LINKS.map(([href, label]) => (
          <li key={href}>
            <Link href={href}>{t(label)}</Link>
          </li>
        ))}
        <li>
          <span className="muted small" style={{ display: "inline-flex", minHeight: 44, alignItems: "center" }}>
            © Radlor Inc.
          </span>
        </li>
      </ul>
    </footer>
  );
}
