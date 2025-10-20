import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
import type { Person } from "@shared/schema";

interface SponsorSelectorProps {
  value?: string | null;
  onChange: (value: string) => void;
  onCreateNew?: () => void;
  placeholder?: string;
  type?: "sponsor" | "driver";
  disabled?: boolean;
  "data-testid"?: string;
}

export function SponsorSelector({
  value,
  onChange,
  onCreateNew,
  placeholder,
  type,
  disabled = false,
  "data-testid": testId,
}: SponsorSelectorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSponsor, setSelectedSponsor] = useState<Person | null>(null);
  
  const defaultPlaceholder = placeholder || t('sponsors.selectSponsor');

  // Load selected sponsor details
  useEffect(() => {
    if (value) {
      queryClient.fetchQuery({
        queryKey: ['/api/persons', value],
      }).then((sponsor) => {
        setSelectedSponsor(sponsor as Person);
      });
    } else {
      setSelectedSponsor(null);
    }
  }, [value]);

  // Search sponsors query
  const { data: searchResults = [] } = useQuery<Person[]>({
    queryKey: [`/api/persons/search?q=${searchQuery}`],
    enabled: open && searchQuery.length > 0,
  });

  const displayText = selectedSponsor
    ? `${selectedSponsor.nameEn}${selectedSponsor.nameAr ? ` / ${selectedSponsor.nameAr}` : ''} ${selectedSponsor.mobile ? `- ${selectedSponsor.mobile}` : ''}`
    : defaultPlaceholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
          data-testid={testId}
        >
          {displayText}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t('sponsors.searchPlaceholder')}
            value={searchQuery}
            onValueChange={setSearchQuery}
            data-testid={`input-search-${type || 'sponsor'}`}
          />
          <CommandList>
            <CommandEmpty>
              {searchQuery.length > 0 ? t('common.noResults') : t('sponsors.searchPlaceholder')}
            </CommandEmpty>
            {searchResults.length > 0 && (
              <CommandGroup>
                {searchResults.map((person) => (
                  <CommandItem
                    key={person.id}
                    value={person.id}
                    onSelect={() => {
                      onChange(person.id);
                      setSelectedSponsor(person);
                      setOpen(false);
                    }}
                    data-testid={`item-${type || 'sponsor'}-${person.id}`}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === person.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{person.nameEn}</span>
                      {person.nameAr && (
                        <span className="text-sm text-muted-foreground font-arabic">{person.nameAr}</span>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {person.mobile && <span>{person.mobile}</span>}
                        {person.passportId && <span className="ml-2">• {person.passportId}</span>}
                        {person.relation && <span className="ml-2">• {person.relation}</span>}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
          {onCreateNew && (
            <div className="border-t p-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  onCreateNew();
                  setOpen(false);
                }}
                data-testid={`button-create-${type || 'sponsor'}`}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('sponsors.addSponsor')}
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
