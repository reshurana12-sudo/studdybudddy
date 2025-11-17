import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({ value, onChange, placeholder = "Search...", className = "" }: SearchBarProps) => {
  return (
    <div className={`relative w-full ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-destructive/10"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
