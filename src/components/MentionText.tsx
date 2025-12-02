import React from "react";
import { parseMention } from "@/utils/parseMention";
import { InlineMention } from "@/components/InlineMention";

interface MentionTextProps {
  children: string;
}

export function MentionText({ children }: MentionTextProps) {
  const mentionRegex = /@([^:@\s]+)(?::([^:@\n]*))?(?::([^:@\n]*))?(?::([^:@\n]*))?(?::([^:@\n]*))?/g;
  
  const parts: React.ReactNode[] = []; 
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = mentionRegex.exec(children)) !== null) {
    if (match.index > lastIndex) {
      parts.push(children.substring(lastIndex, match.index));
    }

    const parsed = parseMention(match[0]);
    if (parsed) {
      parts.push(<InlineMention key={`mention-${key++}`} mention={parsed} />);
    } else {
      parts.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < children.length) {
    parts.push(children.substring(lastIndex));
  }

  return <>{parts}</>;
}
