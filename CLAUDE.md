@AGENTS.md

# Write every answer in ASD-STE100 (Simplified Technical English)

Use ASD-STE100 rules for all replies, recaps, commit messages, PR text and docs. This applies to every project.

- Use simple words. Give one word one meaning. Use the same word for the same thing every time.
- Keep sentences short: 20 words maximum for instructions, 25 words maximum for descriptions.
- Write one instruction in one sentence. Put the instructions in a numbered list when the order is important.
- Use the imperative for instructions ("Run the tests."). Use the active voice ("The script deletes the file.").
- Use only the simple tenses: present, past and future. Do not use "-ing" forms as verbs or nouns where you can avoid them.
- Do not leave out articles ("the", "a") or verbs to make a sentence shorter.
- Keep one topic in one paragraph. Use 6 sentences maximum in a paragraph.
- Put a warning or caution before the instruction it is about. Start it with the danger, then the action.
- Use technical names (files, commands, functions) exactly as they are. Do not change code, commands or quoted text to STE.
- Reply in the language of the user. English message: English STE. Hindi or Hinglish message: Simplified Hinglish (rules below).

## Simplified Hinglish (STE rules for Hinglish)

Use these rules when the user writes in Hindi or Hinglish. They are the STE rules, adapted to Hinglish.

**Script and words**
- Write in Roman script only. Do not use Devanagari.
- Keep technical words in English: file, branch, commit, test, error, deploy, API, database.
- Use common spoken Hindi for the rest. Do not use difficult Sanskrit or Urdu words (not "sanshodhan", "tasdeek"; use "change", "check").
- Use one word for one meaning, every time. Fixed terms: "file", "change", "error", "fix", "test", "step", "check".

**Sentences**
- One sentence has one idea. Instructions: 15 words maximum. Descriptions: 20 words maximum.
- Use Hindi grammar order: subject, object, verb. Example: "Script file ko delete karti hai."
- Use active voice. Write "Maine file change ki", not "File change ki gayi".
- Use simple tenses only: "karta hai", "kiya", "karega". Do not use "kar raha hoga", "kiya ja chuka hai".

**Instructions**
- Use the "karo" form for instructions: "Tests run karo." "Branch push karo."
- Use one English verb + "karo / kiya / karega". Fixed set: run, check, add, delete, change, fix, push, open, save, install.
- Put one instruction in one sentence. Use a numbered list when the order is important.
- Put a warning before the instruction: "**Dhyan do:** Ye command data delete karti hai. Pehle backup lo."

**Paragraphs and format**
- One paragraph has one topic and 6 sentences maximum.
- Do not write filler words: "basically", "matlab", "actually", "toh dekho".
- Keep code, commands, file names and quoted text exactly as they are.
