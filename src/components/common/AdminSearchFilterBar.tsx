import { useState, useRef, useEffect, ReactNode } from "react";
import { Search, Filter, ChevronDown, X, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface FilterOption {
  key: string;
  labelBn: string;
  labelEn: string;
  count?: number;
}

export interface AdminSearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholderBn?: string;
  searchPlaceholderEn?: string;
  activeFilter: string;
  onFilterChange: (filterKey: string) => void;
  filterOptions: FilterOption[];
  filterButtonLabelBn?: string;
  filterButtonLabelEn?: string;
  className?: string;
  actionsRight?: ReactNode;
}

export const AdminSearchFilterBar = ({
  searchQuery,
  onSearchChange,
  searchPlaceholderBn = "অনুসন্ধান করুন...",
  searchPlaceholderEn = "Search...",
  activeFilter,
  onFilterChange,
  filterOptions,
  filterButtonLabelBn = "ফিল্টার",
  filterButtonLabelEn = "Filter",
  className = "",
  actionsRight,
}: AdminSearchFilterBarProps) => {
  const { lang } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const currentOption = filterOptions.find((opt) => opt.key === activeFilter) || filterOptions[0];
  const activeLabel = currentOption
    ? (lang === "en" ? currentOption.labelEn : currentOption.labelBn)
    : (lang === "en" ? filterButtonLabelEn : filterButtonLabelBn);

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${className}`}>
      {/* Left: Mini Search & Single Filter Button Group */}
      <div className="flex flex-wrap items-center gap-2 flex-1 max-w-2xl">
        {/* Mini Search Input */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={lang === "en" ? searchPlaceholderEn : searchPlaceholderBn}
            className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-background border border-border text-xs font-bengali text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title={lang === "en" ? "Clear search" : "সার্চ মুছুন"}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Single Button Filter with Dropdown */}
        {filterOptions.length > 0 && (
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bengali font-semibold transition-all shadow-2xs ${
                activeFilter !== "all" && activeFilter !== ""
                  ? "bg-primary/10 border-primary/40 text-primary hover:bg-primary/20"
                  : "bg-secondary/70 hover:bg-secondary border-border text-foreground"
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-[180px]">{activeLabel}</span>
              {currentOption?.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary/20 text-primary">
                  {currentOption.count}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 z-40 min-w-[210px] max-w-[280px] p-1.5 rounded-2xl bg-card border border-border shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] font-bengali font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50 mb-1">
                  {lang === "en" ? "Filter by status / type" : "ফিল্টার নির্ধারণ করুন"}
                </div>
                {filterOptions.map((opt) => {
                  const isSelected = activeFilter === opt.key;
                  const label = lang === "en" ? opt.labelEn : opt.labelBn;

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        onFilterChange(opt.key);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bengali transition-colors text-left ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : "text-foreground hover:bg-secondary/70"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="truncate">{label}</span>
                      </div>
                      {opt.count !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono shrink-0 ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {opt.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions Slot */}
      {actionsRight && (
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end">
          {actionsRight}
        </div>
      )}
    </div>
  );
};

export default AdminSearchFilterBar;
