export interface ParsedMention {
  displayName: string;
  twitter?: string;
  github?: string;
  bluesky?: string;
  description?: string;
  rawText: string;
}

export function parseMention(mentionText: string): ParsedMention | null {
  // @name:twitter:github:bluesky:{description}
  const regex = /@([^:@\s]+)(?::([^:@\n]*))?(?::([^:@\n]*))?(?::([^:@\n]*))?(?::\{([^}]*)\})?/;

  const match = mentionText.match(regex);
  if (!match) return null;

  const [rawText, displayName, twitter = "", github = "", bluesky = "", description = ""] = match;

  return {
    displayName,
    twitter: twitter.trim() || undefined,
    github: github.trim() || undefined,
    bluesky: bluesky.trim() || undefined,
    description: description.trim() || undefined,
    rawText,
  };
}

export function extractMentions(text: string): ParsedMention[] {
  const regex = /@([^:@\s]+)(?::([^:@\n]*))?(?::([^:@\n]*))?(?::([^:@\n]*))?(?::\{([^}]*)\})?/g;

  const mentions: ParsedMention[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const parsed = parseMention(match[0]);
    if (parsed) {
      mentions.push(parsed);
    }
  }

  return mentions;
}

export function getProfilePicture(mention: ParsedMention): string {
  if (mention.twitter) {
    return `https://unavatar.io/x/${mention.twitter}`;
  }

  if (mention.github) {
    return `https://github.com/${mention.github}.png`;
  }

  if (mention.bluesky) {
    return `https://unavatar.io/${mention.bluesky}`;
  }

  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${mention.displayName}`;
}

export function getSocialLinks(mention: ParsedMention) {
  return {
    twitter: mention.twitter ? `https://twitter.com/${mention.twitter}` : undefined,
    github: mention.github ? `https://github.com/${mention.github}` : undefined,
    bluesky: mention.bluesky ? `https://bsky.app/profile/${mention.bluesky}` : undefined,
  };
}
