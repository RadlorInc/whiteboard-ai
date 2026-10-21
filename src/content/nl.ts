// The Dutch for every UI string, keyed by the English in the code (lib/i18n.ts). One file per part of the app.
import site from "./nl/site";
import app from "./nl/app";
import player from "./nl/player";

export const NL: Record<string, string> = { ...site, ...app, ...player };
