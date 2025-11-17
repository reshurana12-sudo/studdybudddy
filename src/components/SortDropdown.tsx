import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export interface SortOption {
  label: string;
  value: string;
}

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SortDropdown = ({ options, value, onChange, className = "" }: SortDropdownProps) => {
  const currentOption = options.find(opt => opt.value === value);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all ${className}`}
        >
          <ArrowUpDown className="w-4 h-4" />
          <span className="hidden sm:inline">{currentOption?.label || "Sort"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover/95 backdrop-blur-xl border-border/50">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`cursor-pointer ${value === option.value ? 'bg-primary/10 text-primary' : ''}`}
          >
            {option.value.includes('asc') ? (
              <ArrowUp className="w-4 h-4 mr-2" />
            ) : (
              <ArrowDown className="w-4 h-4 mr-2" />
            )}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
