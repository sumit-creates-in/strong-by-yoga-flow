
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Country {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
}

const countries: Country[] = [
  { code: "us", dialCode: "+1", name: "United States", flag: "🇺🇸" },
  { code: "ca", dialCode: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "gb", dialCode: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "au", dialCode: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "in", dialCode: "+91", name: "India", flag: "🇮🇳" },
  { code: "de", dialCode: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "fr", dialCode: "+33", name: "France", flag: "🇫🇷" },
  { code: "jp", dialCode: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "cn", dialCode: "+86", name: "China", flag: "🇨🇳" },
  { code: "br", dialCode: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "mx", dialCode: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "it", dialCode: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "kr", dialCode: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "ru", dialCode: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "za", dialCode: "+27", name: "South Africa", flag: "🇿🇦" },
];

interface CountryCodeSelectorProps {
  selectedCountry: Country;
  onSelect: (country: Country) => void;
  className?: string;
}

export const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  selectedCountry,
  onSelect,
  className
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("flex items-center justify-between w-[110px]", className)}
        >
          <span className="mr-1">{selectedCountry.flag}</span>
          <span>{selectedCountry.dialCode}</span>
          <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {countries.map((country) => (
              <CommandItem
                key={country.code}
                onSelect={() => {
                  onSelect(country);
                  setOpen(false);
                }}
                className="flex items-center"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCountry.code === country.code ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="mr-2">{country.flag}</span>
                <span>{country.name}</span>
                <span className="ml-auto text-muted-foreground">{country.dialCode}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const useCountryDetection = () => {
  const [country, setCountry] = useState<Country>(countries[0]); // Default to US

  useEffect(() => {
    // Try to detect user's country
    const detectCountry = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        const countryCode = data.country_code.toLowerCase();
        const detectedCountry = countries.find(c => c.code === countryCode);
        if (detectedCountry) {
          setCountry(detectedCountry);
        }
      } catch (error) {
        console.error("Error detecting country:", error);
      }
    };

    detectCountry();
  }, []);

  return { country, setCountry, countries };
};

export default CountryCodeSelector;
