// Beta drafts of the legal pages (PLAN.md §11.8, C9). An attorney reviews them before public launch; until then every
// page shows the "Beta draft" banner. Facts here must match the product: change both together.
import { PRODUCT_NAME } from "@/product";

export type Doc = { title: string; sections: [string, string[]][] };
const P = PRODUCT_NAME;

export const LEGAL: Record<string, Doc> = {
  terms: { title: "Terms of Service", sections: [
    ["Who we are", [`${P} is a service of Radlor Inc. ("we"). By creating an account you agree to these terms.`]],
    ["Who can use it", [
      "You must be 13 or older. If you are under 18, a parent or guardian must agree to these terms and must be the one who pays.",
      "One person per account. Keep your sign-in email safe; you are responsible for what happens in your account."]],
    ["What you get", [
      `${P} turns your question into a short animated, narrated explanation, written by AI. AI can be wrong: check anything important, especially health, legal or money questions. It is not medical, legal or financial advice.`,
      "Every new question makes a new video and uses credits. Watching a video you already made is free.",
      "The narration voice is made on your own device. The first time, your browser downloads a voice model (about 166 MB, mostly from Hugging Face) and keeps it; devices that cannot run it use the browser's own voice."]],
    ["Credits and payments", [
      "1 credit = 10 seconds of video, rounded up. Starting a video holds up to 6 credits; you are charged only for the length made, and failed or refused videos are free.",
      "Monthly plans renew automatically until you cancel. Plan credits end 3 days after each billing period. Credits from packs do not expire.",
      "Payments are handled by Stripe. Prices are in US dollars, plus tax where applicable. See Refunds for when money comes back."]],
    ["Acceptable use", ["Follow the Acceptable use rules. We may decline a question, and may suspend accounts that break them."]],
    ["Sharing and Explore", [
      "If you share a video, anyone with the link can watch it. They do not see who made it. You can stop sharing at any time.",
      "Explore is a public page where anyone, signed in or not, can watch videos people chose to show there. When you ask a question, \u201cShow in Explore\u201d is ticked unless you untick it, for every account including those of users aged 13\u201317. Explore shows the question and the video, never your name or email. You can remove a video from Explore at any time from its page.",
      "Questions with links, email addresses, handles or phone numbers are never shown on Explore. Anyone can report a public video, and we may remove any video from Explore or stop it being shared."]],
    ["Ending your account", ["You can delete your account at any time from Account. We may close accounts that break these terms."]],
    ["Changes", ["We will email you before new terms take effect, and ask you to accept them."]],
    ["Contact", ["Questions: use the Contact page."]],
  ] },
  privacy: { title: "Privacy Policy", sections: [
    ["What we collect", [
      "Your email address, your age band (13–17 or 18+; never your birth date), your questions and the videos made from them, your credit and payment history (card details stay with Stripe), and basic technical logs.",
      "Your choices of narration voice and of \u201cShow in Explore\u201d are kept only in your browser.",
      "We do not use advertising trackers or sell or share your personal information for advertising."]],
    ["Why", ["To make your videos, run your account and payments, keep the service safe and working, and meet legal duties."]],
    ["Who helps us (service providers)", [
      "Supabase (database and sign-in), Vercel (hosting), Anthropic (writes the video script from your question), Stripe (payments), and an email provider for sign-in codes. Each may only use your data to provide its service to us.",
      "Your browser downloads the narration voice model from Hugging Face, which lets Hugging Face see your IP address. No question or video is sent to it: the voice is made on your device."]],
    ["Your questions", ["Your question is sent to Anthropic to write the video. Do not put private details (like full names, addresses or phone numbers) in a question, above all one you show on Explore. Questions never appear in web addresses or analytics."]],
    ["Explore and shared videos", [
      "A video you show on Explore or share by link is public: anyone can see its question and watch it. We never show who made it.",
      "Remove it from Explore or stop sharing at any time from the video's page; deleting the video or your account also removes it.",
      "When someone reports a public video we keep the reason, their note and a scrambled form of their IP address (to limit reports), never the address itself."]],
    ["Keeping and deleting", [
      "You can delete any video, download all your data, or delete your account from Account.",
      "When you delete your account we delete your questions, videos and shares. A minimal payment record is kept as tax law requires."]],
    ["Teens", ["The service is for ages 13 and up. If we learn that a user is under 13, we delete the account and refund unused paid credits."]],
    ["Your rights", ["Depending on where you live (for example California), you can ask to see, correct or delete your data. Use Account or the Contact page."]],
  ] },
  refunds: { title: "Refunds and cancellation", sections: [
    ["Never charged", ["Failed, refused or timed-out videos use no credits."]],
    ["A wrong or broken video", ["Report it within 7 days and we give the credits back after a review."]],
    ["Packs", ["A credit pack you have not used at all can be refunded within 14 days."]],
    ["Plans", [
      "Your first plan payment can be refunded within 7 days if you used 10% of its credits or fewer.",
      "Cancel any time from Account → Manage plan. You keep your plan credits until the end of the period. Otherwise there are no partial refunds, unless the law requires them."]],
    ["Deleting your account", ["Unused credits are not refunded when you delete your account."]],
  ] },
  "acceptable-use": { title: "Acceptable use", sections: [
    ["Don't ask for", [
      "Sexual content, content that sexualises minors, help to harm yourself or others, weapons or dangerous instructions, hate or harassment, or anything illegal.",
      "If you are thinking about harming yourself, call or text 988 (US) right now."]],
    ["Don't", ["Share private details about other people, try to break or overload the service, resell access, or use automated tools to make videos."]],
    ["Public videos", ["Videos on Explore or shared by link must follow these rules too. Use \u201cReport this video\u201d under any public video to tell us about one that does not."]],
  ] },
  accessibility: { title: "Accessibility", sections: [
    ["Our aim", ["We aim for WCAG 2.2 AA. Every video has captions and a text transcript, works with reduced motion, and the pages work with a keyboard and screen readers."]],
    ["Problems", ["If something does not work for you, tell us on the Contact page."]],
  ] },
  copyright: { title: "Copyright", sections: [
    ["Your videos", ["You may use the videos you make for personal and educational purposes."]],
    ["Reporting", ["If you believe a shared or Explore video infringes your copyright, use the Contact page with the link and your details."]],
    ["Narration voice", [
      "The narration is made with Pocket TTS by Kyutai, licensed under Creative Commons Attribution 4.0 (CC BY 4.0), using the in-browser version by KevinAHM (Apache License 2.0).",
      "Its voices come from recordings by Alba MacKenna (CC BY 4.0), the VCTK corpus of the Centre for Speech Technology Research, University of Edinburgh (CC BY 4.0), and Kyutai's Unmute voice donation project (CC0)."]],
    ["Illustrations", [
      "Some anatomy drawings (such as the heart cut open) are adapted from Servier Medical Art by Servier (smart.servier.com), licensed under Creative Commons Attribution 4.0 (CC BY 4.0). We converted them to our whiteboard format, recoloured nothing, and added our own labels and animation.",
      "Plant, animal, microbe and virus drawings come from Bioicons (bioicons.com), converted to our whiteboard format. Licensed under Creative Commons Attribution 4.0 (CC BY 4.0): Alejandro Matía, Alexis Maizel, Andi Wilson, Ciera Martinez, Connor Tansley, DBCLS (TogoTV), Daniel Carvalho, Durvesh Burhade & Niliksha Patel, Erin Sparks, Frédéric Bouché, Guillaume Lobet, Lucien Hinderling and Roman Schwob, Matthew Dzievit and Plant Illustrations. Under CC BY 3.0: Servier. Public domain (CC0): Ben Murrell, Ewa Oz, Geomicrobio, Gina Vong, James Lloyd, Mariana Ruiz Villareal, Pauline Franz, Samuel Nestor Meckoni and Simon Dürr. The full list, drawing by drawing, is kept with our source code.",
      "Animal and plant silhouettes come from PhyloPic (phylopic.org). Licensed under Creative Commons Attribution 4.0 (CC BY 4.0): Caleb M. Gordon, Edwin Price, Ivan Iofrida, Luca Leicht, Margot Michaud, Melissa Broussard, Natalie Kestel, painting Guo and the Tree of Life App. Under CC BY 3.0: Deepak Veerappan, Kai Caspar and Manabu Sakamoto. The others are public domain (CC0 or public domain mark), with thanks to their makers.",
      "Colour drawings of animals, plants, fruit and everyday objects come from Fluent Emoji by Microsoft (github.com/microsoft/fluentui-emoji), used under the MIT License: Copyright (c) Microsoft Corporation. The full licence text is at /licenses/fluent-emoji-MIT.txt."]],
  ] },
};
