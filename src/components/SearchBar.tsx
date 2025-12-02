import {
  Search,
  X,
  Hash,
  Calendar,
  Clock,
  Folder,
  Sparkles,
  Sliders,
  ChevronDown,
  Check,
} from "lucide-react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner"; // Import Sonner
import { generateSmartSearch } from "@/app/actions"; // Your AI Server Action

interface SearchBarProps {
  onTagClick?: (tag: string) => void;
  availableTags?: string[];
  availableCategories?: string[];
  availableYears?: string[];
  placeholder?: string;
  externalQuery?: string;
  onQueryChange?: (query: string) => void;
}

const availableReadTimes = ["<5 min", "5-10 min", ">10 min"];

// Helper: Split query respecting quotes
const splitQuery = (str: string): string[] => {
  const match = str.match(/(?:[^\s"]+|"[^"]*")+/g);
  return match ? Array.from(match) : [];
};

// Helper: Determine if value needs quotes (spaces, <, >, -)
const needsQuotes = (val: string) => {
  return (
    val.includes(" ") ||
    val.includes("<") ||
    val.includes(">") ||
    val.includes("-")
  );
};

function FilterSelector({
  icon: Icon,
  label,
  options,
  selected,
  onSelect,
}: {
  icon: LucideIcon;
  label: string;
  options: string[];
  selected: string[];
  onSelect: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 text-sm ${
          selected.length > 0
            ? "border-white/30 bg-white/10 text-white/90"
            : "border-white/10 bg-white/2 hover:bg-white/5 text-white/60 hover:text-white/80"
        }`}
      >
        <Icon size={14} />
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-xs">
            {selected.length}
          </span>
        )}
        <ChevronDown
          size={12}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 min-w-[180px] max-h-60 overflow-y-auto scrollbar-custom rounded-lg border border-white/10 bg-black/95 backdrop-blur-[100px] py-1 z-50"
            style={{
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
            }}
          >
            {options.map((option, index) => {
              const isSelected = selected.includes(option);
              return (
                <button
                  key={index}
                  onClick={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? "bg-white/10 text-white/90"
                      : "text-white/60 hover:bg-white/5 hover:text-white/80"
                  }`}
                >
                  <span>{option}</span>
                  {isSelected && <Check size={14} className="text-white/60" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SearchBar({
  externalQuery,
  onQueryChange,
  availableTags = [],
  availableCategories = [],
  availableYears = [],
  placeholder = "Search posts...",
}: SearchBarProps = {}) {
  const [query, setQuery] = useState(externalQuery || "");
  const [prevExternalQuery, setPrevExternalQuery] = useState(externalQuery);

  const [debouncedAiQuery, setDebouncedAiQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [cursorOffset, setCursorOffset] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const advancedRef = useRef<HTMLDivElement>(null);

  if (externalQuery !== prevExternalQuery) {
    setPrevExternalQuery(externalQuery);
    if (!aiModeEnabled && externalQuery !== undefined) {
      setQuery(externalQuery);
    }
  }

  const updateCursorOffset = useCallback(() => {
    if (!inputRef.current || !measureRef.current) return;
    const cursorPos = inputRef.current.selectionStart || 0;
    const textBeforeCursor = query.substring(0, cursorPos);
    measureRef.current.textContent = textBeforeCursor;
    const width = measureRef.current.offsetWidth;
    setCursorOffset(width);
  }, [query]);

  useEffect(() => {
    updateCursorOffset();
  }, [updateCursorOffset]);

  // Check if user has manually typed an operator
  const hasOperator =
    query.includes("tag:") ||
    query.includes("category:") ||
    query.includes("year:") ||
    query.includes("readtime:");

  // --- AI LOGIC ---
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (aiModeEnabled && query.trim() && !hasOperator) {
        setIsAiLoading(true);
        try {
          const smartQuery = await generateSmartSearch({
            query,
            tags: availableTags,
            categories: availableCategories,
            years: availableYears,
          });

          if (smartQuery) {
            setDebouncedAiQuery(smartQuery);
          } else {
            toast.error("AI Search Failed", {
              description:
                "Some error happened, probably credits finished :(",
            });
            setDebouncedAiQuery("");
          }
        } catch (e) {
          console.error("AI Error", e);
          toast.error("AI Search Failed", {
            description:
              "Some error happened (probably credits finished :sad:)",
          });

          // Turn off AI mode so it doesn't spam toasts on every keystroke
          setAiModeEnabled(false);
          setDebouncedAiQuery("");
        } finally {
          setIsAiLoading(false);
        }
      } else {
        setDebouncedAiQuery("");
      }
    }, 800); // Debounce to prevent spamming API

    return () => clearTimeout(timer);
  }, [
    query,
    hasOperator,
    aiModeEnabled,
    availableTags,
    availableCategories,
    availableYears,
  ]);

  const actualFilterQuery =
    aiModeEnabled && debouncedAiQuery ? debouncedAiQuery : query;

  const suggestions = useMemo(() => {
    if (aiModeEnabled) return [];

    const rawTokens = query.split(" ");
    const lastToken = rawTokens[rawTokens.length - 1];

    if (query.endsWith(" ") && query.length > 0) {
      const ops = [];
      if (!query.includes("category:")) ops.push("category:");
      if (!query.includes("year:")) ops.push("year:");
      if (!query.includes("readtime:")) ops.push("readtime:");
      ops.push("tag:");
      return ops;
    }

    if (!lastToken) return [];

    const newSuggestions: string[] = [];

    if (lastToken.startsWith("tag:")) {
      const val = lastToken.substring(4).replace(/"/g, "");
      const matches = availableTags
        .filter((t) => t.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 5);
      newSuggestions.push(...matches);
    } else if (lastToken.startsWith("category:")) {
      const val = lastToken.substring(9).replace(/"/g, "");
      const matches = availableCategories
        .filter((c) => c.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 5);
      newSuggestions.push(...matches);
    } else if (lastToken.startsWith("year:")) {
      const val = lastToken.substring(5).replace(/"/g, "");
      const matches = availableYears.filter((y) => y.includes(val)).slice(0, 5);
      newSuggestions.push(...matches);
    } else if (lastToken.startsWith("readtime:")) {
      newSuggestions.push(...availableReadTimes);
    } else {
      const ops = ["tag:", "category:", "year:", "readtime:"];
      const matches = ops.filter((op) =>
        op.startsWith(lastToken.toLowerCase())
      );
      newSuggestions.push(...matches);
    }

    return newSuggestions;
  }, [
    query,
    aiModeEnabled,
    availableTags,
    availableCategories,
    availableYears,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        applySuggestion(
          suggestions[selectedSuggestionIndex].replace(" min", "")
        );
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    const isOperator = suggestion.endsWith(":");
    const safeSuggestion =
      !isOperator && needsQuotes(suggestion) ? `"${suggestion}"` : suggestion;

    const rawTokens = query.split(" ");
    const lastToken = rawTokens[rawTokens.length - 1];

    if (lastToken.includes(":") && !isOperator) {
      const [prefix] = lastToken.split(":");
      rawTokens[rawTokens.length - 1] = `${prefix}:${safeSuggestion}`;
    } else {
      rawTokens[rawTokens.length - 1] = safeSuggestion;
    }

    let newQuery = rawTokens.join(" ");
    if (!isOperator) {
      newQuery += " ";
    }

    setQuery(newQuery);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(0);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (onQueryChange && actualFilterQuery !== externalQuery) {
      onQueryChange(actualFilterQuery);
    }
  }, [actualFilterQuery, onQueryChange, externalQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        advancedRef.current &&
        !advancedRef.current.contains(event.target as Node)
      ) {
        setShowAdvanced(false);
      }
    };

    if (showAdvanced) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAdvanced]);

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const getActiveFilters = () => {
    const filters: Array<{ type: string; value: string; full: string }> = [];
    const parts = splitQuery(query);

    parts.forEach((part) => {
      if (part.startsWith("tag:")) {
        filters.push({
          type: "tag",
          value: part.substring(4).replace(/"/g, ""),
          full: part,
        });
      } else if (part.startsWith("category:")) {
        filters.push({
          type: "category",
          value: part.substring(9).replace(/"/g, ""),
          full: part,
        });
      } else if (part.startsWith("year:")) {
        filters.push({
          type: "year",
          value: part.substring(5).replace(/"/g, ""),
          full: part,
        });
      } else if (part.startsWith("readtime:")) {
        filters.push({
          type: "readtime",
          value: part.substring(9).replace(/"/g, ""),
          full: part,
        });
      }
    });

    return filters;
  };

  const activeFilters = getActiveFilters();

  const addFilter = (
    type: "tag" | "category" | "year" | "readtime",
    value: string
  ) => {
    const safeValue = needsQuotes(value) ? `"${value}"` : value;
    const filterString = `${type}:${safeValue}`;

    let newQueryParts = splitQuery(query);

    if (type !== "tag") {
      newQueryParts = newQueryParts.filter(
        (part) => !part.startsWith(`${type}:`)
      );
    }

    if (newQueryParts.includes(filterString)) return;

    newQueryParts.push(filterString);
    setQuery(newQueryParts.join(" "));
    inputRef.current?.focus();
  };

  const removeFilter = (filterToRemove: string) => {
    const newQuery = splitQuery(query)
      .filter((part) => part !== filterToRemove)
      .join(" ");
    setQuery(newQuery);
  };

  const selectedTags = activeFilters
    .filter((f) => f.type === "tag")
    .map((f) => f.value);
  const selectedCategory =
    activeFilters.find((f) => f.type === "category")?.value || "";
  const selectedYear =
    activeFilters.find((f) => f.type === "year")?.value || "";
  const selectedReadTime =
    activeFilters.find((f) => f.type === "readtime")?.value || "";

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div
        className={`relative transition-all duration-500 ${
          isFocused ? "scale-[1.02]" : "scale-100"
        }`}
      >
        <div
          className={`absolute -inset-0.5 rounded-full opacity-0 transition-opacity duration-500 pointer-events-none ${
            isFocused ? "opacity-100" : ""
          }`}
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            filter: "blur(10px)",
          }}
        ></div>

        <div
          className={`relative flex items-center gap-3 px-6 py-4 rounded-full border transition-all duration-500 ${
            isFocused
              ? "border-white/40 bg-white/8 backdrop-blur-[100px]"
              : "border-white/20 bg-white/3 backdrop-blur-[80px]"
          }`}
          style={{
            boxShadow: isFocused
              ? "0 20px 40px -15px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)"
              : "0 10px 20px -10px rgba(0,0,0,0.2)",
          }}
        >
          <Search
            size={20}
            className={`transition-all duration-500 shrink-0 ${
              isFocused ? "text-white/80" : "text-white/40"
            }`}
          />

          <div className="flex-1 relative">
            <span
              ref={measureRef}
              className="absolute invisible whitespace-pre text-sm"
              style={{
                font: "inherit",
                fontSize: "0.875rem",
                letterSpacing: "inherit",
              }}
            ></span>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedSuggestionIndex(0);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                setIsFocused(true);
                setShowSuggestions(true);
              }}
              onBlur={() => {
                setIsFocused(false);
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              onKeyUp={updateCursorOffset}
              onClick={updateCursorOffset}
              placeholder={placeholder || "Search posts..."}
              className="w-full bg-transparent text-white/90 placeholder:text-white/30 focus:outline-none text-sm"
              onKeyDown={handleKeyDown}
            />

            <AnimatePresence>
              {showSuggestions &&
                suggestions.length > 0 &&
                query &&
                isFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    className="absolute ml-2 -top-1/2 translate-y-1/4 mt-1 flex items-center gap-1"
                    style={{ left: `${cursorOffset}px` }}
                  >
                    {suggestions.slice(0, 4).map((suggestion, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applySuggestion(suggestion.replace(" min", ""));
                        }}
                        className={`px-2 py-1 rounded text-xs transition-all duration-200 whitespace-nowrap ${
                          index === selectedSuggestionIndex
                            ? "bg-white/15 text-white/90 border border-white/20"
                            : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 border border-white/10"
                        }`}
                      >
                        {suggestion.replace(/:/, "")}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors duration-300 text-white/40 hover:text-white/80 shrink-0"
              >
                <X size={16} />
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={() => {
              setAiModeEnabled(!aiModeEnabled);
              setShowAdvanced(false);
            }}
            className={`p-1.5 rounded-full transition-all duration-300 shrink-0 ${
              aiModeEnabled
                ? "bg-white/10 text-white/80 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                : "hover:bg-white/10 text-white/40 hover:text-white/80"
            }`}
            title="AI Search Assistant"
          >
            <Sparkles
              size={16}
              className={isAiLoading ? "animate-pulse text-yellow-200" : ""}
            />
          </button>

          <button
            onClick={() => {
              setShowAdvanced(!showAdvanced);
              setAiModeEnabled(false);
            }}
            className={`p-1.5 rounded-full transition-all duration-300 shrink-0 ${
              showAdvanced
                ? "bg-white/10 text-white/80"
                : "hover:bg-white/10 text-white/40 hover:text-white/80"
            }`}
            title="Advanced Filters"
          >
            <Sliders size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-3 flex flex-wrap items-center gap-2"
          >
            {activeFilters.map((filter, index) => (
              <motion.div
                key={filter.full}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-white/80"
              >
                <span className="text-white/50">{filter.type}:</span>
                <span>{filter.value}</span>
                <button
                  onClick={() => removeFilter(filter.full)}
                  className="hover:bg-white/10 rounded-full p-0.5 transition-colors"
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 right-0 mt-3 p-6 rounded-2xl border border-white/20 bg-black/90 backdrop-blur-[100px] z-50"
            style={{
              boxShadow:
                "0 20px 40px -15px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
            ref={advancedRef}
          >
            <div className="mb-4">
              <h4 className="text-white/80 text-sm mb-1 flex items-center gap-2">
                <Sliders size={14} />
                Advanced Filters
              </h4>
              <p className="text-white/40 text-xs">
                Select filters to refine your search
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <FilterSelector
                icon={Hash}
                label="Tags"
                options={availableTags}
                selected={selectedTags}
                onSelect={(value) => addFilter("tag", value)}
              />

              <FilterSelector
                icon={Folder}
                label="Category"
                options={availableCategories}
                selected={selectedCategory ? [selectedCategory] : []}
                onSelect={(value) => addFilter("category", value)}
              />

              <FilterSelector
                icon={Calendar}
                label="Year"
                options={availableYears}
                selected={selectedYear ? [selectedYear] : []}
                onSelect={(value) => addFilter("year", value)}
              />

              <FilterSelector
                icon={Clock}
                label="Read Time"
                options={availableReadTimes}
                selected={selectedReadTime ? [selectedReadTime] : []}
                onSelect={(value) =>
                  addFilter("readtime", value.replace(" min", ""))
                }
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aiModeEnabled && actualFilterQuery && actualFilterQuery !== query && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-3 flex items-center gap-2 text-xs text-white/40"
          >
            <Sparkles size={12} className={isAiLoading ? "animate-spin" : ""} />
            {isAiLoading ? (
              <span>Thinking...</span>
            ) : (
              <span>
                AI filtering:{" "}
                <span className="font-mono text-white/60">
                  {actualFilterQuery}
                </span>
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
