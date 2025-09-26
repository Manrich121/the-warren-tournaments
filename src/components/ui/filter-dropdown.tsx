'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  placeholder: string;
  value?: string | null;
  options: FilterOption[];
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
}

export function FilterDropdown({ 
  placeholder, 
  value, 
  options, 
  onValueChange,
  disabled = false 
}: FilterDropdownProps) {
  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === 'all' || selectedValue === '') {
      onValueChange(null);
    } else {
      onValueChange(selectedValue);
    }
  };

  return (
    <Select 
      value={value || 'all'} 
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder}</SelectItem>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}