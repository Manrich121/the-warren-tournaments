'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { sanitizeInput } from '@/lib/input-sanitization';

export interface TypeaheadOption<T = string> {
  label: string;
  value: T;
  data?: any;
}

export interface TypeaheadDropdownProps<T = string> {
  options: TypeaheadOption<T>[];
  value: T | T[] | null;
  onSelect: (value: T | T[] | null) => void;
  multiple?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  required?: boolean;
}

export function TypeaheadDropdown<T = string>({
  options,
  value,
  onSelect,
  multiple = false,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  disabled = false,
  error = false,
  helperText,
  label,
  required = false
}: TypeaheadDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize value to array for easier handling
  const selectedValues = useMemo(() => {
    if (value === null) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!open) {
      const timeoutId = setTimeout(() => {
        setSearchQuery('');
      }, 200);
      return () => clearTimeout(timeoutId);
    } else {
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;

    const sanitized = sanitizeInput(searchQuery.toLowerCase());
    return options.filter(option => sanitizeInput(option.label.toLowerCase()).includes(sanitized));
  }, [options, searchQuery]);
  const selectedLabels = useMemo(() => {
    return selectedValues.map(val => options.find(opt => opt.value === val)?.label).filter(Boolean) as string[];
  }, [selectedValues, options]);

  // Handle option selection
  const handleSelect = (optionValue: T) => {
    if (multiple) {
      const currentValues = selectedValues as T[];
      const isSelected = currentValues.some(v => v === optionValue);

      if (isSelected) {
        const newValues = currentValues.filter(v => v !== optionValue);
        onSelect(newValues.length > 0 ? newValues : null);
      } else {
        onSelect([...currentValues, optionValue]);
      }
    } else {
      onSelect(optionValue === value ? null : optionValue);
      setOpen(false);
    }
  };

  // Handle clear action
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setSearchQuery('');
  };

  // Remove single value in multiple mode
  const handleRemoveValue = (valueToRemove: T, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      const currentValues = selectedValues as T[];
      const newValues = currentValues.filter(v => v !== valueToRemove);
      onSelect(newValues.length > 0 ? newValues : null);
    }
  };

  // Highlight matched text in option labels
  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query) return text;

    const sanitizedText = sanitizeInput(text);
    const sanitizedQuery = sanitizeInput(query);
    const regex = new RegExp(`(${sanitizedQuery})`, 'gi');
    const parts = sanitizedText.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === sanitizedQuery.toLowerCase()) {
        return (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-900">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative w-full">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label={label || placeholder}
              aria-controls={open ? 'typeahead-options' : undefined}
              disabled={disabled}
              className={cn(
                'w-full justify-between',
                error && 'border-red-500',
                selectedValues.length === 0 && 'text-muted-foreground'
              )}
            >
              <div className="flex flex-1 flex-wrap gap-1 items-center overflow-hidden">
                {selectedValues.length === 0 ? (
                  <span>{placeholder}</span>
                ) : multiple ? (
                  selectedLabels.map((label, index) => {
                    const correspondingValue = selectedValues[index];
                    return (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="mr-1"
                        onClick={e => handleRemoveValue(correspondingValue, e)}
                      >
                        {label}
                        <button
                          className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handleRemoveValue(correspondingValue, e as any);
                            }
                          }}
                          aria-label={`Remove ${label}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })
                ) : (
                  <span className="truncate">{selectedLabels[0]}</span>
                )}
              </div>

              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] p-0"
            align="start"
            id="typeahead-options"
            onCloseAutoFocus={e => e.preventDefault()}
          >
            <div
              className="p-2 border-b"
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <Input
                ref={searchInputRef}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  e.stopPropagation();
                  if (e.key === 'Escape') {
                    setOpen(false);
                  }
                }}
                className="h-8"
              />
            </div>
            <ScrollArea className="max-h-[300px]">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">No results found.</div>
              ) : (
                <div className="p-1">
                  {filteredOptions.map(option => {
                    const isSelected = selectedValues.some(v => v === option.value);

                    return (
                      <DropdownMenuItem
                        key={String(option.value)}
                        onSelect={() => handleSelect(option.value)}
                        className="cursor-pointer flex items-center justify-between px-2 py-1.5"
                      >
                        <span className="flex-1">{highlightMatch(option.label, searchQuery)}</span>
                        <Check className={cn('ml-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        {selectedValues.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-9 top-1/2 -translate-y-1/2 hover:bg-muted rounded p-1 transition-colors z-10"
            aria-label="Clear selection"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {helperText && <p className={cn('text-sm', error ? 'text-red-500' : 'text-muted-foreground')}>{helperText}</p>}
    </div>
  );
}
