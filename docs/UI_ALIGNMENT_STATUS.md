# UI ALIGNMENT STATUS

**Created:** November 28, 2025  
**Purpose:** Track UI alignment between current implementation and reference designs (ui_design_28_nov_2025)  
**Status Legend:** NOT_STARTED | IN_PROGRESS | ALIGNED | ALIGNED_STYLE_ONLY (no direct template)

---

## SCREEN ↔ DESIGN MAPPING

### Global Components

| Screen ID | Screen Name | Checklist Refs | Design Reference File | Alignment Status | Notes |
|-----------|-------------|----------------|----------------------|------------------|-------|
| GLOBAL-NAV | Top Navigation Bar | §2.16 | global_top_navigation_bar/ | NOT_STARTED | Logo, nav items, branch selector, lang toggle, notifications, user menu |
| GLOBAL-SIDEBAR | Side Navigation | §7.1 | contracts_list_screen_1/ (sidebar pattern) | NOT_STARTED | Collapsible sidebar with icons |

### Dashboard Module

| Screen ID | Screen Name | Checklist Refs | Design Reference File | Alignment Status | Notes |
|-----------|-------------|----------------|----------------------|------------------|-------|
| DASH-ROOT | Dashboard Root | §2.15 | dashboard_root_page/ | NOT_STARTED | Tabs: Branch, Fleet, Finance, HQ, Automation |
| DASH-BRANCH | Branch Dashboard | §2.15.1 | branch_dashboard_overview/ | NOT_STARTED | KPIs, upcoming pickups/returns |
| DASH-HQ | HQ Dashboard | §2.15.2 | hq_dashboard/ | NOT_STARTED | Cross-branch analytics |
| DASH-FLEET | Fleet Dashboard | §2.15.3 | fleet_dashboard/ | NOT_STARTED | Vehicle utilization |
| DASH-FINANCE-1 | Finance Dashboard 1 | §2.15.4 | finance_dashboard_1/ | NOT_STARTED | Revenue metrics |
| DASH-FINANCE-2 | Finance Dashboard 2 | §2.15.4 | finance_dashboard_2/ | NOT_STARTED | Additional finance views |
| DASH-AUTO-1 | Automation Dashboard 1 | §2.17 | automation_&_health_dashboard_1/ | NOT_STARTED | Cron jobs, system health |
| DASH-AUTO-2 | Automation Dashboard 2 | §2.17 | automation_&_health_dashboard_2/ | NOT_STARTED | Additional automation views |

### Contracts Module

| Screen ID | Screen Name | Checklist Refs | Design Reference File | Alignment Status | Notes |
|-----------|-------------|----------------|----------------------|------------------|-------|
| CON-LIST-1 | Contracts List 1 | §2.2, §3.1-3.16 | contracts_list_screen_1/ | NOT_STARTED | Filter panel + table + pagination |
| CON-LIST-2 | Contracts List 2 | §2.2, §3.1-3.16 | contracts_list_screen_2/ | NOT_STARTED | Alternative view |
| CON-DETAIL-1 | Contract Detail 1 | §3.2-3.10 | contract_detail_screen_1/ | NOT_STARTED | Full contract view |
| CON-DETAIL-2 | Contract Detail 2 | §3.2-3.10 | contract_detail_screen_2/ | NOT_STARTED | Additional detail tabs |
| CON-CREATE | Contract Creation | §3.1 | contract_creation/edit_(draft)_screen/ | NOT_STARTED | Draft creation/edit form |
| CON-SETTINGS | Contracts Module Settings | §2.16 | contracts_module_settings/ | NOT_STARTED | Contract-specific settings |

### Contract Modals

| Screen ID | Screen Name | Checklist Refs | Design Reference File | Alignment Status | Notes |
|-----------|-------------|----------------|----------------------|------------------|-------|
| MOD-OTP | OTP Activation | §3.3 | otp_activation_modal/ | NOT_STARTED | Contract activation with OTP |
| MOD-CHECKOUT | Checkout Inspection | §3.4 | checkout_inspection_modal/ | NOT_STARTED | Pre-rental inspection |
| MOD-EXTENSION | Extension | §3.5 | extension_modal/ | NOT_STARTED | Extend rental period |
| MOD-AMENDMENT | Amendment | §3.6 | amendment_modal/ | NOT_STARTED | Contract amendments |
| MOD-EARLY-RETURN | Early Return | §3.7 | early_return_modal/ | NOT_STARTED | Early termination |
| MOD-RETURN | Return Inspection | §3.8 | return_inspection_modal/ | NOT_STARTED | Post-rental inspection |
| MOD-COMPLETION | Completion/Settlement | §3.9-3.10 | contract_completion_&_settlement_modal/ | NOT_STARTED | Final settlement |
| MOD-CLOSURE | Contract Closure | §3.11 | contract_closure_modal/ | NOT_STARTED | Admin closure |
| MOD-CANCEL | Cancellation | §3.12 | cancellation_modal/ | NOT_STARTED | Cancel draft/reservation |
| MOD-SWAP | Vehicle Swap | §3.13 | vehicle_swap_modal/ | NOT_STARTED | Vehicle replacement |
| MOD-DRIVER | Driver Change/Handover | §3.14 | driver_change_/_handover_modal/ | NOT_STARTED | Driver assignment |
| MOD-BLACKLIST | Blacklist Override | §3.35-3.36 | blacklist_override_modal/ | NOT_STARTED | Override blacklist status |
| MOD-AUDIT | Audit Log Viewer | §11.1-11.2 | audit_log_viewer_modal/ | NOT_STARTED | View audit trail |

### Reservations Module

| Screen ID | Screen Name | Checklist Refs | Design Reference File | Alignment Status | Notes |
|-----------|-------------|----------------|----------------------|------------------|-------|
| RES-LIST | Reservations List | §2.4 | reservations_list_screen/ | NOT_STARTED | Reservation management |
| RES-CREATE | Reservation Create | §3.24-3.26 | reservation_detail/create_screen/ | NOT_STARTED | New reservation form |

### Vehicles Module

| Screen ID | Screen Name | Checklist Refs | Design Reference File | Alignment Status | Notes |
|-----------|-------------|----------------|----------------------|------------------|-------|
| VEH-LIST | Vehicles List | §2.10 | vehicles_list_screen/ | NOT_STARTED | Fleet list with filters |
| VEH-DETAIL | Vehicle Detail Tabs | §2.10, §3.18-3.23 | vehicle_detail_tabs/ | NOT_STARTED | Vehicle profile tabs |

### Customers Module

| Screen ID | Screen Name | Checklist Refs | Design Reference File | Alignment Status | Notes |
|-----------|-------------|----------------|----------------------|------------------|-------|
| CUST-LIST | Customer List | §2.14 | customer_list_screen/ | NOT_STARTED | Customer listing |
| CUST-PROFILE | Customer Profile Tabs | §2.14, §4.2.1 | customer_profile_tabs/ | NOT_STARTED | Full customer profile |

### Companies Module

| Screen ID | Screen Name | Checklist Refs | Design Reference File | Alignment Status | Notes |
|-----------|-------------|----------------|----------------------|------------------|-------|
| COMP-LIST | Company List | §2.14.2 | company_list_screen/ | NOT_STARTED | Corporate accounts |
| COMP-PROFILE | Company Profile Tabs | §2.14.2 | company_profile_tabs/ | NOT_STARTED | Company profile |

### Incidents Module

| Screen ID | Screen Name | Checklist Refs | Design Reference File | Alignment Status | Notes |
|-----------|-------------|----------------|----------------------|------------------|-------|
| INC-LIST | Incident List | §2.5 | incident_list_screen/ | NOT_STARTED | Incidents/claims list |
| INC-DETAIL | Incident Detail | §2.5 | incident_detail_screen/ | NOT_STARTED | Full incident view |

### Maintenance Module

| Screen ID | Screen Name | Checklist Refs | Design Reference File | Alignment Status | Notes |
|-----------|-------------|----------------|----------------------|------------------|-------|
| MAINT-LIST | Maintenance Jobs List | §3.19-3.21 | maintenance_jobs_list_screen/ | NOT_STARTED | Maintenance tracking |
| MAINT-CREATE | Maintenance Job Create | §3.19 | maintenance_job_detail/create_screen/ | NOT_STARTED | New job form |

### Payments Module

| Screen ID | Screen Name | Checklist Refs | Design Reference File | Alignment Status | Notes |
|-----------|-------------|----------------|----------------------|------------------|-------|
| PAY-LIST | Payments List | §2.7 | payments_list_screen/ | NOT_STARTED | Payment records |
| PAY-ENTRY-1 | Payment Entry 1 | §3.27-3.31 | payment_entry_modal_1/ | NOT_STARTED | Record payment |
| PAY-ENTRY-2 | Payment Entry 2 | §3.27-3.31 | payment_entry_modal_2/ | NOT_STARTED | Additional entry view |

### Reports Module

| Screen ID | Screen Name | Checklist Refs | Design Reference File | Alignment Status | Notes |
|-----------|-------------|----------------|----------------------|------------------|-------|
| REP-REVENUE | Revenue Report | §12.1 | revenue_report_screen/ | NOT_STARTED | Financial analytics |
| REP-UTIL | Utilization Report | §12.2 | utilization_report_screen/ | NOT_STARTED | Fleet utilization |
| REP-INC-SUM | Incident Summary Report | §12.3 | incident_summary_report_screen/ | NOT_STARTED | Incident analytics |
| REP-AGING | Outstanding/Aging Report | §12.4 | outstanding/aging_report/ | NOT_STARTED | Accounts receivable |
| REP-AUDIT | Custom Audit Exports | §11.1-11.2 | custom_audit_exports_screen/ | NOT_STARTED | Export audit logs |

### Settings Module

| Screen ID | Screen Name | Checklist Refs | Design Reference File | Alignment Status | Notes |
|-----------|-------------|----------------|----------------------|------------------|-------|
| SET-HOME | Settings Home | §2.16 | settings_home_screen/ | NOT_STARTED | Settings navigation hub |
| SET-SYSTEM | System Settings | §15.1 | system_settings_screen/ | NOT_STARTED | Global system config |
| SET-BRANCH | Branch Settings | §2.16.1 | branch_settings_screen/ | NOT_STARTED | Branch configuration |
| SET-TARIFF | Tariffs & Deposits | §4.9 | tariffs_&_deposits_settings/ | NOT_STARTED | Pricing configuration |
| SET-VEHICLE | Vehicle & Maintenance | §4.5 | vehicle_&_maintenance_settings/ | NOT_STARTED | Fleet settings |
| SET-CRON | Cron & Automation | §2.17 | cron_&_automation_settings/ | NOT_STARTED | Scheduled jobs |
| SET-NOTIF | Notification Settings | §8.1-8.2 | notification_settings_screen/ | NOT_STARTED | Notification config |
| SET-PROVIDER | Notification Providers | §8.1 | notification_providers_&_templates/ | NOT_STARTED | SMS/Email providers |
| SET-RISK | Risk & Blacklist | §3.35-3.37 | risk_&_blacklist_settings/ | NOT_STARTED | Risk scoring config |
| SET-RISK-ADMIN | Risk & Blacklist Admin | §11.3 | risk_&_blacklist_administration/ | NOT_STARTED | Blacklist management |
| SET-STAFF | Staff & Roles | §5.1.3 | staff_&_roles_administration/ | NOT_STARTED | User management |
| SET-TEMPLATES | Templates Administration | §9.1 | templates_administration/ | NOT_STARTED | Document templates |

### Import Module

| Screen ID | Screen Name | Checklist Refs | Design Reference File | Alignment Status | Notes |
|-----------|-------------|----------------|----------------------|------------------|-------|
| IMP-ENGINE | Import Engine | §3.38-3.40 | import_engine_screen/ | NOT_STARTED | Data import |
| IMP-MAPPING | Import Mapping Modal | §3.38 | import_mapping_modal/ | NOT_STARTED | Field mapping |

---

## DESIGN SYSTEM PATTERNS (Inferred from Templates)

### Colors
- Primary: #137fec (cyan-blue)
- Background Light: #f6f7f8
- Background Dark: #101922
- Surface Light: #ffffff
- Surface Dark: #1a2530
- Border Light: #e5e7eb
- Border Dark: #3b4754
- Positive: #0bda5b
- Negative: #fa6238

### Typography
- Font: Inter (400, 500, 600, 700, 800, 900 weights)
- Page titles: 4xl font-black
- Section headers: 2xl font-bold
- Table headers: xs uppercase font-medium
- Body text: sm font-normal

### Icons
- Material Symbols Outlined
- Icon sizes: text-lg, text-xl, text-2xl
- Can use filled variant with `font-variation-settings: 'FILL' 1`

### Layout Patterns
- Sidebar: 64px width (w-64), sticky top-0
- Filter panels: Collapsible accordions with checkboxes
- Data tables: Hover states, dividers, rounded corners
- Stats cards: rounded-xl with border
- Page structure: sidebar + main content area

### Component Patterns
- Status badges: px-2.5 py-0.5 rounded-full text-xs font-medium
- Buttons: rounded-lg with primary bg and hover states
- Inputs: rounded-lg with focus states
- Cards: rounded-xl with border

---

## CHANGELOG

| Date | Screen | Change | Status |
|------|--------|--------|--------|
| 2025-11-28 | ALL | Initial mapping created | NOT_STARTED |
| 2025-11-28 | GLOBAL | Added Material Symbols font to index.html | COMPLETED |
| 2025-11-28 | GLOBAL | Created MaterialSymbol component | COMPLETED |
| 2025-11-28 | GLOBAL | Added Material Symbols CSS to index.css | COMPLETED |
| 2025-11-28 | GLOBAL | Created ListPageLayout component | COMPLETED |
| 2025-11-28 | GLOBAL | Created FilterPanel, FilterGroup, FilterSearch components | COMPLETED |
| 2025-11-28 | GLOBAL | Created DataTable, StatusBadge, ActionButton components | COMPLETED |

