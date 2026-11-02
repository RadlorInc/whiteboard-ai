import { createClient } from "@/lib/supabase/server";

// "Asked by …" (founder, 2 Nov 2026): each shared video's maker's public name (profiles.public_name, set on /account),
// for live share links only (public_names).
export async function namesFor(slugs: string[]): Promise<Map<string, string>> {
  if (!slugs.length) return new Map();
  const { data } = await (await createClient()).rpc("public_names", { p_slugs: slugs.slice(0, 100) });
  return new Map(((data ?? []) as { slug: string; name: string }[]).map((r) => [r.slug, r.name]));
}

export async function withNames<T extends { slug: string; by?: string }>(items: T[]): Promise<T[]> {
  const names = await namesFor(items.map((i) => i.slug));
  return items.map((i) => ({ ...i, by: names.get(i.slug) }));
}
