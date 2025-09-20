import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: 'all' | 'active' | 'completed' | 'due-today';
  onFilterChange: (status: 'all' | 'active' | 'completed' | 'due-today') => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
}) => {
  const clearSearch = () => {
    onSearchChange('');
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks', count: null },
    { value: 'active', label: 'Active', count: null },
    { value: 'completed', label: 'Completed', count: null },
    { value: 'due-today', label: 'Due Today', count: null },
  ] as const;

  return (
    <div className="glass-card p-4 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tasks by title or subject..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filter:</span>
        </div>
        
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={filterStatus === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(option.value)}
            className={`btn-hover-scale ${
              filterStatus === option.value 
                ? 'bg-primary text-primary-foreground shadow-glow' 
                : 'glass-card-hover'
            }`}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Active Filters Display */}
      {(searchQuery || filterStatus !== 'all') && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{searchQuery}"
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filterStatus !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filterOptions.find(f => f.value === filterStatus)?.label}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFilterChange('all')}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange('');
              onFilterChange('all');
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};