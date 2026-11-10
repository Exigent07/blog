/**
 * What the About page states about the author, exactly as the author publishes it.
 * Nothing here may go beyond the author's own profiles and articles.
 */

/** The publication's research areas, in the author's order ("client‑side" with a non-breaking hyphen). */
export const RESEARCH_AREAS = [
  "Browser and client‑side security",
  "Web application security",
  "Security boundaries",
  "Prompt injection",
] as const;

/** Discord has no public profile URL, so the handle is offered for copying. */
export const DISCORD_HANDLE = "exigent07";

export type DisclosureProgram = {
  program: string;
  /** One entry per accepted report: its reward in USD, or null when it was closed as informative. */
  rewards: readonly (number | null)[];
};

export const DISCLOSURE_RECORD: readonly DisclosureProgram[] = [
  { program: "Google Gemini", rewards: [13337, 13337, 15000] },
  { program: "ChatGPT", rewards: [250, 200] },
  { program: "GenAI", rewards: [500, 500, 500] },
  { program: "Grok", rewards: [null, null] },
];

export const programRewards = (program: DisclosureProgram) =>
  program.rewards.reduce<number>((sum, reward) => sum + (reward ?? 0), 0);

/** Derived from the rows, so the totals can never disagree with them. */
export const RECORD_TOTALS = {
  programs: DISCLOSURE_RECORD.length,
  reports: DISCLOSURE_RECORD.reduce((sum, program) => sum + program.rewards.length, 0),
  rewards: DISCLOSURE_RECORD.reduce((sum, program) => sum + programRewards(program), 0),
};
