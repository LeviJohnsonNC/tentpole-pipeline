
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SalespersonSelectorProps {
  value?: string;
  onValueChange: (salesperson: string) => void;
  placeholder?: string;
}

// Mock salesperson data - in the future this could come from a store
const salespeople = [
  { id: "mike", name: "Mike Johnson" },
  { id: "lisa", name: "Lisa Chen" },
  { id: "john", name: "John Smith" },
  { id: "sarah", name: "Sarah Wilson" },
];

const SalespersonSelector = ({ value, onValueChange, placeholder = "Select salesperson..." }: SalespersonSelectorProps) => {
  const [open, setOpen] = useState(false);
  
  const selectedSalesperson = salespeople.find(person => person.name === value);

  const handleSelect = (salesperson: string) => {
    onValueChange(salesperson);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedSalesperson ? selectedSalesperson.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search salespeople..." />
          <CommandList>
            <CommandEmpty>No salesperson found.</CommandEmpty>
            <CommandGroup>
              {salespeople.map((person) => (
                <CommandItem
                  key={person.id}
                  value={person.name}
                  onSelect={() => handleSelect(person.name)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === person.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {person.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SalespersonSelector;
