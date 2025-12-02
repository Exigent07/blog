"use client";

import { createContext, useContext, useState } from "react";

type UIContextType = {
  selectionMode: boolean;
  setSelectionMode: (v: boolean) => void;
  readingMode: boolean;
  setReadingMode: (v: boolean) => void;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [readingMode, setReadingMode] = useState(false);

  return (
    <UIContext.Provider value={{ selectionMode, setSelectionMode, readingMode, setReadingMode }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within UIProvider");
  return context;
};
