import {
  BookOpen,
  ArrowLeft,
  List,
  Terminal,
  Code2,
  Clock,
  Download,
  Calendar,
  MessageSquare,
  FileCode,
} from "lucide-react";
import { MentionText } from "@/components/MentionText";
import CodeBlock from "@/components/CodeBlock";
import { ClassAttributes, HTMLAttributes } from "react";
import { ExtraProps } from "react-markdown";

const getHeadingIcon = (title: string) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("security") || titleLower.includes("vulnerability"))
    return BookOpen;
  if (titleLower.includes("bug") || titleLower.includes("exploit"))
    return ArrowLeft;
  if (titleLower.includes("discovery") || titleLower.includes("reconnaissance"))
    return List;
  if (titleLower.includes("methodology") || titleLower.includes("testing"))
    return Terminal;
  if (titleLower.includes("technical") || titleLower.includes("analysis"))
    return Code2;
  if (titleLower.includes("proof") || titleLower.includes("poc"))
    return Terminal;
  if (titleLower.includes("impact") || titleLower.includes("assessment"))
    return Clock;
  if (
    titleLower.includes("remediation") ||
    titleLower.includes("mitigation") ||
    titleLower.includes("fix")
  )
    return Download;
  if (titleLower.includes("timeline") || titleLower.includes("disclosure"))
    return Calendar;
  if (titleLower.includes("key") || titleLower.includes("takeaway"))
    return MessageSquare;
  if (titleLower.includes("conclusion") || titleLower.includes("summary"))
    return ArrowLeft;
  if (titleLower.includes("attack") || titleLower.includes("scenario"))
    return ArrowLeft;
  if (titleLower.includes("executive")) return MessageSquare;
  if (titleLower.includes("detail")) return FileCode;
  if (titleLower.includes("critical") || titleLower.includes("warning"))
    return ArrowLeft;
  return FileCode;
};

interface CodeComponentProps extends ClassAttributes<HTMLElement>, HTMLAttributes<HTMLElement>, ExtraProps {
  inline?: boolean;
}

const components = {
  pre: ({ children }: HTMLAttributes<HTMLPreElement>) => <>{children}</>,
  
  code(props: CodeComponentProps) {
    const { children, className, inline, ...rest } = props;
    const match = /language-(\w+)/.exec(className || "");

    if (inline) {
      return (
        <code className="inline-code" {...rest}>
          {children}
        </code>
      );
    }

    if (match) {
      return (
        <CodeBlock language={match[1]}>
          {String(children).replace(/\n$/, "")}
        </CodeBlock>
      );
    }

    const content = String(children);
    if (content.includes("\n")) {
       return (
        <CodeBlock language="plaintext">
          {content.replace(/\n$/, "")}
        </CodeBlock>
      );
    }

    return (
      <code className="inline-code" {...rest}>
        {children}
      </code>
    );
  },

  p: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLParagraphElement>) => {
    const text =
      typeof children === "string"
        ? children
        : Array.isArray(children)
        ? children
            .map((c: React.ReactNode) => (typeof c === "string" ? c : ""))
            .join("")
        : "";
    
    if (text.includes("@")) {
      return (
        <div className="mb-6 text-white/70 leading-relaxed" {...props}>
          <MentionText>{text}</MentionText>
        </div>
      );
    }

    return (
      <div className="mb-6 text-white/70 leading-relaxed" {...props}>
        {children}
      </div>
    );
  },

  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      id={String(children)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      id={String(children)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      id={String(children)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")}
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      id={String(children)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")}
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h5
      id={String(children)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h6
      id={String(children)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")}
      {...props}
    >
      {children}
    </h6>
  ),
};

export { getHeadingIcon, components };
