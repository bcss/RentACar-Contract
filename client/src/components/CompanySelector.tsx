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
import type { Company } from "@shared/schema";

interface CompanySelectorProps {
  value?: string | null;
  onChange: (value: string) => void;
  onCreateNew?: () => void;
  placeholder?: string;
  disabled?: boolean;
  "data-testid"?: string;
}

export function CompanySelector({
  value,
  onChange,
  onCreateNew,
  placeholder,
  disabled = false,
  "data-testid": testId,
}: CompanySelectorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  const defaultPlaceholder = placeholder || t('companies.selectCompany');

  // Load selected company details
  useEffect(() => {
    if (value) {
      queryClient.fetchQuery({
        queryKey: ['/api/companies', value],
        queryFn: async () => {
          const res = await fetch(`/api/companies/${value}`);
          if (!res.ok) throw new Error('Failed to fetch company');
          return res.json();
        }
      }).then((company) => {
        setSelectedCompany(company as Company);
      });
    } else {
      setSelectedCompany(null);
    }
  }, [value]);

  // Search companies query
  const { data: searchResults = [] } = useQuery<Company[]>({
    queryKey: [`/api/companies/search?q=${searchQuery}`],
    enabled: open && searchQuery.length > 0,
  });

  const displayText = selectedCompany
    ? `${selectedCompany.nameEn}${selectedCompany.nameAr ? ` / ${selectedCompany.nameAr}` : ''}`
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
            placeholder={t('companies.searchPlaceholder')}
            value={searchQuery}
            onValueChange={setSearchQuery}
            data-testid="input-search-company"
          />
          <CommandList>
            <CommandEmpty>
              {searchQuery.length > 0 ? t('common.noResults') : t('companies.searchPlaceholder')}
            </CommandEmpty>
            {searchResults.length > 0 && (
              <CommandGroup>
                {searchResults.map((company) => (
                  <CommandItem
                    key={company.id}
                    value={company.id}
                    onSelect={() => {
                      onChange(company.id);
                      setSelectedCompany(company);
                      setOpen(false);
                    }}
                    data-testid={`item-company-${company.id}`}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === company.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{company.nameEn}</span>
                      {company.nameAr && (
                        <span className="text-sm text-muted-foreground font-arabic">{company.nameAr}</span>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {company.registrationNumber && <span>{company.registrationNumber}</span>}
                        {company.contactPerson && <span className="ml-2">• {company.contactPerson}</span>}
                        {company.phone && <span className="ml-2">• {company.phone}</span>}
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
                data-testid="button-create-company"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('companies.addCompany')}
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
