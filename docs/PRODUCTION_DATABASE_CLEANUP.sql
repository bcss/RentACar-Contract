-- ================================================================
-- PRODUCTION DATABASE ATOMIC CLEANUP SCRIPT
-- KarāraOS - Clean Database (Preserve Only Superadmin)
-- ================================================================
-- WARNING: This will DELETE ALL DATA except the superadmin user!
-- Run this script against your PRODUCTION database manually.
-- ================================================================

-- PHASE 1: Communications & Logs
DELETE FROM sent_notifications;
DELETE FROM notification_logs;
DELETE FROM notification_queue;
DELETE FROM push_tokens;
DELETE FROM support_ticket_messages;
DELETE FROM support_tickets;

-- PHASE 2: Contract Related Data
DELETE FROM contract_charges;
DELETE FROM contract_edits;
DELETE FROM deposit_transactions;
DELETE FROM receipts;
DELETE FROM invoices;
DELETE FROM contract_photos;
DELETE FROM contract_inspections;
DELETE FROM contract_accessories;
DELETE FROM contract_addons;
DELETE FROM additional_drivers;

-- PHASE 3: Driver & Assignment Data
DELETE FROM driver_assignments;
DELETE FROM driver_schedule_entries;
DELETE FROM driver_unavailability;

-- PHASE 4: Vehicle Related Data
DELETE FROM vehicle_photos;
DELETE FROM vehicle_damages;
DELETE FROM vehicle_inspections;
DELETE FROM vehicle_transfers;
DELETE FROM vehicle_availability_cache;
DELETE FROM toll_transactions;
DELETE FROM traffic_fines;
DELETE FROM maintenance_records;

-- PHASE 5: Insurance & Incidents
DELETE FROM insurance_claim_photos;
DELETE FROM insurance_claims;
DELETE FROM incident_photos;
DELETE FROM incidents;

-- PHASE 6: Documents & Registry
DELETE FROM document_registry;
DELETE FROM document_versions;
DELETE FROM document_approvals;

-- PHASE 7: Contracts
DELETE FROM contracts;

-- PHASE 8: Reservations & Customers
DELETE FROM reservation_addons;
DELETE FROM reservations;
DELETE FROM customer_documents;
DELETE FROM blacklist_entries;
DELETE FROM customers;
DELETE FROM sponsors;

-- PHASE 9: Vehicles & Drivers (clear before branch references)
DELETE FROM vehicles;
DELETE FROM drivers;

-- Clear user branch references (BEFORE deleting branches)
UPDATE users SET branch_id = NULL WHERE username != 'superadmin';

-- Delete non-superadmin users
DELETE FROM users WHERE username != 'superadmin';

-- PHASE 10: Companies & Branches
DELETE FROM company_signatories;
DELETE FROM company_contacts;
DELETE FROM branches;
DELETE FROM companies;

-- Driver companies
DELETE FROM driver_rate_plans;
DELETE FROM driver_outsource_companies;

-- PHASE 11: Master/Lookup Data
DELETE FROM package_addons;
DELETE FROM packages;
DELETE FROM addons;
DELETE FROM vehicle_groups;
DELETE FROM vehicle_classes;
DELETE FROM seasonal_tariffs;
DELETE FROM tariff_rate_cards;
DELETE FROM tariffs;
DELETE FROM rental_rate_plans;

-- PHASE 12: Configuration & Settings
DELETE FROM toll_systems;
DELETE FROM notification_routes;
DELETE FROM notification_purposes;
DELETE FROM notification_templates;
DELETE FROM cron_job_executions;
DELETE FROM cron_job_definitions;
DELETE FROM sequences;
DELETE FROM maintenance_jobs;

-- PHASE 13: Remaining Data
DELETE FROM ab_test_variants;
DELETE FROM templates;
DELETE FROM public_holidays;
DELETE FROM import_jobs;
DELETE FROM backups;
DELETE FROM role_assignments;
DELETE FROM roles;
DELETE FROM summaries_daily_branch;
DELETE FROM summaries_daily_vehicle;
DELETE FROM communication_providers;
DELETE FROM company_settings;
DELETE FROM contract_counter;
DELETE FROM system_settings;

-- PHASE 14: Test Documentation (optional, if exists)
DELETE FROM test_entries;
DELETE FROM test_sessions;

-- PHASE 15: Audit Logs (optional - keep if you want history)
DELETE FROM audit_logs;

-- ================================================================
-- VERIFICATION: Check remaining data
-- ================================================================
SELECT 'Remaining Users:' as check_type, COUNT(*) as count FROM users;
SELECT 'Remaining Contracts:' as count FROM contracts;
SELECT 'Remaining Vehicles:' as count FROM vehicles;
SELECT 'Remaining Customers:' as count FROM customers;

-- ================================================================
-- EXPECTED RESULT: Only 1 user (superadmin) should remain
-- All other tables should have 0 rows
-- ================================================================
