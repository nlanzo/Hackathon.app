'use client';

import { Search, Filter } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFilterClick?: () => void;
  className?: string;
}

export function SearchBar({ 
  placeholder = "Search...", 
  value = '', 
  onChange, 
  onFilterClick,
  className = '' 
}: SearchBarProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {onFilterClick && (
        <button 
          onClick={onFilterClick}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Filter className="w-4 h-4" />
        </button>
      )}
    </div>
  );
} 