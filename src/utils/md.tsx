import {
  BookOpen,
  List,
  Terminal,
  Code2,
  Clock,
  Download,
  Calendar,
  MessageSquare,
  FileCode,
  Shield,
  AlertTriangle,
  Bug,
  Search,
  Target,
  Zap,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Server,
  Database,
  Network,
  Globe,
  Cpu,
  HardDrive,
  Settings,
  Wrench,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Lightbulb,
  TrendingUp,
  BarChart,
  Activity,
  Layers,
  Package,
  GitBranch,
  GitCommit,
  Award,
  Trophy,
  Flag,
  Flame,
  Link,
  Archive,
  Folder,
  FileText,
  Filter,
  Fingerprint,
  Hash,
  Binary,
  Wifi,
  Radio,
  Upload,
  Share2,
  Copy,
  Play,
  Repeat,
  RefreshCw,
  Scan,
  ShieldAlert,
  ShieldCheck,
  Users,
  User,
  Box,
  Monitor,
} from "lucide-react";
import { MentionText } from "@/components/MentionText";
import CodeBlock from "@/components/CodeBlock";
import MediaViewer from "@/components/MediaViewer";
import VideoEmbed from "@/components/VideoEmbed";
import {
  ClassAttributes,
  HTMLAttributes,
  ComponentPropsWithoutRef,
} from "react";
import { ExtraProps } from "react-markdown";

const getHeadingIcon = (title: string) => {
  const t = title.toLowerCase();

  if (t.includes("introduction") || t.includes("overview") || t.includes("about")) return Info;
  if (t.includes("summary") || t.includes("tldr") || t.includes("tl;dr")) return List;
  if (t.includes("conclusion") || t.includes("final") || t.includes("ending")) return Flag;

  if (t.includes("security") || t.includes("vulnerability") || t.includes("vuln")) return Shield;
  if (t.includes("bug") || t.includes("flaw") || t.includes("issue")) return Bug;
  if (t.includes("exploit") || t.includes("exploitation")) return Zap;
  if (t.includes("attack") || t.includes("malicious")) return Target;
  if (t.includes("threat") || t.includes("risk") || t.includes("danger")) return AlertTriangle;
  if (t.includes("breach") || t.includes("compromise") || t.includes("pwn")) return ShieldAlert;
  if (t.includes("secure") || t.includes("harden") || t.includes("protect")) return ShieldCheck;

  if (t.includes("auth") || t.includes("authentication") || t.includes("login")) return Key;
  if (t.includes("authorization") || t.includes("permission") || t.includes("access")) return Lock;
  if (t.includes("session") || t.includes("token") || t.includes("jwt")) return Fingerprint;
  if (t.includes("password") || t.includes("credential") || t.includes("hash")) return Hash;
  if (t.includes("bypass") || t.includes("unauthorized")) return Unlock;
  if (t.includes("2fa") || t.includes("mfa") || t.includes("otp")) return ShieldCheck;

  if (t.includes("injection") || t.includes("sql") || t.includes("sqli")) return Database;
  if (t.includes("xss") || t.includes("cross-site") || t.includes("script")) return Code2;
  if (t.includes("csrf") || t.includes("xsrf") || t.includes("forgery")) return Copy;
  if (t.includes("ssrf") || t.includes("server-side")) return Server;
  if (t.includes("ssti") || t.includes("template")) return FileCode;
  if (t.includes("rce") || t.includes("remote code") || t.includes("command")) return Terminal;
  if (t.includes("lfi") || t.includes("rfi") || t.includes("file inclusion")) return Folder;
  if (t.includes("xxe") || t.includes("xml")) return FileText;

  if (t.includes("discovery") || t.includes("recon") || t.includes("reconnaissance")) return Search;
  if (t.includes("enumeration") || t.includes("enum") || t.includes("scan")) return Scan;
  if (t.includes("footprint") || t.includes("osint") || t.includes("intelligence")) return Eye;
  if (t.includes("mapping") || t.includes("topology") || t.includes("network map")) return Network;
  if (t.includes("subdomain") || t.includes("dns") || t.includes("domain")) return Globe;
  if (t.includes("port") || t.includes("service") || t.includes("nmap")) return Radio;

  if (t.includes("method") || t.includes("methodology") || t.includes("approach")) return Layers;
  if (t.includes("testing") || t.includes("pentest") || t.includes("audit")) return Terminal;
  if (t.includes("technical") || t.includes("analysis") || t.includes("deep dive")) return Code2;
  if (t.includes("payload") || t.includes("request") || t.includes("response")) return Package;
  if (t.includes("poc") || t.includes("proof") || t.includes("demonstration")) return Play;
  if (t.includes("reproduction") || t.includes("replicate") || t.includes("steps")) return Repeat;
  if (t.includes("debug") || t.includes("troubleshoot") || t.includes("diagnose")) return Bug;

  if (t.includes("impact") || t.includes("severity") || t.includes("consequence")) return AlertCircle;
  if (t.includes("critical") || t.includes("high risk") || t.includes("severe")) return Flame;
  if (t.includes("damage") || t.includes("loss") || t.includes("harm")) return XCircle;
  if (t.includes("escalation") || t.includes("privilege") || t.includes("priv")) return TrendingUp;

  if (t.includes("fix") || t.includes("patch") || t.includes("repair")) return Wrench;
  if (t.includes("mitigation") || t.includes("remediation") || t.includes("solution")) return Wrench;
  if (t.includes("recommendation") || t.includes("best practice") || t.includes("advice")) return Lightbulb;
  if (t.includes("prevention") || t.includes("avoid") || t.includes("protect")) return ShieldCheck;
  if (t.includes("update") || t.includes("upgrade") || t.includes("version")) return RefreshCw;

  if (t.includes("timeline") || t.includes("disclosure") || t.includes("responsible")) return Calendar;
  if (t.includes("step") || t.includes("process") || t.includes("workflow")) return GitCommit;
  if (t.includes("before") || t.includes("after") || t.includes("comparison")) return GitBranch;
  if (t.includes("history") || t.includes("background") || t.includes("context")) return Archive;

  if (t.includes("result") || t.includes("finding") || t.includes("outcome")) return BarChart;
  if (t.includes("success") || t.includes("achievement") || t.includes("win")) return CheckCircle;
  if (t.includes("fail") || t.includes("failure") || t.includes("unsuccessful")) return XCircle;
  if (t.includes("lesson") || t.includes("learned") || t.includes("insight")) return BookOpen;
  if (t.includes("takeaway") || t.includes("key point") || t.includes("highlight")) return MessageSquare;

  if (t.includes("tool") || t.includes("software") || t.includes("utility")) return Wrench;
  if (t.includes("framework") || t.includes("library") || t.includes("package")) return Box;
  if (t.includes("burp") || t.includes("proxy") || t.includes("intercept")) return Filter;
  if (t.includes("script") || t.includes("automation") || t.includes("bot")) return Terminal;
  if (t.includes("docker") || t.includes("container") || t.includes("kubernetes")) return Package;
  if (t.includes("api") || t.includes("endpoint") || t.includes("rest")) return Share2;
  if (t.includes("graphql") || t.includes("query") || t.includes("mutation")) return Database;

  if (t.includes("setup") || t.includes("install") || t.includes("configuration")) return Settings;
  if (t.includes("config") || t.includes("setting") || t.includes("option")) return Settings;
  if (t.includes("environment") || t.includes("env") || t.includes("deployment")) return Server;
  if (t.includes("architecture") || t.includes("design") || t.includes("structure")) return Layers;
  if (t.includes("infrastructure") || t.includes("infra") || t.includes("stack")) return HardDrive;

  if (t.includes("database") || t.includes("db") || t.includes("storage")) return Database;
  if (t.includes("data") || t.includes("information") || t.includes("record")) return HardDrive;
  if (t.includes("leak") || t.includes("exposure") || t.includes("dump")) return EyeOff;
  if (t.includes("encryption") || t.includes("crypto") || t.includes("cipher")) return Lock;
  if (t.includes("decryption") || t.includes("decrypt") || t.includes("plaintext")) return Unlock;

  if (t.includes("network") || t.includes("connection") || t.includes("communication")) return Network;
  if (t.includes("protocol") || t.includes("http") || t.includes("tcp")) return Radio;
  if (t.includes("traffic") || t.includes("packet") || t.includes("sniff")) return Activity;
  if (t.includes("firewall") || t.includes("waf") || t.includes("filter")) return Shield;
  if (t.includes("vpn") || t.includes("tunnel") || t.includes("proxy")) return Wifi;
  if (t.includes("dns") || t.includes("domain") || t.includes("resolve")) return Globe;

  if (t.includes("web") || t.includes("website") || t.includes("webapp")) return Globe;
  if (t.includes("frontend") || t.includes("ui") || t.includes("interface")) return Monitor;
  if (t.includes("backend") || t.includes("server-side") || t.includes("api")) return Server;
  if (t.includes("client") || t.includes("browser") || t.includes("user")) return User;
  if (t.includes("cookie") || t.includes("storage") || t.includes("cache")) return Archive;

  if (t.includes("code") || t.includes("source") || t.includes("implementation")) return Code2;
  if (t.includes("function") || t.includes("method") || t.includes("class")) return FileCode;
  if (t.includes("variable") || t.includes("parameter") || t.includes("argument")) return Binary;
  if (t.includes("compile") || t.includes("build") || t.includes("deploy")) return Cpu;
  if (t.includes("dependency") || t.includes("module") || t.includes("import")) return Package;

  if (t.includes("ctf") || t.includes("challenge") || t.includes("wargame")) return Trophy;
  if (t.includes("flag") || t.includes("capture") || t.includes("solve")) return Flag;
  if (t.includes("writeup") || t.includes("write-up") || t.includes("solution")) return FileText;
  if (t.includes("hint") || t.includes("clue") || t.includes("tip")) return Lightbulb;
  if (t.includes("category") || t.includes("type") || t.includes("genre")) return Folder;

  if (t.includes("bounty") || t.includes("reward") || t.includes("payout")) return Award;
  if (t.includes("report") || t.includes("submission") || t.includes("disclosure")) return FileText;
  if (t.includes("hall of fame") || t.includes("hof") || t.includes("recognition")) return Trophy;
  if (t.includes("duplicate") || t.includes("dupe") || t.includes("known")) return Copy;
  if (t.includes("triaged") || t.includes("accepted") || t.includes("valid")) return CheckCircle;
  if (t.includes("rejected") || t.includes("invalid") || t.includes("wontfix")) return XCircle;

  if (t.includes("performance") || t.includes("speed") || t.includes("optimization")) return Zap;
  if (t.includes("benchmark") || t.includes("metric") || t.includes("measure")) return BarChart;
  if (t.includes("latency") || t.includes("delay") || t.includes("timeout")) return Clock;
  if (t.includes("throughput") || t.includes("bandwidth") || t.includes("rate")) return TrendingUp;

  if (t.includes("team") || t.includes("collaboration") || t.includes("group")) return Users;
  if (t.includes("contributor") || t.includes("author") || t.includes("developer")) return User;
  if (t.includes("review") || t.includes("feedback") || t.includes("comment")) return MessageSquare;
  if (t.includes("discussion") || t.includes("conversation") || t.includes("chat")) return MessageSquare;

  if (t.includes("resource") || t.includes("reference") || t.includes("link")) return Link;
  if (t.includes("documentation") || t.includes("docs") || t.includes("manual")) return BookOpen;
  if (t.includes("tutorial") || t.includes("guide") || t.includes("howto")) return BookOpen;
  if (t.includes("example") || t.includes("sample") || t.includes("demo")) return FileCode;
  if (t.includes("download") || t.includes("file") || t.includes("attachment")) return Download;
  if (t.includes("upload") || t.includes("submit") || t.includes("share")) return Upload;

  if (t.includes("note") || t.includes("remark") || t.includes("comment")) return MessageSquare;
  if (t.includes("warning") || t.includes("caution") || t.includes("alert")) return AlertTriangle;
  if (t.includes("info") || t.includes("information") || t.includes("detail")) return Info;
  if (t.includes("todo") || t.includes("task") || t.includes("action")) return CheckCircle;
  if (t.includes("idea") || t.includes("concept") || t.includes("thought")) return Lightbulb;
  if (t.includes("question") || t.includes("faq") || t.includes("help")) return MessageSquare;
  if (t.includes("answer") || t.includes("response") || t.includes("reply")) return CheckCircle;

  return FileCode;
};


interface CodeComponentProps
  extends
    ClassAttributes<HTMLElement>,
    HTMLAttributes<HTMLElement>,
    ExtraProps {
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
        <CodeBlock language="plaintext">{content.replace(/\n$/, "")}</CodeBlock>
      );
    }

    return (
      <code className="inline-code" {...rest}>
        {children}
      </code>
    );
  },

  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
    const hasMention =
      typeof children === "string"
        ? children.includes("@")
        : Array.isArray(children)
          ? children.some((c) =>
              typeof c === "string" ? c.includes("@") : false,
            )
          : false;

    return (
      <div className="mb-6 text-white/70 leading-relaxed" {...props}>
        {hasMention ? <MentionText>{children}</MentionText> : children}
      </div>
    );
  },

  strong: ({ children }: HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),

  em: ({ children }: HTMLAttributes<HTMLElement>) => (
    <em className="italic text-white/80">{children}</em>
  ),

  del: ({ children }: HTMLAttributes<HTMLElement>) => (
    <del className="line-through text-white/50">{children}</del>
  ),

  ul: ({ children }: HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-6 mb-6 text-white/70">{children}</ul>
  ),

  ol: ({ children }: HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-6 mb-6 text-white/70">{children}</ol>
  ),

  li: ({ children }: HTMLAttributes<HTMLLIElement>) => (
    <li className="mb-2">{children}</li>
  ),

  blockquote: ({ children }: HTMLAttributes<HTMLElement>) => (
    <blockquote className="border-l-4 border-white/20 pl-4 italic text-white/60 my-2 py-0!">
      {children}
    </blockquote>
  ),

  a: ({
    href,
    children,
    ...rest
  }: ComponentPropsWithoutRef<"a"> & ExtraProps) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-cyan-400 hover:underline"
      {...rest}
    >
      {children}
    </a>
  ),
  
  img: ({ src, alt }: ComponentPropsWithoutRef<"img"> & ExtraProps) => {
    const safeSrc = typeof src === "string" ? src : "";
    const safeAlt = typeof alt === "string" ? alt : "";
    console.log("Rendering image with src:", safeSrc);

    if (
      safeAlt.startsWith("video:")
    ) {
      return <VideoEmbed src={safeSrc.replace("video:", "")} description={safeAlt.replace("video:{", "").slice(0, -1)} />;
    }

    return <MediaViewer src={safeSrc} alt={safeAlt} />;
  },

  table: ({ children }: HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border border-white/10">{children}</table>
    </div>
  ),

  thead: ({ children }: HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-white/10">{children}</thead>
  ),

  tbody: ({ children }: HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody>{children}</tbody>
  ),

  tr: ({ children }: HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="border-b border-white/10">{children}</tr>
  ),

  th: ({ children }: HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-4 py-2 text-left font-semibold text-white">{children}</th>
  ),

  td: ({ children }: HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-2 text-white/70">{children}</td>
  ),

  hr: () => <hr className="my-10 border-white/10" />,

  h1: ({ children }: HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      id={String(children)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")}
    >
      {children}
    </h1>
  ),

  h2: ({ children }: HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      id={String(children)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")}
    >
      {children}
    </h2>
  ),

  h3: ({ children }: HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      id={String(children)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")}
    >
      {children}
    </h3>
  ),

  h4: ({ children }: HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      id={String(children)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")}
    >
      {children}
    </h4>
  ),

  h5: ({ children }: HTMLAttributes<HTMLHeadingElement>) => (
    <h5
      id={String(children)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")}
    >
      {children}
    </h5>
  ),

  h6: ({ children }: HTMLAttributes<HTMLHeadingElement>) => (
    <h6
      id={String(children)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")}
    >
      {children}
    </h6>
  ),
};

export { getHeadingIcon, components };
