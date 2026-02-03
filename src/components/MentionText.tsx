import React from "react";
import { parseMention } from "@/utils/parseMention";
import { InlineMention } from "@/components/InlineMention";

interface MentionTextProps {
  children: React.ReactNode;
}

function processNode(node: React.ReactNode, keyPrefix = "m"): React.ReactNode {
  if (typeof node !== "string") {
    return node;
  }

  const mentionRegex = /@([^:@\s]+)(?::([^:@\n]*))?(?::([^:@\n]*))?(?::([^:@\n]*))?(?::\{([^}]*)\})?/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = mentionRegex.exec(node)) !== null) {
    if (match.index > lastIndex) {
      parts.push(node.substring(lastIndex, match.index));
    }

    const parsed = parseMention(match[0]);

    if (parsed) {
      parts.push(
        <InlineMention key={`${keyPrefix}-${key++}`} mention={parsed} />
      );
    } else {
      parts.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < node.length) {
    parts.push(node.substring(lastIndex));
  }

  return parts;
}

export function MentionText({ children }: MentionTextProps) {
  if (Array.isArray(children)) {
    return (
      <>
        {children.map((child, i) => (
          <React.Fragment key={i}>
            {processNode(child, `m-${i}`)}
          </React.Fragment>
        ))}
      </>
    );
  }

  return <>{processNode(children)}</>;
}
