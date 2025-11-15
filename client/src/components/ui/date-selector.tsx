import { useTranslation } from 'react-i18next';
import {
import { Icon } from '@/components/Icon';
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateSelectorProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function DateSelector({
  value,
  onChange,
  placeholder,
  minYear = 2020,
  maxYear = 2030,
  disabled = false,
  className = '',
  'data-testid': testId,
}: DateSelectorProps) {
  const { t, i18n } = useTranslation();

  const selectedDay = value ? value.getDate() : undefined;
  const selectedMonth = value ? value.getMonth() + 1 : undefined; // getMonth() returns 0-11
  const selectedYear = value ? value.getFullYear() : undefined;

  // Generate days (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Generate years
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i
  );

  // Get max days for the selected month/year
  const getMaxDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const handleDayChange = (day: string) => {
    const dayNum = parseInt(day);
    const month = selectedMonth || 1;
    const year = selectedYear || new Date().getFullYear();
    
    // Validate day is valid for the month
    const maxDays = getMaxDaysInMonth(month, year);
    if (dayNum > maxDays) {
      return;
    }
    
    const newDate = new Date(year, month - 1, dayNum);
    onChange(newDate);
  };

  const handleMonthChange = (month: string) => {
    const monthNum = parseInt(month);
    const day = selectedDay || 1;
    const year = selectedYear || new Date().getFullYear();
    
    // Adjust day if it's invalid for the new month
    const maxDays = getMaxDaysInMonth(monthNum, year);
    const validDay = Math.min(day, maxDays);
    
    const newDate = new Date(year, monthNum - 1, validDay);
    onChange(newDate);
  };

  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year);
    const day = selectedDay || 1;
    const month = selectedMonth || 1;
    
    // Adjust day if it's invalid for the new year (leap year handling)
    const maxDays = getMaxDaysInMonth(month, yearNum);
    const validDay = Math.min(day, maxDays);
    
    const newDate = new Date(yearNum, month - 1, validDay);
    onChange(newDate);
  };

  const handleClear = () => {
    onChange(undefined);
  };

  // Get max days for current selection
  const maxDays = selectedMonth && selectedYear 
    ? getMaxDaysInMonth(selectedMonth, selectedYear)
    : 31;

  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid={testId}>
      {/* Day Dropdown */}
      <Select
        value={selectedDay?.toString()}
        onValueChange={handleDayChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-20" data-testid={`${testId}-day`}>
          <SelectValue placeholder={t('date.day')} />
        </SelectTrigger>
        <SelectContent>
          {days.slice(0, maxDays).map((day) => (
            <SelectItem key={day} value={day.toString()}>
              {String(day).padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month Dropdown */}
      <Select
        value={selectedMonth?.toString()}
        onValueChange={handleMonthChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-36" data-testid={`${testId}-month`}>
          <SelectValue placeholder={t('date.month')} />
        </SelectTrigger>
        <SelectContent>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
            <SelectItem key={month} value={month.toString()}>
              {t(`date.months.${month}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year Dropdown */}
      <Select
        value={selectedYear?.toString()}
        onValueChange={handleYearChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-24" data-testid={`${testId}-year`}>
          <SelectValue placeholder={t('date.year')} />
        </SelectTrigger>
        <SelectContent>
          {years.reverse().map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear button */}
      {value && !disabled && (
        <button
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
          data-testid={`${testId}-clear`}
          type="button"
        >
          <Icon name="close" className="text-sm" />
        </button>
      )}
    </div>
  );
}
