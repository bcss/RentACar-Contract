-- CREATE TYPE "public"."emirate" AS ENUM(...); -- Already exists in database, skipping
--> statement-breakpoint
CREATE TABLE "access_logs" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" varchar,
        "username_attempted" varchar,
        "ip_address" varchar NOT NULL,
        "country" varchar(100),
        "region" varchar(100),
        "city" varchar(100),
        "user_agent" text,
        "outcome" varchar(20) NOT NULL,
        "failure_reason" text,
        "metadata" jsonb,
        "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" varchar NOT NULL,
        "action" varchar(50) NOT NULL,
        "contract_id" varchar,
        "ip_address" varchar,
        "user_agent" text,
        "session_id" varchar,
        "country" varchar(100),
        "city" varchar(100),
        "region" varchar(100),
        "details" text,
        "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "branch_transfers" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "vehicle_id" varchar NOT NULL,
        "source_branch_id" varchar NOT NULL,
        "destination_branch_id" varchar NOT NULL,
        "transfer_date" timestamp NOT NULL,
        "reason" text,
        "status" varchar(20) DEFAULT 'pending' NOT NULL,
        "approved_by" varchar,
        "approved_at" timestamp,
        "rejected_reason" text,
        "completed_at" timestamp,
        "notes" text,
        "initiated_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "branches" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "branch_code" varchar NOT NULL,
        "name_en" varchar NOT NULL,
        "name_ar" varchar,
        "emirate" "emirate" NOT NULL,
        "address_en" text NOT NULL,
        "address_ar" text,
        "phone" varchar NOT NULL,
        "email" varchar,
        "manager_user_id" varchar,
        "is_headquarters" boolean DEFAULT false NOT NULL,
        "opening_hours" jsonb,
        "notes" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "disabled" boolean DEFAULT false NOT NULL,
        "disabled_by" varchar,
        "disabled_at" timestamp,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "branches_branch_code_unique" UNIQUE("branch_code")
);
--> statement-breakpoint
CREATE TABLE "companies" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name_en" varchar NOT NULL,
        "name_ar" varchar,
        "registration_number" varchar,
        "registration_validity" timestamp,
        "tax_id" varchar,
        "tax_validity" timestamp,
        "contact_person" varchar,
        "phone" varchar,
        "email" varchar,
        "address" text,
        "emirate" "emirate",
        "notes" text,
        "disabled" boolean DEFAULT false NOT NULL,
        "disabled_by" varchar,
        "disabled_at" timestamp,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "company_settings" (
        "id" varchar PRIMARY KEY DEFAULT 'singleton' NOT NULL,
        "company_name_en" varchar DEFAULT 'RCCMS' NOT NULL,
        "company_name_ar" varchar DEFAULT 'نظام إدارة عقود تأجير السيارات' NOT NULL,
        "company_legal_name_en" varchar DEFAULT 'RENTAL CAR COMPANY LLC' NOT NULL,
        "company_legal_name_ar" varchar DEFAULT 'شركة تأجير السيارات ش.ذ.م.م' NOT NULL,
        "tagline_en" varchar DEFAULT 'RENT A CAR' NOT NULL,
        "tagline_ar" varchar DEFAULT 'تأجير السيارات' NOT NULL,
        "phone" varchar DEFAULT '+971 0 000 0000' NOT NULL,
        "phone_ar" varchar DEFAULT '+٩٧١ ٠ ٠٠٠ ٠٠٠٠' NOT NULL,
        "mobile" varchar DEFAULT '+971 50 000 0000' NOT NULL,
        "mobile_ar" varchar DEFAULT '+٩٧١ ٥٠ ٠٠٠ ٠٠٠٠' NOT NULL,
        "email" varchar DEFAULT 'info@rentalcompany.com' NOT NULL,
        "website" varchar DEFAULT 'www.rentalcompany.com' NOT NULL,
        "address_en" varchar DEFAULT 'P.O. Box: 00000, City, UAE' NOT NULL,
        "address_ar" varchar DEFAULT 'ص.ب: ٠٠٠٠٠، المدينة، الإمارات' NOT NULL,
        "logo_url" varchar,
        "currency_en" varchar(10) DEFAULT '' NOT NULL,
        "currency_ar" varchar(10) DEFAULT '' NOT NULL,
        "vat_percentage" varchar DEFAULT '5' NOT NULL,
        "default_daily_rate" varchar DEFAULT '150' NOT NULL,
        "default_weekly_rate" varchar DEFAULT '900' NOT NULL,
        "default_monthly_rate" varchar DEFAULT '3000' NOT NULL,
        "insurance_per_day" varchar DEFAULT '25' NOT NULL,
        "gps_per_day" varchar DEFAULT '15' NOT NULL,
        "baby_seat_per_day" varchar DEFAULT '20' NOT NULL,
        "additional_driver_fee" varchar DEFAULT '50' NOT NULL,
        "default_extra_km_rate" varchar DEFAULT '1.5' NOT NULL,
        "default_security_deposit" varchar DEFAULT '1500' NOT NULL,
        "petrol_price_per_liter" varchar DEFAULT '3.5' NOT NULL,
        "diesel_price_per_liter" varchar DEFAULT '3.2' NOT NULL,
        "default_drop_off_charge" varchar DEFAULT '0' NOT NULL,
        "default_pick_up_charge" varchar DEFAULT '0' NOT NULL,
        "terms_section_1_en" text DEFAULT '' NOT NULL,
        "terms_section_1_ar" text DEFAULT '' NOT NULL,
        "terms_section_2_en" text DEFAULT '' NOT NULL,
        "terms_section_2_ar" text DEFAULT '' NOT NULL,
        "terms_section_3_en" text DEFAULT '' NOT NULL,
        "terms_section_3_ar" text DEFAULT '' NOT NULL,
        "payment_terms_fine_en" text DEFAULT 'The Hirer will pay AED 60/- for each fine, 20 dirhams for Dubai Govt. Knowledge Fee and 20 dirhams for paid charge' NOT NULL,
        "payment_terms_fine_ar" text DEFAULT 'يدفع (المستأجر) مبلغ ٦٠ درهم عن كل غرامة، يسدد منها مبلغ ٣٠ درهم رسوم إدارية لحكومة دبي ومبلغ ٣٠ درهم رسوم غرامة.' NOT NULL,
        "payment_terms_balance_en" text DEFAULT 'When the Hirer return the car he/she had to clear whole balance within 48 hours if not the hirer will continuously be charged AED 25/- per day' NOT NULL,
        "payment_terms_balance_ar" text DEFAULT 'عند إعادة السيارة على (المستأجر) سداد كافة الرصيد المطلوب منه خلال ٤٨ ساعة، والإيجارالمستأجر يسدد ٢٥ درهم عن كل يوم تأخير' NOT NULL,
        "payment_terms_fine_week_en" text DEFAULT 'In case any fine the Hirer must to be cleared within one week maximum or the Hirer will be charged AED 25/- per week' NOT NULL,
        "payment_terms_fine_week_ar" text DEFAULT 'في حال وجود غرامة، على (المستأجر) سداد الغرامة خلال أسبوع واحد نعطي التقارير والإنذار بسداد مبلغ ٢٥ درهما غرامة تأخير' NOT NULL,
        "payment_terms_security_en" text DEFAULT 'The Hirer agrees that the Company may retain AED 1500/- for fine security for 15 days from the date of return of vehicle.' NOT NULL,
        "payment_terms_security_ar" text DEFAULT 'يتم الاحتفاظ بمبلغ ١٥٠٠ درهم من قيمة البطاقة الائتمانية من تاريخ إعادة السيارة لمدة ١٥ يوما من تاريخ إرجاع السيارة الإيجار' NOT NULL,
        "payment_terms_acknowledge_en" text DEFAULT 'Acknowledge the I/ we read above and reverse mentioned terms and conditions and agree to abide by them.' NOT NULL,
        "payment_terms_acknowledge_ar" text DEFAULT 'إقرار بأننا اعتمدنا على الشروط والأحكام أعلاه و كذلك الشروط المنبعة بعلامة وموافق على الالتزام بها.' NOT NULL,
        "payment_terms_inspection_en" text DEFAULT 'It is agreed that the vehicle shall be inspected before receiving it by conducting a comprehensive inspection of all its parts from all aspects, and the hirer bears full responsibility for the consequences on the equipment.' NOT NULL,
        "payment_terms_inspection_ar" text DEFAULT 'يتفق أن يستحصن السيارة فى فبل استلامها للقيام بفحص شامل للسيارة فى جميع أجزائها من جميع الجوانب ويتحمل المسؤولية الكاملة فعل العواقب في الأجهزة' NOT NULL,
        "payment_terms_repair_en" text DEFAULT 'In case there is doubt about the situation, the rental contract renewal payment shall be made while the vehicle is parked in the garage for repair.' NOT NULL,
        "payment_terms_repair_ar" text DEFAULT 'فى حالة إذا شكت أن الواقع مع دفع تجديد عقد إيجار السيارة في إطار وقوف السيارة في الكراج للصليح' NOT NULL,
        "payment_terms_accident_new_license_en" text DEFAULT 'In case of an accident where the hirer holds a driving license issued less than one year ago and is the cause of the accident, they shall bear 20% of the accident value in addition to the liability amount of 2500 dirhams, plus daily rent for the number of days the vehicle is parked in the garage for repair.' NOT NULL,
        "payment_terms_accident_new_license_ar" text DEFAULT 'فى حالة حصول حادث وكان المستأجر يحمل رخصة قيادة ماضي على صدورها أقل من سنة وهو المسبب فى الحادث يتحمل ٪٢٠ من قيمة الحادث وإضافة إلى التحمل البالغ ٢٥٠٠ درهم الإيجار اليومي لعدد أيام وقوف السيارة في الكراج لغرض التصليح' NOT NULL,
        "payment_terms_accident_general_en" text DEFAULT 'In case of an accident, they shall bear 90% of the accident value in addition to the liability amount of 2500 dirhams, plus daily rent for the period the vehicle is parked in the garage for repair.' NOT NULL,
        "payment_terms_accident_general_ar" text DEFAULT 'فى حادث يتحمل ٪٩٠ من قيمة الحادث وإضافة إلى التحمل البالغ ٢٥٠٠ درهم الإيجار اليومي لمدة أيام وقوف السيارة في الكراج لغرض التصليح' NOT NULL,
        "clause_writeoff_en" text DEFAULT 'In case of writing off the car by the concerned parties. The person who rented the car shall pay 5000 Dirhams a compensation for the full damaged of the rented cars in addition to the rent, till all procedures are completed and insurance company give the compensation. If the car is cofiscated by concerned authorities for any reason caused by the person who rented the car He/She shall pay the full value of the car in addition the rent and the above mentioned.' NOT NULL,
        "clause_writeoff_ar" text DEFAULT 'في حالة تسقط السيارة من الجهات منعضة يقوم المستأجر بدفع مبلغ خمسة آلف درهم (٥٠٠٠) درهما تعويضا عن أي ضرر يلحق المطالبة الايجار الإجمالي المترتب بالإضافة إلى قيمة الإيجار حتى انتهاء كافة الإجراءات بالإضافة والمصروحي في حالة مصادرة السيارة من جهات معينة بسبب قد تسبب ف' NOT NULL,
        "clause_credit_auth_en" text DEFAULT 'I, the undersigned authorise the Company to charge my credit card the rent value and any other additional amounts or offence and penalties (Police or Municipality adding Dhs. 20 for each fine) even after the returned back of the vehicle to the Company within the hire period through the credit card belonging to .......................... Dhs. additional' NOT NULL,
        "clause_credit_auth_ar" text DEFAULT 'أنا الموقع أدناه أفوض الشركة لتأجير السيارات بتقاضى قيمة الإيجار وأى مبالغ إضافية أو مخالفات و غرامات (سرعة و بلدية بمبلغ ٣٠ درهم على كل مخالفة) حتى بعد إعادة السيارة للشركة ضمن فترة استئجار السيارة وذلك من خلال بطاقة الائتمان الخاصة بـــ..........................درهم إضافية' NOT NULL,
        "clause_desert_prohibition_en" text DEFAULT 'Vehicle not allowed to drive in Desert Area' NOT NULL,
        "clause_desert_prohibition_ar" text DEFAULT 'السيـــارة لايسمح للقيـــادة فــي منــطقة صحــراويــة' NOT NULL,
        "clause_accident_hirer_fault_en" text DEFAULT 'In Case of accident will occur to the vehicle and the mistake from the hirer the hirer has to pay basic lump sum of Dhs. __________ in addition to the daily rent till the vehicle complete repairing' NOT NULL,
        "clause_accident_hirer_fault_ar" text DEFAULT 'في حالة حدوث حادث وكان المستأجر متسبب يكون المستأجر ملزم بدفع مبلغ قدره ................درهم إضافية في إطار قدوم للإصلاح يتم تحصيل استيفاً' NOT NULL,
        "clause_accident_not_fault_en" text DEFAULT 'In case of any accident will occur to the vehicle and the mistake not from the hirer will pay daily rent, till the vehicle complete repairing.' NOT NULL,
        "clause_accident_not_fault_ar" text DEFAULT 'في حالة حدوث حادث وكان المستأجر منضرر بالدفع لإيجار فترة وقوف السيارة في الكراج لحين اصلاحها' NOT NULL,
        "clause_monthly_payment_en" text DEFAULT 'In case monthly rent the hirer should pay amount from every 10 days in advance' NOT NULL,
        "clause_monthly_payment_ar" text DEFAULT 'في حالة الإيجار الشهري يقوم المستأجر بدفع الإيجار كل ١٠ أيام' NOT NULL,
        "clause_daily_km_limit_en" text DEFAULT 'PER DAY 300 KMS AND 50 FILS EXTRA FOR ONE K.M.' NOT NULL,
        "clause_daily_km_limit_ar" text DEFAULT 'عدد الكيلومترات المسموح بها (٣٠٠ كم) لليوم الواحد ومابزيد عن ذلك تحتسب ٥٠ إضافية لكيلومتر الواحد' NOT NULL,
        "clause_monthly_km_limit_en" text DEFAULT 'Monthly maximum 5000 km is allowed, 40 fils extra charged for each km' NOT NULL,
        "clause_monthly_km_limit_ar" text DEFAULT 'الحد الأقصى للشهري المسموح به هو ٥٠٠٠ كم و٤٠ فلس إضافية على كل كيلومتر' NOT NULL,
        "clause_self_repair_penalty_en" text DEFAULT 'If any renter repaired the car by himself (incase of accident or other damage) will find Dhs. 5000/-' NOT NULL,
        "clause_self_repair_penalty_ar" text DEFAULT 'فى حالة تصليح السيارة قبل اصلاح المستأجر غير الاصلاح غرامة على المستأجر قدرها (وستجرهم) تكون موزعه للشركة' NOT NULL,
        "clause_daily_rate_default_en" text DEFAULT 'If no previous arrangement has been made for the weekly / monthly rates then the hirer is liable to pay daily rate' NOT NULL,
        "clause_daily_rate_default_ar" text DEFAULT 'اذاله يكن هناك اتفاق مسبق للإيجار الأسبوعي أو الشهري فسوف يحتسب بوافع السعر اليومى' NOT NULL,
        "clause_backpage_reference_en" text DEFAULT 'Remaining 26 Terms on back page' NOT NULL,
        "clause_backpage_reference_ar" text DEFAULT 'يتبع خلف الصفحة ٢٦ فقرة' NOT NULL,
        "updated_at" timestamp DEFAULT now(),
        "updated_by" varchar
);
--> statement-breakpoint
CREATE TABLE "contract_counter" (
        "id" varchar PRIMARY KEY DEFAULT 'singleton' NOT NULL,
        "current_number" integer DEFAULT 15499 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contract_edits" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "contract_id" varchar NOT NULL,
        "edited_by" varchar NOT NULL,
        "edited_at" timestamp DEFAULT now(),
        "edit_reason" text NOT NULL,
        "changes_summary" text,
        "fields_before" jsonb,
        "fields_after" jsonb,
        "ip_address" varchar
);
--> statement-breakpoint
CREATE TABLE "contracts" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "contract_number" integer NOT NULL,
        "status" varchar(20) DEFAULT 'draft' NOT NULL,
        "customer_id" varchar NOT NULL,
        "vehicle_id" varchar NOT NULL,
        "branch_id" varchar,
        "hirer_type" varchar(20) DEFAULT 'direct' NOT NULL,
        "sponsor_id" varchar,
        "company_sponsor_id" varchar,
        "sponsor_name" varchar,
        "sponsor_nationality" varchar,
        "sponsor_passport_id" varchar,
        "sponsor_address" text,
        "sponsor_mobile" varchar,
        "sponsor_credit_card" varchar,
        "hirer_name_en" varchar,
        "hirer_name_ar" varchar,
        "hirer_nationality" varchar,
        "hirer_passport_id" varchar,
        "hirer_license_number" varchar,
        "hirer_mobile" varchar,
        "hirer_address" text,
        "inspection_tools" boolean,
        "inspection_spare_tyre" boolean,
        "inspection_gps" boolean,
        "inspection_fuel_percentage" integer,
        "inspection_damage_notes" text,
        "vehicle_condition" text,
        "fuel_level_start" varchar,
        "fuel_level_end" varchar,
        "odometer_start" integer,
        "odometer_end" integer,
        "rental_type" varchar(20) DEFAULT 'daily' NOT NULL,
        "rental_start_date" timestamp NOT NULL,
        "rental_end_date" timestamp NOT NULL,
        "time_in" varchar,
        "time_out" varchar,
        "rental_start_time" varchar,
        "rental_end_time" varchar,
        "pickup_location" varchar NOT NULL,
        "dropoff_location" varchar NOT NULL,
        "daily_rate" varchar NOT NULL,
        "weekly_rate" varchar,
        "monthly_rate" varchar,
        "mileage_limit" integer,
        "extra_km_rate" varchar,
        "total_days" integer NOT NULL,
        "subtotal" varchar,
        "vat_amount" varchar,
        "total_amount" varchar NOT NULL,
        "security_deposit" varchar,
        "accident_liability" varchar,
        "deposit_paid" boolean DEFAULT false NOT NULL,
        "deposit_paid_date" timestamp,
        "deposit_paid_method" varchar(50),
        "deposit_refunded" boolean DEFAULT false NOT NULL,
        "deposit_refunded_date" timestamp,
        "final_payment_received" boolean DEFAULT false NOT NULL,
        "final_payment_date" timestamp,
        "final_payment_method" varchar(50),
        "payment_status" varchar(20) DEFAULT 'pending' NOT NULL,
        "outstanding_balance" varchar,
        "extra_km_charge" varchar,
        "extra_km_driven" integer,
        "fuel_charge" varchar,
        "salik_charge" varchar,
        "traffic_fine_charge" varchar,
        "damage_charge" varchar,
        "other_charges" varchar,
        "total_extra_charges" varchar,
        "drop_off_enabled" boolean DEFAULT false NOT NULL,
        "drop_off_charge" varchar,
        "drop_off_address_en" text,
        "drop_off_address_ar" text,
        "pick_up_enabled" boolean DEFAULT false NOT NULL,
        "pick_up_charge" varchar,
        "pick_up_address_en" text,
        "pick_up_address_ar" text,
        "notes" text,
        "terms_accepted" boolean DEFAULT false NOT NULL,
        "confirmed_by" varchar,
        "confirmed_at" timestamp,
        "activated_by" varchar,
        "activated_at" timestamp,
        "completed_by" varchar,
        "completed_at" timestamp,
        "closed_by" varchar,
        "closed_at" timestamp,
        "closure_remark" text,
        "early_closure_reason" text,
        "edit_reason" text,
        "created_by" varchar NOT NULL,
        "finalized_by" varchar,
        "finalized_at" timestamp,
        "disabled" boolean DEFAULT false NOT NULL,
        "disabled_by" varchar,
        "disabled_at" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "contracts_contract_number_unique" UNIQUE("contract_number")
);
--> statement-breakpoint
CREATE TABLE "customers" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name_en" varchar NOT NULL,
        "name_ar" varchar,
        "national_id" varchar,
        "gender" varchar(10),
        "date_of_birth" timestamp,
        "phone" varchar NOT NULL,
        "email" varchar,
        "address" text,
        "license_number" varchar,
        "license_issued_by" varchar,
        "license_issue_date" timestamp,
        "license_expiry_date" timestamp,
        "nationality" varchar,
        "emirate" "emirate",
        "license_permitted_vehicles" varchar,
        "license_transmission_type" varchar,
        "license_wearing_glasses" boolean,
        "license_place_of_issue" varchar,
        "license_licensing_authority" varchar,
        "license_traffic_code_no" varchar,
        "license_date_of_birth" timestamp,
        "license_date_of_issue" timestamp,
        "license_date_of_expiry" timestamp,
        "notes" text,
        "branch_id" varchar,
        "disabled" boolean DEFAULT false NOT NULL,
        "disabled_by" varchar,
        "disabled_at" timestamp,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "customers_national_id_unique" UNIQUE("national_id")
);
--> statement-breakpoint
CREATE TABLE "damage_assessments" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "contract_id" varchar NOT NULL,
        "location" varchar NOT NULL,
        "damage_type" varchar NOT NULL,
        "severity" varchar NOT NULL,
        "description" text,
        "estimated_cost" varchar,
        "actual_cost" varchar,
        "photos" text[],
        "recorded_by" varchar NOT NULL,
        "recorded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_approvals" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "customer_id" varchar NOT NULL,
        "document_type" varchar(50) NOT NULL,
        "document_image" text NOT NULL,
        "status" varchar(20) DEFAULT 'pending' NOT NULL,
        "submitted_by" varchar NOT NULL,
        "reviewed_by" varchar,
        "reviewed_at" timestamp,
        "rejection_reason" text,
        "notes" text,
        "disabled" boolean DEFAULT false NOT NULL,
        "disabled_by" varchar,
        "disabled_at" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "driver_assignments" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "contract_id" varchar NOT NULL,
        "driver_id" varchar NOT NULL,
        "start_date_time" timestamp NOT NULL,
        "end_date_time" timestamp NOT NULL,
        "service_type" varchar(20) NOT NULL,
        "base_rate" varchar NOT NULL,
        "quantity" varchar NOT NULL,
        "surcharge_breakdown" jsonb,
        "total_surcharges" varchar DEFAULT '0' NOT NULL,
        "total_charge" varchar NOT NULL,
        "status" varchar(20) DEFAULT 'scheduled' NOT NULL,
        "handover_notes" text,
        "handover_notes_ar" text,
        "completion_notes" text,
        "handover_date_time" timestamp,
        "completion_date_time" timestamp,
        "assigned_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "driver_outsource_companies" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name_en" varchar NOT NULL,
        "name_ar" varchar,
        "contact_person" varchar,
        "phone" varchar NOT NULL,
        "email" varchar,
        "address" text,
        "contract_number" varchar,
        "contract_start_date" timestamp,
        "contract_end_date" timestamp,
        "notes" text,
        "disabled" boolean DEFAULT false NOT NULL,
        "disabled_by" varchar,
        "disabled_at" timestamp,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "driver_rate_cards" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "driver_id" varchar NOT NULL,
        "rate_type" varchar(20) NOT NULL,
        "base_rate" varchar NOT NULL,
        "effective_from" timestamp NOT NULL,
        "effective_to" timestamp,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "driver_schedule_blocks" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "driver_id" varchar NOT NULL,
        "start_date_time" timestamp NOT NULL,
        "end_date_time" timestamp NOT NULL,
        "block_type" varchar(20) NOT NULL,
        "reason" text,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drivers" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "driver_code" varchar NOT NULL,
        "name_en" varchar NOT NULL,
        "name_ar" varchar,
        "mobile" varchar NOT NULL,
        "email" varchar,
        "nationality" varchar NOT NULL,
        "license_number" varchar NOT NULL,
        "license_class" varchar NOT NULL,
        "license_expiry" timestamp NOT NULL,
        "languages_spoken" text[],
        "employment_type" varchar(20) NOT NULL,
        "outsource_company_id" varchar,
        "cost_rate" varchar,
        "availability" varchar(20) DEFAULT 'available' NOT NULL,
        "emirates_id_front" text,
        "license_copy" text,
        "notes" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "disabled" boolean DEFAULT false NOT NULL,
        "disabled_by" varchar,
        "disabled_at" timestamp,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "drivers_driver_code_unique" UNIQUE("driver_code")
);
--> statement-breakpoint
CREATE TABLE "insurance_claims" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "contract_id" varchar NOT NULL,
        "claim_number" varchar NOT NULL,
        "claim_date" timestamp NOT NULL,
        "incident_date" timestamp NOT NULL,
        "claim_status" varchar(20) DEFAULT 'pending' NOT NULL,
        "claim_amount" varchar NOT NULL,
        "approved_amount" varchar,
        "settled_amount" varchar,
        "insurance_company" varchar NOT NULL,
        "policy_number" varchar NOT NULL,
        "incident_description" text NOT NULL,
        "damage_assessment" text,
        "claimant_name" varchar NOT NULL,
        "claimant_contact" varchar NOT NULL,
        "handled_by" varchar,
        "notes" text,
        "disabled" boolean DEFAULT false NOT NULL,
        "disabled_by" varchar,
        "disabled_at" timestamp,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "insurance_claims_claim_number_unique" UNIQUE("claim_number")
);
--> statement-breakpoint
CREATE TABLE "payments" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "contract_id" varchar NOT NULL,
        "branch_id" varchar,
        "amount" varchar NOT NULL,
        "payment_method" varchar(50) NOT NULL,
        "currency" varchar(10) DEFAULT '' NOT NULL,
        "cheque_number" varchar,
        "last4_digits" varchar(4),
        "reference_number" varchar,
        "paid_at" timestamp DEFAULT now() NOT NULL,
        "notes" text,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "public_holidays" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name_en" varchar NOT NULL,
        "name_ar" varchar,
        "holiday_date" timestamp NOT NULL,
        "is_recurring" boolean DEFAULT false NOT NULL,
        "recurrence_type" varchar(20),
        "surcharge_rate" varchar,
        "notes" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "push_notification_tokens" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" varchar,
        "customer_id" varchar,
        "token" varchar NOT NULL,
        "platform" varchar(20) NOT NULL,
        "device_id" varchar,
        "is_active" boolean DEFAULT true NOT NULL,
        "last_used_at" timestamp DEFAULT now(),
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "push_notification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "renewal_requests" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "contract_id" varchar NOT NULL,
        "customer_id" varchar NOT NULL,
        "vehicle_id" varchar NOT NULL,
        "requested_start_date" timestamp NOT NULL,
        "requested_end_date" timestamp NOT NULL,
        "requested_by" varchar NOT NULL,
        "status" varchar(20) DEFAULT 'pending' NOT NULL,
        "reviewed_by" varchar,
        "reviewed_at" timestamp,
        "rejection_reason" text,
        "notes" text,
        "disabled" boolean DEFAULT false NOT NULL,
        "disabled_by" varchar,
        "disabled_at" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
        "sid" varchar PRIMARY KEY NOT NULL,
        "sess" jsonb NOT NULL,
        "expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsors" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name_en" varchar NOT NULL,
        "name_ar" varchar,
        "nationality" varchar,
        "passport_id" varchar,
        "license_number" varchar,
        "mobile" varchar,
        "address" text,
        "emirate" "emirate",
        "relation" varchar,
        "notes" text,
        "disabled" boolean DEFAULT false NOT NULL,
        "disabled_by" varchar,
        "disabled_at" timestamp,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "ticket_number" varchar NOT NULL,
        "customer_id" varchar,
        "user_id" varchar,
        "subject" varchar NOT NULL,
        "description" text NOT NULL,
        "category" varchar(30) NOT NULL,
        "priority" varchar(20) DEFAULT 'medium' NOT NULL,
        "status" varchar(20) DEFAULT 'open' NOT NULL,
        "assigned_to" varchar,
        "resolution" text,
        "resolved_at" timestamp,
        "disabled" boolean DEFAULT false NOT NULL,
        "disabled_by" varchar,
        "disabled_at" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "support_tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "system_errors" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "error_type" varchar(100) NOT NULL,
        "error_message" text NOT NULL,
        "error_stack" text,
        "user_id" varchar,
        "endpoint" varchar,
        "method" varchar(10),
        "ip_address" varchar,
        "user_agent" text,
        "additional_data" text,
        "screenshot" text,
        "acknowledged" boolean DEFAULT false NOT NULL,
        "acknowledged_by" varchar,
        "acknowledged_at" timestamp,
        "sent_to_support" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "username" varchar NOT NULL,
        "password_hash" varchar NOT NULL,
        "email" varchar,
        "first_name" varchar,
        "last_name" varchar,
        "profile_image_url" varchar,
        "role" varchar(20) DEFAULT 'staff' NOT NULL,
        "is_immutable" boolean DEFAULT false NOT NULL,
        "disabled" boolean DEFAULT false NOT NULL,
        "disabled_by" varchar,
        "disabled_at" timestamp,
        "can_close_contracts" boolean DEFAULT false NOT NULL,
        "can_view_all_contracts" boolean DEFAULT false NOT NULL,
        "can_access_revenue_trends" boolean DEFAULT false NOT NULL,
        "can_access_fleet_performance" boolean DEFAULT false NOT NULL,
        "can_access_contract_analytics" boolean DEFAULT false NOT NULL,
        "can_access_collection_performance" boolean DEFAULT false NOT NULL,
        "can_access_financial_reports" boolean DEFAULT false NOT NULL,
        "can_access_operational_reports" boolean DEFAULT false NOT NULL,
        "can_access_customer_reports" boolean DEFAULT false NOT NULL,
        "can_access_insurance_reports" boolean DEFAULT false NOT NULL,
        "can_access_audit_reports" boolean DEFAULT false NOT NULL,
        "can_access_user_activity_reports" boolean DEFAULT false NOT NULL,
        "can_access_app_access_report" boolean DEFAULT false NOT NULL,
        "branch_id" varchar,
        "last_password_change" timestamp DEFAULT now(),
        "last_login_at" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "vehicle_inspections" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "contract_id" varchar NOT NULL,
        "vehicle_id" varchar NOT NULL,
        "inspection_type" varchar(20) NOT NULL,
        "inspector_name" varchar NOT NULL,
        "odometer_reading" integer NOT NULL,
        "fuel_level" integer NOT NULL,
        "condition_notes" text,
        "photos" jsonb NOT NULL,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "registration" varchar NOT NULL,
        "vin" varchar,
        "make" varchar NOT NULL,
        "model" varchar NOT NULL,
        "year" varchar NOT NULL,
        "color" varchar NOT NULL,
        "fuel_type" varchar,
        "tank_capacity" integer,
        "odometer" integer,
        "daily_rate" varchar NOT NULL,
        "weekly_rate" varchar,
        "monthly_rate" varchar,
        "status" varchar(20) DEFAULT 'available' NOT NULL,
        "notes" text,
        "tc_number" varchar,
        "place_of_issue" varchar,
        "traffic_code_no" varchar,
        "owner_name" varchar,
        "owner_nationality" varchar,
        "registration_expiry" timestamp,
        "insurance_expiry" timestamp,
        "policy_number" varchar,
        "mortgaged_by" varchar,
        "model_origin" varchar,
        "vehicle_type" varchar,
        "gross_vehicle_weight" varchar,
        "gross_vehicle_weight_type" varchar,
        "engine_no" varchar,
        "chassis_no" varchar,
        "licensing_authority" varchar,
        "emirate" "emirate",
        "branch_id" varchar,
        "disabled" boolean DEFAULT false NOT NULL,
        "disabled_by" varchar,
        "disabled_at" timestamp,
        "created_by" varchar NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "vehicles_registration_unique" UNIQUE("registration")
);
--> statement-breakpoint
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch_transfers" ADD CONSTRAINT "branch_transfers_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch_transfers" ADD CONSTRAINT "branch_transfers_source_branch_id_branches_id_fk" FOREIGN KEY ("source_branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch_transfers" ADD CONSTRAINT "branch_transfers_destination_branch_id_branches_id_fk" FOREIGN KEY ("destination_branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch_transfers" ADD CONSTRAINT "branch_transfers_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch_transfers" ADD CONSTRAINT "branch_transfers_initiated_by_users_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_manager_user_id_users_id_fk" FOREIGN KEY ("manager_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_disabled_by_users_id_fk" FOREIGN KEY ("disabled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_disabled_by_users_id_fk" FOREIGN KEY ("disabled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_edits" ADD CONSTRAINT "contract_edits_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_edits" ADD CONSTRAINT "contract_edits_edited_by_users_id_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_company_sponsor_id_companies_id_fk" FOREIGN KEY ("company_sponsor_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_disabled_by_users_id_fk" FOREIGN KEY ("disabled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "damage_assessments" ADD CONSTRAINT "damage_assessments_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "damage_assessments" ADD CONSTRAINT "damage_assessments_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_approvals" ADD CONSTRAINT "document_approvals_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_approvals" ADD CONSTRAINT "document_approvals_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_approvals" ADD CONSTRAINT "document_approvals_disabled_by_users_id_fk" FOREIGN KEY ("disabled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_assignments" ADD CONSTRAINT "driver_assignments_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_assignments" ADD CONSTRAINT "driver_assignments_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_assignments" ADD CONSTRAINT "driver_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_outsource_companies" ADD CONSTRAINT "driver_outsource_companies_disabled_by_users_id_fk" FOREIGN KEY ("disabled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_outsource_companies" ADD CONSTRAINT "driver_outsource_companies_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_rate_cards" ADD CONSTRAINT "driver_rate_cards_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_rate_cards" ADD CONSTRAINT "driver_rate_cards_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_schedule_blocks" ADD CONSTRAINT "driver_schedule_blocks_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_schedule_blocks" ADD CONSTRAINT "driver_schedule_blocks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_outsource_company_id_driver_outsource_companies_id_fk" FOREIGN KEY ("outsource_company_id") REFERENCES "public"."driver_outsource_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_disabled_by_users_id_fk" FOREIGN KEY ("disabled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_handled_by_users_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_disabled_by_users_id_fk" FOREIGN KEY ("disabled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_holidays" ADD CONSTRAINT "public_holidays_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notification_tokens" ADD CONSTRAINT "push_notification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notification_tokens" ADD CONSTRAINT "push_notification_tokens_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renewal_requests" ADD CONSTRAINT "renewal_requests_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renewal_requests" ADD CONSTRAINT "renewal_requests_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renewal_requests" ADD CONSTRAINT "renewal_requests_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renewal_requests" ADD CONSTRAINT "renewal_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renewal_requests" ADD CONSTRAINT "renewal_requests_disabled_by_users_id_fk" FOREIGN KEY ("disabled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_disabled_by_users_id_fk" FOREIGN KEY ("disabled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_disabled_by_users_id_fk" FOREIGN KEY ("disabled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_errors" ADD CONSTRAINT "system_errors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_errors" ADD CONSTRAINT "system_errors_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_disabled_by_users_id_fk" FOREIGN KEY ("disabled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_access_logs_user_id" ON "access_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_access_logs_outcome" ON "access_logs" USING btree ("outcome");--> statement-breakpoint
CREATE INDEX "idx_access_logs_username_attempted" ON "access_logs" USING btree ("username_attempted");--> statement-breakpoint
CREATE INDEX "idx_access_logs_created_at" ON "access_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_access_logs_ip_address" ON "access_logs" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_contract_id" ON "audit_logs" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_branches_code" ON "branches" USING btree ("branch_code");--> statement-breakpoint
CREATE INDEX "idx_branches_emirate" ON "branches" USING btree ("emirate");--> statement-breakpoint
CREATE INDEX "idx_branches_active" ON "branches" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_branches_disabled" ON "branches" USING btree ("disabled");--> statement-breakpoint
CREATE INDEX "idx_branches_created_at" ON "branches" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_companies_disabled" ON "companies" USING btree ("disabled");--> statement-breakpoint
CREATE INDEX "idx_companies_created_at" ON "companies" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_contract_edits_contract_id" ON "contract_edits" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "idx_contract_edits_edited_by" ON "contract_edits" USING btree ("edited_by");--> statement-breakpoint
CREATE INDEX "idx_contract_edits_edited_at" ON "contract_edits" USING btree ("edited_at");--> statement-breakpoint
CREATE INDEX "idx_contracts_customer_id" ON "contracts" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_contracts_vehicle_id" ON "contracts" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "idx_contracts_branch" ON "contracts" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "idx_contracts_created_by" ON "contracts" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_contracts_status" ON "contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_contracts_disabled" ON "contracts" USING btree ("disabled");--> statement-breakpoint
CREATE INDEX "idx_contracts_created_at" ON "contracts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_contracts_status_disabled" ON "contracts" USING btree ("status","disabled");--> statement-breakpoint
CREATE INDEX "idx_contracts_contract_number" ON "contracts" USING btree ("contract_number");--> statement-breakpoint
CREATE INDEX "idx_customers_branch" ON "customers" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "idx_customers_disabled" ON "customers" USING btree ("disabled");--> statement-breakpoint
CREATE INDEX "idx_customers_created_at" ON "customers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_customers_national_id" ON "customers" USING btree ("national_id");--> statement-breakpoint
CREATE INDEX "idx_customers_phone" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_driver_assignments_contract" ON "driver_assignments" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "idx_driver_assignments_driver" ON "driver_assignments" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "idx_driver_assignments_status" ON "driver_assignments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_driver_assignments_start" ON "driver_assignments" USING btree ("start_date_time");--> statement-breakpoint
CREATE INDEX "idx_driver_assignments_end" ON "driver_assignments" USING btree ("end_date_time");--> statement-breakpoint
CREATE INDEX "idx_outsource_companies_disabled" ON "driver_outsource_companies" USING btree ("disabled");--> statement-breakpoint
CREATE INDEX "idx_outsource_companies_created_at" ON "driver_outsource_companies" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_driver_rates_driver" ON "driver_rate_cards" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "idx_driver_rates_active" ON "driver_rate_cards" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_driver_rates_effective" ON "driver_rate_cards" USING btree ("effective_from");--> statement-breakpoint
CREATE INDEX "idx_schedule_blocks_driver" ON "driver_schedule_blocks" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "idx_schedule_blocks_start" ON "driver_schedule_blocks" USING btree ("start_date_time");--> statement-breakpoint
CREATE INDEX "idx_schedule_blocks_end" ON "driver_schedule_blocks" USING btree ("end_date_time");--> statement-breakpoint
CREATE INDEX "idx_drivers_code" ON "drivers" USING btree ("driver_code");--> statement-breakpoint
CREATE INDEX "idx_drivers_availability" ON "drivers" USING btree ("availability");--> statement-breakpoint
CREATE INDEX "idx_drivers_employment_type" ON "drivers" USING btree ("employment_type");--> statement-breakpoint
CREATE INDEX "idx_drivers_active" ON "drivers" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_drivers_disabled" ON "drivers" USING btree ("disabled");--> statement-breakpoint
CREATE INDEX "idx_drivers_created_at" ON "drivers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_insurance_claims_contract_id" ON "insurance_claims" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "idx_insurance_claims_status" ON "insurance_claims" USING btree ("claim_status");--> statement-breakpoint
CREATE INDEX "idx_insurance_claims_created_at" ON "insurance_claims" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_insurance_claims_disabled" ON "insurance_claims" USING btree ("disabled");--> statement-breakpoint
CREATE INDEX "idx_payments_contract_id" ON "payments" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "idx_payments_branch" ON "payments" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "idx_payments_created_at" ON "payments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_public_holidays_date" ON "public_holidays" USING btree ("holiday_date");--> statement-breakpoint
CREATE INDEX "idx_public_holidays_active" ON "public_holidays" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "idx_sponsors_disabled" ON "sponsors" USING btree ("disabled");--> statement-breakpoint
CREATE INDEX "idx_sponsors_created_at" ON "sponsors" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_system_errors_acknowledged" ON "system_errors" USING btree ("acknowledged");--> statement-breakpoint
CREATE INDEX "idx_system_errors_created_at" ON "system_errors" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_users_username" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "idx_users_branch" ON "users" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "idx_users_disabled" ON "users" USING btree ("disabled");--> statement-breakpoint
CREATE INDEX "idx_users_created_at" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_vehicle_inspections_contract_id" ON "vehicle_inspections" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "idx_vehicle_inspections_vehicle_id" ON "vehicle_inspections" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "idx_vehicles_registration" ON "vehicles" USING btree ("registration");--> statement-breakpoint
CREATE INDEX "idx_vehicles_status" ON "vehicles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_vehicles_branch" ON "vehicles" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "idx_vehicles_disabled" ON "vehicles" USING btree ("disabled");--> statement-breakpoint
CREATE INDEX "idx_vehicles_created_at" ON "vehicles" USING btree ("created_at");