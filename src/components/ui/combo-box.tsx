"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "./separator";

interface Options {
  value: string;
  label: string;
}
export function Combobox({
  placeholder,
  options,
  value,
  onChange,
  onBlur,
  handleCreate,
}: {
  placeholder: string;
  options: Options[];
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  handleCreate?: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [width, setWidth] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (open && buttonRef.current) {
      setWidth(buttonRef.current.offsetWidth);
    }
  }, [open]);

  const selectedValue = value || "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          type="button"
          onBlur={onBlur}
        >
          {selectedValue ? (
            options.find((option) => option.value === selectedValue)?.label
          ) : (
            <span className="text-muted-foreground font-normal">{placeholder}</span>
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: width ? `${width}px` : undefined }}>
        <Command shouldFilter={true}>
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList>
            <CommandEmpty>Nothing found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  keywords={[option.value]}
                  onSelect={(currentLabel) => {
                    const selectedOption = options.find(
                      (opt) => opt.label === currentLabel
                    );
                    if (selectedOption) {
                      const newValue =
                        selectedOption.value === selectedValue
                          ? ""
                          : selectedOption.value;
                      onChange?.(newValue);
                    }
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedValue === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <Separator />
            <div
              onClick={handleCreate}
              className="text-sm text-blue-500 text-center py-2 cursor-pointer"
            >
              + Create
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
