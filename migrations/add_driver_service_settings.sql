-- Add Driver Service Configuration to Company Settings
-- Adds 8 new fields for driver service rates and surcharge configuration

ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS driver_daily_rate varchar DEFAULT '300',
ADD COLUMN IF NOT EXISTS driver_hourly_rate varchar DEFAULT '50',
ADD COLUMN IF NOT EXISTS driver_night_shift_start_hour varchar DEFAULT '22',
ADD COLUMN IF NOT EXISTS driver_night_shift_end_hour varchar DEFAULT '06',
ADD COLUMN IF NOT EXISTS driver_night_surcharge_multiplier varchar DEFAULT '1.5',
ADD COLUMN IF NOT EXISTS driver_weekend_surcharge_multiplier varchar DEFAULT '1.3',
ADD COLUMN IF NOT EXISTS driver_holiday_surcharge_multiplier varchar DEFAULT '2.0',
ADD COLUMN IF NOT EXISTS driver_service_vat_applicable boolean DEFAULT true NOT NULL;
