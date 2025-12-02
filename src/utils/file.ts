const getFileExtension = (language: string): string => {
  const extensionMap: { [key: string]: string } = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    java: "java",
    cpp: "cpp",
    c: "c",
    csharp: "cs",
    ruby: "rb",
    go: "go",
    rust: "rs",
    php: "php",
    html: "html",
    css: "css",
    json: "json",
    xml: "xml",
    yaml: "yml",
    markdown: "md",
    bash: "sh",
    shell: "sh",
    sql: "sql",
    swift: "swift",
    kotlin: "kt",
  };
  return extensionMap[language.toLowerCase()] || "txt";
};

const handleDownload = (language: string, children: string) => {
  const extension = getFileExtension(language);
  const blob = new Blob([children], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `code.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


export { getFileExtension, handleDownload };