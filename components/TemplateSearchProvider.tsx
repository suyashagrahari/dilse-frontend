"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type TSearchCtx = {
  search: string;
  setSearch: (v: string) => void;
  showFilter: boolean;
  setShowFilter: (v: boolean) => void;
  selectedType: string;
  setSelectedType: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  filteredCount: number;
  setFilteredCount: (n: number) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
};

const TemplateSearchCtx = createContext<TSearchCtx>({
  search: "", setSearch: () => {},
  showFilter: false, setShowFilter: () => {},
  selectedType: "all", setSelectedType: () => {},
  selectedCategory: "all", setSelectedCategory: () => {},
  filteredCount: 0, setFilteredCount: () => {},
  hasActiveFilters: false, clearFilters: () => {},
});

export function TemplateSearchProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredCount, setFilteredCount] = useState(0);

  const hasActiveFilters = selectedType !== "all" || selectedCategory !== "all" || !!search;
  const clearFilters = () => { setSelectedType("all"); setSelectedCategory("all"); setSearch(""); };

  return (
    <TemplateSearchCtx.Provider value={{
      search, setSearch, showFilter, setShowFilter,
      selectedType, setSelectedType, selectedCategory, setSelectedCategory,
      filteredCount, setFilteredCount, hasActiveFilters, clearFilters,
    }}>
      {children}
    </TemplateSearchCtx.Provider>
  );
}

export const useTemplateSearch = () => useContext(TemplateSearchCtx);
