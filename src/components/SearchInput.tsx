import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchInput({
    value,
    onChange,
    placeholder = "Search executives, companies, skills...",
    className
}: SearchInputProps) {
    const [localValue, setLocalValue] = useState(value);

    // Debounce the onChange callback
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localValue, onChange, value]);

    // Sync external value changes
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleClear = useCallback(() => {
        setLocalValue('');
        onChange('');
    }, [onChange]);

    return (
        <div className={cn("relative", className)}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "w-full pl-12 pr-10 py-3 bg-white rounded-xl border border-zinc-200",
                    "text-zinc-900 placeholder:text-zinc-400",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
                    "transition-all"
                )}
            />
            {localValue && (
                <button
                    onClick={handleClear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-100 transition-colors"
                >
                    <X className="w-4 h-4 text-zinc-400" />
                </button>
            )}
        </div>
    );
}
