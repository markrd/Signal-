import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchEntities } from '../lib/entities';
import type { Entity } from '../lib/entities';

export interface FilterState {
    industries: string[];
    techStacks: string[];
    priceRange: { min: number; max: number };
    seniorities: string[];
}

const SENIORITY_OPTIONS = [
    { value: 'CXO', label: 'CXO', description: 'CEO, CTO, CIO, CFO' },
    { value: 'VP', label: 'VP', description: 'Vice President, Head of' },
    { value: 'Director', label: 'Director', description: 'Director level' },
    { value: 'Manager', label: 'Manager', description: 'Manager level' },
];

const DEFAULT_FILTERS: FilterState = {
    industries: [],
    techStacks: [],
    priceRange: { min: 0, max: 2000 },
    seniorities: [],
};

interface FilterBarProps {
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    resultCount: number;
}

export function FilterBar({ filters, onFiltersChange, resultCount }: FilterBarProps) {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        fetchEntities().then(setEntities);
    }, []);

    const industries = entities.filter(e => e.type === 'INDUSTRY');
    const techStacks = entities.filter(e => e.type === 'TECH_STACK');

    const hasActiveFilters =
        filters.industries.length > 0 ||
        filters.techStacks.length > 0 ||
        filters.seniorities.length > 0 ||
        filters.priceRange.min > 0 ||
        filters.priceRange.max < 2000;

    const activeFilterCount =
        filters.industries.length +
        filters.techStacks.length +
        filters.seniorities.length +
        (filters.priceRange.min > 0 || filters.priceRange.max < 2000 ? 1 : 0);

    const toggleArrayFilter = (key: 'industries' | 'techStacks' | 'seniorities', value: string) => {
        const current = filters[key];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        onFiltersChange({ ...filters, [key]: updated });
    };

    const clearFilters = () => {
        onFiltersChange(DEFAULT_FILTERS);
        setActiveDropdown(null);
    };

    return (
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 mb-6">
            {/* Main Filter Row */}
            <div className="flex items-center gap-3 flex-wrap">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
                        isExpanded
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    )}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Quick Filter Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Industry Dropdown */}
                    <FilterDropdown
                        label="Industry"
                        isOpen={activeDropdown === 'industry'}
                        onToggle={() => setActiveDropdown(activeDropdown === 'industry' ? null : 'industry')}
                        selectedCount={filters.industries.length}
                    >
                        <div className="p-2 max-h-64 overflow-y-auto">
                            {industries.map(industry => (
                                <label
                                    key={industry.id}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-50 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.industries.includes(industry.name)}
                                        onChange={() => toggleArrayFilter('industries', industry.name)}
                                        className="w-4 h-4 rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-zinc-700">{industry.name}</span>
                                </label>
                            ))}
                        </div>
                    </FilterDropdown>

                    {/* Tech Stack Dropdown */}
                    <FilterDropdown
                        label="Tech Stack"
                        isOpen={activeDropdown === 'tech'}
                        onToggle={() => setActiveDropdown(activeDropdown === 'tech' ? null : 'tech')}
                        selectedCount={filters.techStacks.length}
                    >
                        <div className="p-2 max-h-64 overflow-y-auto">
                            {techStacks.map(tech => (
                                <label
                                    key={tech.id}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-50 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.techStacks.includes(tech.name)}
                                        onChange={() => toggleArrayFilter('techStacks', tech.name)}
                                        className="w-4 h-4 rounded border-zinc-300 text-purple-500 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-zinc-700">{tech.name}</span>
                                </label>
                            ))}
                        </div>
                    </FilterDropdown>

                    {/* Seniority Dropdown */}
                    <FilterDropdown
                        label="Seniority"
                        isOpen={activeDropdown === 'seniority'}
                        onToggle={() => setActiveDropdown(activeDropdown === 'seniority' ? null : 'seniority')}
                        selectedCount={filters.seniorities.length}
                    >
                        <div className="p-2">
                            {SENIORITY_OPTIONS.map(option => (
                                <label
                                    key={option.value}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-50 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.seniorities.includes(option.value)}
                                        onChange={() => toggleArrayFilter('seniorities', option.value)}
                                        className="w-4 h-4 rounded border-zinc-300 text-blue-500 focus:ring-blue-500"
                                    />
                                    <div>
                                        <div className="text-sm font-medium text-zinc-700">{option.label}</div>
                                        <div className="text-xs text-zinc-400">{option.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </FilterDropdown>
                </div>

                {/* Results Count & Clear */}
                <div className="ml-auto flex items-center gap-3">
                    <span className="text-sm text-zinc-500">
                        {resultCount} {resultCount === 1 ? 'result' : 'results'}
                    </span>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700"
                        >
                            <X className="w-3 h-3" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded Price Range Filter */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 mt-4 border-t border-zinc-100">
                            <div className="flex items-center gap-6">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-zinc-700 mb-2 block">
                                        Price Range
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="range"
                                                min="0"
                                                max="2000"
                                                step="50"
                                                value={filters.priceRange.min}
                                                onChange={(e) => onFiltersChange({
                                                    ...filters,
                                                    priceRange: { ...filters.priceRange, min: Number(e.target.value) }
                                                })}
                                                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-zinc-900 w-20 text-center">
                                            ${filters.priceRange.min}
                                        </span>
                                        <span className="text-zinc-400">—</span>
                                        <span className="text-sm font-medium text-zinc-900 w-20 text-center">
                                            ${filters.priceRange.max}
                                        </span>
                                        <div className="flex-1">
                                            <input
                                                type="range"
                                                min="0"
                                                max="2000"
                                                step="50"
                                                value={filters.priceRange.max}
                                                onChange={(e) => onFiltersChange({
                                                    ...filters,
                                                    priceRange: { ...filters.priceRange, max: Number(e.target.value) }
                                                })}
                                                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Dropdown Component
interface FilterDropdownProps {
    label: string;
    isOpen: boolean;
    onToggle: () => void;
    selectedCount: number;
    children: React.ReactNode;
}

function FilterDropdown({ label, isOpen, onToggle, selectedCount, children }: FilterDropdownProps) {
    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isOpen || selectedCount > 0
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                )}
            >
                {label}
                {selectedCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center">
                        {selectedCount}
                    </span>
                )}
                <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 bg-white rounded-xl border border-zinc-200 shadow-xl z-50 min-w-[200px]"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export { DEFAULT_FILTERS };
