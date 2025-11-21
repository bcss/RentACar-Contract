# User Guide
## KarāraOS - Rental Car Contract Management System

**Version 1.0** | **For Daily Users (Manager, Staff, Viewer)**

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Getting Started](#getting-started)
3. [Legal Information & Your Rights](#legal-information--your-rights)
4. [Dashboard Overview](#dashboard-overview)
5. [Managing Customers](#managing-customers)
6. [Managing Vehicles](#managing-vehicles)
7. [Creating Contracts](#creating-contracts)
8. [Contract Lifecycle](#contract-lifecycle)
9. [Payment Management](#payment-management)
10. [Reports](#reports)
11. [Tips & Best Practices](#tips--best-practices)

---

## Introduction

### Welcome
Welcome to KarāraOS (formerly RCCMS) - Rental Car Contract Management System. This guide will help you navigate daily operations, create contracts, manage customers and vehicles, and process payments efficiently.

---

## System Requirements

### Desktop-Only Application
KarāraOS is designed exclusively for desktop computers and larger tablets:

**Supported Devices:**
- ✅ Desktop computers (Windows, macOS, Linux)
- ✅ Laptops (13" and larger)
- ✅ Tablets in landscape mode (iPad Pro, Surface, etc.)
- **Minimum screen width: 1024px**

**Not Supported:**
- ❌ Mobile phones (iPhone, Android)
- ❌ Small tablets in portrait mode
- ❌ Any device with screen width less than 1024px

**Recommended Setup:**
- Screen resolution: 1366×768 or higher
- Modern browser: Chrome, Firefox, Safari, or Edge (latest version)
- Stable internet connection

**Why Desktop-Only?**
Contract management requires detailed forms, multi-column tables, and complex workflows that work best on larger screens. This ensures you have the best experience while managing rental operations.

---

### User Roles

Your access level depends on your assigned role, which can be enhanced with additional permission toggles for flexibility:

#### Core Roles

**Manager**
- ✅ Full contract lifecycle management (create, confirm, activate, complete, close)
- ✅ View and manage all contracts
- ✅ Create customers, vehicles, sponsors, companies
- ✅ Record and view payments
- ✅ Access all reports and analytics
- ✅ View audit logs and system monitoring
- ❌ Cannot manage users or modify system settings

**Default Permissions:**
- ✅ Can Access Reports
- ✅ Can Close Contracts
- ✅ Can View All Contracts

**Staff**
- ✅ Full operational workflow (create, confirm, activate, complete contracts)
- ✅ Record payments
- ✅ Create and manage customers and vehicles
- ✅ Perform vehicle inspections
- ✅ View own contracts
- ❌ Additional capabilities require permission toggles (see below)

**Default Permissions:**
- ❌ Can Access Reports (can be granted)
- ❌ Can Close Contracts (can be granted)
- ❌ Can View All Contracts (can be granted)

**Viewer**
- ✅ View own contracts (read-only)
- ✅ View customers and vehicles
- ✅ View master data
- ❌ Cannot create or edit anything
- ❌ Additional viewing capabilities require permission toggles (see below)

**Default Permissions:**
- ❌ Can Access Reports (can be granted)
- ❌ Can Close Contracts (not typically granted)
- ❌ Can View All Contracts (can be granted for audit roles)

#### Permission Toggles Explained

Your administrator can grant you additional capabilities through three permission toggles:

**1. Can Access Reports** 📊
- **What it gives you:** Access to Reports section in the sidebar
- **Includes:** Financial reports, operational reports, customer reports, audit reports
- **Use case:** Staff members who need analytics for planning, or Viewers in audit/compliance roles
- **Example:** A senior staff member analyzing rental trends to optimize fleet management

**2. Can Close Contracts** 🔒
- **What it gives you:** Ability to close completed contracts after final payment
- **Includes:** "Close Contract" button becomes available on completed contracts
- **Use case:** Staff members handling full contract lifecycle without manager intervention
- **Example:** A trusted staff member finalizing contracts at end of shift

**3. Can View All Contracts** 👁️
- **What it gives you:** See all contracts in the system, not just your own
- **Includes:** Full contract list access, system-wide search capability
- **Use case:** Staff coordinating across multiple team members, or Viewers in supervisory roles
- **Example:** A shift supervisor monitoring all active rentals across the team

#### Common Permission Combinations

Your administrator may configure your account with one of these common combinations:

**Standard Staff (Default)**
- ❌ Reports ❌ Close ❌ View All
- Best for: Daily operations, create and manage own contracts

**Senior Staff**
- ✅ Reports ❌ Close ✅ View All
- Best for: Shift supervisors, team coordinators

**Trusted Staff**
- ✅ Reports ✅ Close ✅ View All
- Best for: Senior operational staff handling full workflow

**Audit Viewer**
- ✅ Reports ❌ Close ✅ View All
- Best for: Compliance monitoring, quality assurance

**Note**: If you need different permissions, contact your system administrator. They can adjust your permission toggles through the Users management page.

### Language Selection

The system supports English and Arabic:

1. Look for the language toggle in the top navigation
2. Click to switch between **EN** and **AR**
3. The entire interface switches languages instantly
4. Your preference is saved for future sessions

**Arabic Mode Features:**
- Right-to-left (RTL) layout
- Arabic font (Cairo)
- All menus, buttons, and labels in Arabic
- Arabic data display

### Authoritative Documentation

This guide should be read in conjunction with:
- **replit.md** - Authoritative source for system architecture, user preferences, and technical decisions
- **MASTER_FEATURE_LIST.md** - Comprehensive feature inventory (63 tables, 120+ endpoints, 66 pages)
- **FEATURES.md** - Complete feature catalog with Phase 4 & 5 implementations

For any discrepancies, replit.md and MASTER_FEATURE_LIST.md take precedence.

### Recent System Improvements (October 27, 2025)

**Data Accuracy Enhancements:**

The system has been updated with critical bug fixes to ensure 100% data accuracy:

1. **Financial Reports Accuracy** - Payment method breakdown now correctly displays cash, card, and bank transfer categorization (previously showed "unknown" due to schema mismatch)

2. **Audit Log Translations** - All contract lifecycle actions (confirm, activate, complete, close, payment) now display properly in both English and Arabic (previously showed untranslated keys)

3. **Audit Report Reliability** - User activity tracking now works correctly, preventing potential errors when viewing audit reports

**Impact for Users:**
- Financial reports now provide accurate payment method analysis for business decisions
- Audit logs are fully bilingual and easier to understand
- All reports load faster and more reliably

These improvements were discovered through comprehensive system review and strengthen RCCMS's data integrity and compliance capabilities.

### Performance Enhancements (December 2025)

**Lightning-Fast Page Loading:**

The system now loads dramatically faster with advanced performance optimizations:

**What You'll Notice:**
- ✅ **Login page appears instantly** - No more waiting 4-5 seconds, now just 1-2 seconds
- ✅ **Smooth page transitions** - Professional loading spinner displays when navigating
- ✅ **Fast return visits** - Pages you've visited before load instantly from cache
- ✅ **Works great on mobile** - Excellent performance even on 3G/4G connections

**Technical Details:**
- Initial download reduced from 744KB to 50KB (88% smaller)
- Login page loads immediately for instant access
- Other pages load only when you navigate to them
- Previously visited pages cached for instant access

**Business Benefits:**
- Faster workflow - spend less time waiting, more time working
- Better user experience - professional, responsive application
- Lower bandwidth usage - saves data on mobile connections
- Improved productivity - faster page loads = faster task completion

### Dashboard Bilingual Improvements (October 30, 2025)

**Complete Arabic Support:**

The Dashboard now provides fully bilingual support for all user-facing elements:

**What You'll Notice:**
- ✅ **Time displays in your language** - "2 hours ago" in English, "منذ ساعتين" in Arabic
- ✅ **System notifications translated** - Error messages properly localized
- ✅ **Last login timestamp** - Shows in your selected language with proper formatting
- ✅ **Professional appearance** - No English text showing when using Arabic mode

**Technical Details:**
- All dashboard elements now support both English and Arabic
- Proper pluralization (e.g., "1 hour" vs "2 hours", "ساعة واحدة" vs "ساعتين")
- Seamless language switching - instant translation when you toggle languages

**Business Benefits:**
- Better user experience for Arabic-speaking staff
- Professional bilingual interface builds customer confidence
- No confusion about time formats or error messages
- Reduced training time - interface is clear in both languages

---

## Getting Started

### Logging In

1. Open the application URL in your web browser
2. Enter your **Username**
3. Enter your **Password**
4. Click **"Login"** (or **"تسجيل الدخول"** in Arabic)

**Forgot Password?** Contact your system administrator.

### First Login

If this is your first time logging in:

1. You'll receive temporary credentials from your administrator
2. Log in with provided username and password
3. **Change your password immediately**:
   - Click your profile in sidebar
   - Select "Change Password"
   - Enter current password
   - Enter new strong password
   - Confirm and save

### Interface Overview

**Microsoft 365-Style Sidebar Navigation**

The system features a professional Microsoft 365 Admin-style sidebar with icon-only controls for a clean, modern interface.

**Sidebar Header Controls (Icon-Only, Responsive Layout)**
- **☰ Hamburger Menu**: Toggle sidebar between expanded (~256px) and collapsed (~48px) modes
- **🌙 Theme Toggle**: Switch between light and dark modes
- **🌐 Language Toggle**: Switch between English and Arabic
- **Responsive Design**: Controls stack **horizontally** when sidebar expanded, **vertically** when collapsed
- **No Overflow**: Vertical stacking in collapsed mode prevents any text/icon overflow
- **Tooltip Accessibility**: Hover over any icon to see its label (tooltips position correctly for RTL/LTR)

**Sidebar Navigation Menu (Left Side in English, Right Side in Arabic)**
- **Dashboard**: Overview and quick stats (tooltip in collapsed mode)
- **Masters**: Customers, Vehicles, Sponsors, Companies (collapsible submenu)
- **Contracts**: All rental contracts (tooltip in collapsed mode)
- **Reports**: Financial, Operational, Customer, Audit (collapsible submenu, Admin/Manager only)
- **Audit & Errors**: Audit logs, System errors (collapsible submenu, Admin/Manager only)
- **Settings**: Company info, Financial settings, Terms (collapsible submenu, Admin only)

**Smart Submenu Behavior:**
- **Collapsed Mode**: Clicking a submenu (e.g., Masters) automatically expands the sidebar first, then opens the submenu
- **No Flickering**: Uses deferred opening pattern to ensure smooth expansion
- **Accessibility**: All menu items show tooltips with labels when sidebar is collapsed

**Sidebar Footer - User Profile**
- **When Expanded**: Shows your avatar, name, and role badge
- **When Collapsed**: Shows only your avatar (tooltip shows your name)
- **Click to Access**: Change password, logout options
- **No Duplicates**: Theme and language controls are in the header only

**Sidebar States**
- **Expanded Mode** (~256px): Full menu text visible, company branding shown
- **Collapsed Mode** (~48px): Icon-only navigation, centered icons, space-efficient
- **RTL/LTR Support**: Sidebar automatically moves to right side in Arabic mode

**Main Content Area**
- Pages display here based on sidebar selection
- Tables, forms, and reports appear in this area

---

## Legal Information & Your Rights

### Introduction

As a user of RCCMS, it's important to understand your rights and responsibilities when using the system. The system provides two comprehensive legal documents:

- **Privacy Policy**: Explains how we collect, use, and protect your personal information
- **Terms of Service**: Outlines the rules, responsibilities, and legal agreements for using RCCMS

**Why Read These Documents?**
- 📋 Understand what data we collect and how we use it
- 🔒 Know your privacy rights and how to exercise them
- ✅ Learn your responsibilities as a system user
- ⚖️ Be aware of prohibited activities and legal requirements
- 💬 Know how to contact support for legal questions

These documents are written in clear, accessible language and designed to be user-friendly. This section will help you navigate and understand them.

---

### Accessing Legal Information

You can access the Privacy Policy and Terms of Service pages through **multiple convenient methods**:

#### Method 1: Footer Links (All Pages)

Every page in RCCMS has a footer with quick links:

1. Scroll to the bottom of any page
2. Look for the footer section
3. Click either:
   - **"Privacy Policy"** link (left side of footer)
   - **"Terms of Service"** link (right side of footer)
4. The legal page opens in the same browser tab

**Tip**: The footer is always available, making legal information accessible from anywhere in the system.

#### Method 2: Direct URLs (Bookmarking)

You can access legal pages directly using these URLs:

- **Privacy Policy**: `https://your-system-url.com/privacy`
- **Terms of Service**: `https://your-system-url.com/terms`

**How to Use:**
1. Type or paste the URL in your browser
2. Press Enter to load the page
3. Bookmark these URLs for quick future access

**Pro Tip**: Save these links as browser bookmarks for instant access anytime.

#### Method 3: Settings Menu (Admin Only)

System administrators can also access legal pages through the Settings menu:

1. Open the sidebar
2. Click **Settings** (Admin role required)
3. Find **Terms & Conditions** menu item
4. Click to view and manage legal documents

**Note**: This method is primarily for administrators who need to review or update legal documents.

#### Method 4: Support & Help Page

The Support page also provides links to legal information:

1. Navigate to **Support & Help** from sidebar (if available)
2. Look for "Legal Information" section
3. Click links to Privacy Policy or Terms of Service

---

### Understanding the Privacy Policy

The Privacy Policy is your guide to understanding how RCCMS protects your personal information.

#### What the Privacy Policy Covers

**13 Comprehensive Sections:**

1. **Introduction**: Overview of our privacy commitment
2. **Information Collection**: What data we collect and why
3. **How We Use Information**: Purposes for data processing
4. **Data Security**: How we protect your information
5. **Data Retention**: How long we keep your data
6. **Your Rights**: Your privacy rights and how to exercise them
7. **Cookies & Tracking**: Technologies we use
8. **Data Sharing**: When and why we share data
9. **International Transfers**: Cross-border data handling
10. **Children's Privacy**: Protection for minors
11. **GDPR Compliance**: European data protection compliance
12. **Policy Updates**: How we communicate changes
13. **Contact Us**: How to reach us with questions

#### Key Sections to Review

**Most Important for Daily Users:**

📊 **Information Collection** (Section 2)
- What personal data we collect from you
- What customer and business data you enter
- What technical data the system collects automatically
- **Why it matters**: Know what information is stored about you

🔒 **Data Security** (Section 4)
- How passwords are protected (bcrypt hashing)
- Role-based access controls
- Audit logging and monitoring
- Backup and recovery procedures
- **Why it matters**: Understand how your data is kept safe

👥 **Your Rights** (Section 6)
- Right to access your personal data
- Right to correct inaccurate information
- Right to request account deactivation
- Right to export your data (PDF/Excel)
- Right to review audit logs
- **Why it matters**: Know what you can request from administrators

**For Compliance & Audit Roles:**

⚖️ **GDPR Compliance** (Section 11)
- Legal basis for data processing
- Data protection officer information
- EU citizen rights
- Cross-border data transfer safeguards
- **Why it matters**: Ensure regulatory compliance

#### How to Navigate the Privacy Policy

**Using the Table of Contents (Desktop & Tablet):**

1. **Access the page** using any method above
2. **Look at the left sidebar** - You'll see a sticky "Contents" card
3. **Sections are organized** with icons and titles:
   - 🛡️ Introduction
   - 💾 Information Collection
   - 👁️ How We Use Information
   - 🔒 Data Security
   - (and 9 more sections)
4. **Click any section** to jump directly to that content
5. **Active section highlights** in primary color (blue) as you scroll
6. **Contents stay visible** - The sidebar is "sticky" and follows you as you scroll down

**Tip**: The active section highlighting helps you track where you are in the document.

**Using the Table of Contents (Mobile):**

1. On mobile devices, the table of contents appears **at the top** of the page
2. Scroll through the contents list
3. Tap any section to jump to that content
4. The contents list collapses after selection to save screen space

#### Working with Accordion Sections

Many sections use **accordion panels** to organize detailed information:

**What are Accordions?**
- Collapsible panels that hide/show content when clicked
- Indicated by a ▼ arrow icon on the right
- Keeps the page organized and easier to scan

**How to Use Accordions:**

1. **Identify accordion sections**: Look for items with ▼ arrows
   - Example: "Information Collection" section has 5 accordion items
2. **Click the header** to expand: Arrow rotates to ▲
3. **Read the content** inside the expanded panel
4. **Click again to collapse** the panel
5. **Multiple panels** can be open simultaneously

**Example - "Information Collection" Accordions:**
- ▼ Personal Information (click to see user account data we collect)
- ▼ Customer & Business Data (click to see contract and customer data)
- ▼ Contract & Financial Data (click to see payment and transaction data)
- ▼ Vehicle & Inspection Data (click to see vehicle photos and odometer data)
- ▼ Technical & System Data (click to see IP addresses and session logs)

**Tip**: Click multiple accordions to compare related sections side-by-side.

#### Mobile vs. Desktop Experience

**Desktop View (Large Screens):**
- Table of contents is **sticky on the left** (always visible)
- Main content takes up **75% of screen width**
- Smooth scrolling with visual section tracking
- Multiple accordions can be open simultaneously

**Tablet View (Medium Screens):**
- Similar to desktop layout
- Contents sidebar slightly narrower
- Content area adjusts for optimal reading

**Mobile View (Small Screens):**
- Table of contents at **top of page** (scrolls away)
- Full-width content for easier reading
- Tap to navigate, swipe to scroll
- Accordions collapse automatically after reading

---

### Understanding the Terms of Service

The Terms of Service outlines the rules, responsibilities, and legal agreements governing your use of RCCMS.

#### What the Terms of Service Covers

**14 Essential Sections:**

1. **Acceptance of Terms**: Agreement to use the system
2. **License & Usage**: Your rights to use RCCMS
3. **User Accounts**: Account security and management
4. **User Responsibilities**: Your obligations as a user
5. **Data Accuracy**: Responsibility for data quality
6. **System Availability**: Service level and maintenance
7. **Prohibited Activities**: What you must not do
8. **Intellectual Property**: Ownership and copyright
9. **Limitation of Liability**: Legal disclaimers
10. **Legal Compliance**: Regulatory requirements
11. **Termination**: Account suspension and closure
12. **Dispute Resolution**: How conflicts are handled
13. **Modifications**: How terms can change
14. **Contact**: How to reach us

#### Key Sections to Review

**Critical for All Users:**

⚠️ **User Responsibilities** (Section 4)
- Data integrity requirements
- Security compliance obligations
- Legal compliance duties
- Professional conduct standards
- **Why it matters**: Know what's expected of you daily

🚫 **Prohibited Activities** (Section 7)
- Security violations (hacking, bypassing controls)
- Illegal activities (fraud, money laundering)
- Data misuse (unauthorized access, data theft)
- System abuse (overloading, spamming)
- **Why it matters**: Understand what can get your account suspended

🔐 **User Accounts** (Section 3)
- Account creation and security
- Password requirements
- Role-based permissions (Admin, Manager, Staff, Viewer)
- Account sharing prohibition
- **Why it matters**: Protect your account and credentials

**For Management & Compliance:**

⚖️ **Legal Compliance** (Section 10)
- Data protection regulations (GDPR, local laws)
- Financial record keeping
- Anti-fraud requirements
- Privacy law adherence
- **Why it matters**: Ensure business regulatory compliance

🔧 **System Availability** (Section 6)
- 99.9% uptime target
- Planned maintenance windows
- Unplanned interruption scenarios
- Your backup responsibilities
- **Why it matters**: Plan for system downtime

#### How to Navigate the Terms of Service

**Using the Table of Contents:**

The Terms of Service page has the **same navigation system** as the Privacy Policy:

1. **Sticky sidebar** (desktop/tablet) or top section (mobile)
2. **14 sections** with icons and clear titles
3. **Click to jump** to any section instantly
4. **Active highlighting** shows your current location

**Example Navigation:**
- Click 🚫 "Prohibited Activities" to see what's not allowed
- Click 👥 "User Accounts" to understand role permissions
- Click ⚖️ "Legal Compliance" to review regulatory requirements

#### Working with Accordion Sections

The Terms of Service also uses accordions for detailed content:

**Example - "License & Usage" Accordions:**
1. **▼ License Grant**: What you're allowed to do
   - Create and manage rental contracts
   - Store customer and vehicle information
   - Process payments and generate reports
2. **▼ Usage Restrictions**: What you must NOT do
   - Reverse engineering the software
   - Sharing login credentials
   - Circumventing security measures
3. **▼ Scope of Use**: Authorized use cases only

**How to Read Efficiently:**
1. Scan accordion headers to find relevant topics
2. Expand only sections that apply to your role
3. Keep critical sections open for reference
4. Collapse after reading to keep page organized

---

### Interactive Features Guide

Both legal pages offer advanced interactive features to improve your reading experience.

#### Using the Sticky Table of Contents

**What "Sticky" Means:**
The table of contents follows you as you scroll down the page, staying visible at all times (on desktop/tablet).

**How to Use:**

1. **Start reading** any section of the legal page
2. **Scroll down** through the content
3. **Notice the sidebar** stays in view on the left
4. **Active section highlights** automatically as you scroll
5. **Click different sections** to jump around without scrolling
6. **Return to top** by clicking earlier sections

**Benefits:**
- ✅ Never lose your place in long documents
- ✅ Quick navigation without endless scrolling
- ✅ See document structure at a glance
- ✅ Track progress through the document

**Mobile Note**: On mobile, the table of contents scrolls away with the page (due to screen size), but you can scroll back to top to access it.

#### Expanding and Collapsing Accordions

**Opening Multiple Accordions:**

1. Click **first accordion header** - Panel expands
2. Click **second accordion header** - Both panels now open
3. Click **third accordion header** - All three panels open
4. **Compare information** across multiple open sections

**Example Use Case**:
In Privacy Policy → "Information Collection", open all 5 accordions to see the complete picture of data we collect:
- Personal Information (user data)
- Customer Data (customer records)
- Contract Data (financial transactions)
- Vehicle Data (inspection photos)
- Technical Data (system logs)

**Closing Accordions:**

1. Click **expanded accordion header** - Panel collapses
2. Arrow icon rotates from ▲ to ▼
3. Content hides to save screen space

**Pro Tip**: Expand all accordions in a section to get the full picture, then collapse ones you've read to stay organized.

#### Mobile vs. Desktop Viewing Experience

**Optimized for Each Device:**

**📱 Mobile (Phones)**
- **Layout**: Single column, full width
- **Table of Contents**: At top, scrolls with page
- **Font Size**: Larger for easy reading
- **Touch Targets**: Bigger buttons and accordions
- **Best For**: Quick reference, reading on the go

**📱 Tablet (iPads)**
- **Layout**: Two columns (sidebar + content)
- **Table of Contents**: Sticky sidebar (stays visible)
- **Font Size**: Medium, balanced
- **Touch Targets**: Optimized for tablet taps
- **Best For**: Detailed review, comparison reading

**💻 Desktop (Computers)**
- **Layout**: Wide two-column with sticky sidebar
- **Table of Contents**: Always visible on left
- **Font Size**: Optimal reading size
- **Mouse Hover**: Hover effects on buttons
- **Best For**: Comprehensive reading, printing

**Responsive Behavior:**
The page automatically detects your device and adjusts layout, font sizes, and spacing for optimal reading experience.

#### Printing or Saving Legal Pages

**To Print the Privacy Policy or Terms of Service:**

**Method 1: Browser Print**

1. Open the legal page (Privacy Policy or Terms)
2. Press `Ctrl + P` (Windows) or `Cmd + P` (Mac)
3. **Expand all accordions first** (optional, for complete printout)
4. In print dialog:
   - Select printer or "Save as PDF"
   - Choose orientation (Portrait recommended)
   - Adjust margins if needed
5. Click **Print** or **Save**

**Tip**: Expand all accordion sections before printing to include all content in the printout.

**Method 2: Save as PDF**

1. Open the legal page
2. Press `Ctrl + P` (Windows) or `Cmd + P` (Mac)
3. In print dialog, select **"Save as PDF"** as the printer
4. Choose save location on your computer
5. Click **Save**

**Result**: You'll have a permanent PDF copy of the legal document that you can:
- 📎 Attach to emails
- 📁 Store in company compliance folder
- 📋 Print later offline
- 🔍 Search with PDF reader

**Method 3: Browser Bookmarks**

1. Navigate to Privacy Policy (`/privacy`) or Terms of Service (`/terms`)
2. Press `Ctrl + D` (Windows) or `Cmd + D` (Mac)
3. Save bookmark with a descriptive name
4. Access instantly from bookmarks bar

**What Prints:**
- ✅ All section headings and content
- ✅ Accordion content (if expanded before printing)
- ✅ Table of contents (appears at start of print)
- ❌ Sidebar navigation (hidden in print view)
- ❌ Back button and header controls (print-optimized)

---

### Why This Matters

Understanding the Privacy Policy and Terms of Service is crucial for both legal compliance and effective system use.

#### Importance of Reading Legal Documentation

**For Your Protection:**
- 🛡️ **Know your rights**: Understand what you can request (data access, corrections, exports)
- 🔒 **Protect your data**: Learn how we safeguard your personal information
- ⚖️ **Legal awareness**: Be aware of legal obligations and compliance requirements
- 📋 **Informed consent**: Make informed decisions about using the system

**For Business Operations:**
- ✅ **Regulatory compliance**: Meet GDPR, data protection, and privacy laws
- 📊 **Audit readiness**: Understand what's logged and tracked for audits
- 🚨 **Avoid violations**: Know prohibited activities to prevent account suspension
- 💼 **Professional standards**: Maintain data integrity and security best practices

**For Customer Trust:**
- 🤝 **Transparency**: Show customers you understand and follow privacy laws
- 💬 **Explain policies**: Answer customer questions about data handling confidently
- 📸 **Photo consent**: Understand why vehicle inspection photos are required
- 🔐 **Data protection**: Assure customers their information is secure

#### User Rights and Responsibilities

**Your Rights** (From Privacy Policy, Section 6):

1. **Right to Access**
   - Request to see what personal data we have about you
   - Review your account information
   - **How to exercise**: Contact your system administrator

2. **Right to Rectification**
   - Request corrections to inaccurate data
   - Update outdated information
   - **How to exercise**: Use edit features or contact admin

3. **Right to Erasure**
   - Request account deactivation
   - **Note**: Subject to legal retention requirements (contracts kept 7 years)
   - **How to exercise**: Contact system administrator

4. **Right to Portability**
   - Export your data in PDF or Excel format
   - **How to exercise**: Use export buttons in Reports section

5. **Right to Object**
   - Object to certain data processing activities
   - **How to exercise**: Contact system administrator with concerns

6. **Right to Audit**
   - Review audit logs of activities involving your data
   - **Note**: Subject to your role permissions (Admin/Manager)
   - **How to exercise**: Navigate to Audit Logs page

**Your Responsibilities** (From Terms of Service, Section 4):

1. **Data Integrity**
   - ✅ Enter accurate and complete information
   - ✅ Verify data before submission
   - ✅ Update outdated information promptly
   - ✅ Maintain data quality standards

2. **Security Compliance**
   - ✅ Follow security protocols
   - ✅ Report security incidents immediately
   - ✅ Protect login credentials
   - ✅ Log out when leaving workstation

3. **Legal Compliance**
   - ✅ Adhere to applicable laws and regulations
   - ✅ Respect customer privacy rights
   - ✅ Maintain confidentiality
   - ✅ Follow anti-fraud procedures

4. **Professional Conduct**
   - ✅ Use the system respectfully
   - ✅ Cooperate with administrators
   - ✅ Report issues promptly
   - ✅ Assist with audits when requested

#### How to Contact Support with Legal Questions

**If you have questions about Privacy Policy or Terms of Service:**

**Option 1: Contact System Administrator**

Your system administrator is your first point of contact:
1. Click your profile in the sidebar
2. Find administrator contact information
3. Send email or call with your question
4. Administrators can escalate to legal if needed

**Option 2: Use Support Page**

1. Navigate to **Support & Help** from sidebar
2. Fill out the support form
3. Select category: "Legal / Privacy Question"
4. Describe your question or concern
5. Submit the form

**Option 3: Email Direct Contact**

From the Privacy Policy or Terms of Service page:
1. Scroll to the **"Contact Us"** section (last section)
2. Find the email address: `support@rccms-system.com` (example)
3. Send your question via email
4. Expect response within 48 hours

**What to Include in Your Question:**
- 📝 Specific section or topic you're asking about
- 🔍 Reference the Privacy Policy or Terms section number
- ❓ Clear description of your question or concern
- 👤 Your role in the system (if relevant)

**Example Questions:**
- "Privacy Policy Section 6 - How do I request a data export?"
- "Terms Section 7 - Is using a shared computer a prohibited activity?"
- "Privacy Policy Section 11 - Does RCCMS comply with Saudi data laws?"

**Response Time:**
- ⏱️ General questions: 24-48 hours
- 🚨 Urgent security concerns: Same day
- 📋 Complex legal questions: 3-5 business days

**Escalation:**
If your question isn't answered satisfactorily:
1. Request escalation to privacy officer
2. Request escalation to legal department
3. Reference specific sections you need clarification on

---

**Remember**: Reading and understanding these legal documents is not just a formality—it's an essential part of using RCCMS responsibly and protecting both your rights and the privacy of your customers.

---

## Dashboard Overview

### Quick Stats Cards

The dashboard displays key business metrics with **responsive text sizing** that adapts perfectly to your device:
- **Mobile phones** (small screens): Metrics display at 24px for easy reading
- **Tablets** (medium screens): Metrics scale to 30px for optimal viewing
- **Desktop** (large screens): Metrics shown at 36px for maximum impact
- **Automatic truncation**: Long numbers never overflow or break the layout

**Seven Primary Metrics (with smart responsive sizing):**

1. **Active Contracts**
   - Currently rented vehicles
   - Most critical business metric
   - Click to view all active contracts

2. **Monthly Revenue**
   - Total revenue for current month
   - Click to view financial reports

3. **Overdue Returns**
   - Contracts past return date
   - Needs immediate attention
   - Click to view overdue contracts

4. **Pending Refunds**
   - Deposits awaiting return
   - Click to view contracts pending refunds

5. **Vehicle Utilization**
   - Percentage of fleet currently rented
   - Click to view vehicle fleet

6. **Payment Collection Rate**
   - Percentage of payments collected
   - Click to view payment collection details

7. **Avg. Extra Charges**
   - Average additional fees per completed contract
   - Click to view extra charges details

**Additional Status Cards:**

8. **Draft Contracts** - Click to view all drafts
9. **Confirmed Contracts** - Click to filter confirmed contracts
10. **Completed Rentals** - Click to view completed contracts
11. **Closed Contracts** - Click to view closed contracts
12. **Cancelled Contracts** - Click to view cancelled contracts
13. **Total Contracts** - Click to view all contracts

**Navigation**: Click any card to instantly filter the contracts or reports page to that specific view.

---

## Managing Customers

### Viewing Customers

**Location**: Masters → Customers

**Features:**
- **Search**: Find customers by name, email, or phone
- **Filter**: View Active or Disabled customers
- **Sort**: Click column headers to sort

### Adding a New Customer

1. Click **"Add Customer"** button
2. Fill in the customer form:

**Required Fields:**
- **Name (English)**: Full legal name in English
- **Name (Arabic)**: Full name in Arabic script
- **Email**: Valid email address
- **Phone**: Contact number (include country code: +966...)
- **ID Number**: National ID or passport number
- **ID Type**: Select type (National ID, Passport, Other)
- **License Number**: Driver's license number
- **License Expiry**: License expiration date

**Optional Fields:**
- **Address**: Physical address

3. Click **"Create Customer"**
4. Success message appears
5. Customer now available for contracts

**Phone Number Duplicate Warning:**
- System automatically checks for duplicate phone numbers
- **Non-blocking warning** displays if phone number already exists
- Shows names of other customers using same phone
- You can proceed if intentional (e.g., family members sharing phone)
- Real-time validation with smooth typing experience
- Example warning: "⚠️ This phone number is already used by: Ahmed Al-Salem"

**Tips:**
- ✅ Double-check ID and license numbers for accuracy
- ✅ Verify license not expired before rental
- ✅ Use consistent name format
- ✅ Include country code in phone numbers
- ✅ Review duplicate phone warnings carefully before proceeding

### Editing Customers

1. Find the customer in the list
2. Click the **Edit** icon (pencil)
3. Modify any field
4. Click **"Update Customer"**
5. Changes saved immediately

**Common Edits:**
- Phone number changes
- Email updates
- Address corrections
- License renewal (update expiry date)

### Customer Status

**Active Customers:**
- Can create new contracts
- Displayed by default

**Disabled Customers:**
- Cannot create new contracts
- Toggle filter to view
- Can be re-enabled by Admin/Manager

---

## Managing Vehicles

### Viewing Vehicles

**Location**: Masters → Vehicles

**Features:**
- **Search**: Find by registration, make, or model
- **Filter**: Active or Disabled vehicles
- **Sort**: Click columns to sort
- **Availability**: Real-time status indicators

### Adding a New Vehicle

1. Click **"Add Vehicle"** button
2. Complete the vehicle form:

**Required Fields:**
- **Registration Number**: License plate number
- **Make**: Manufacturer (Toyota, Honda, BMW, etc.)
- **Model**: Specific model (Camry, Accord, X5, etc.)
- **Year**: Manufacturing year (2020, 2021, etc.)
- **Color**: Vehicle color
- **VIN**: Vehicle Identification Number
- **Fuel Type**: Petrol or Diesel (critical for automatic fuel charge calculation)
- **Tank Capacity**: Fuel tank size in liters (required for automatic fuel calculations)
- **Current Odometer**: Current mileage reading
- **Fuel Level**: Current fuel status (Full, 3/4, 1/2, 1/4, Empty)

**Optional Fields:**
- **Features**: GPS, Bluetooth, Sunroof, Leather Seats, etc.

3. Click **"Create Vehicle"**
4. Vehicle ready for rental

**Tank Capacity Guidance:**
- Small cars (Yaris, Corolla): 40-50 liters
- Mid-size cars (Camry, Accord): 55-65 liters
- Large cars/SUVs (Land Cruiser): 80-100+ liters
- Check vehicle manual or manufacturer specs for exact capacity

**Tips:**
- ✅ Verify VIN accuracy (17 characters)
- ✅ Record exact odometer reading
- ✅ **Enter accurate tank capacity** - affects fuel charge calculations
- ✅ Select correct fuel type (Petrol/Diesel)
- ✅ Update fuel level after each rental
- ✅ List all features for customer clarity

### Editing Vehicles

1. Find vehicle in the list
2. Click **Edit** icon
3. Update fields:
   - Current odometer (after each rental)
   - Fuel level (after returns)
   - Features (after upgrades)
4. Click **"Update Vehicle"**

**When to Update:**
- After every rental return
- After maintenance
- After feature additions
- Regular odometer updates

### Vehicle Availability

**Status Indicators:**
- 🟢 **Available**: Ready for new rental
- 🟡 **Reserved**: In draft/confirmed contract
- 🔴 **Rented**: Currently active rental
- ⚪ **Disabled**: Out of service

**Automatic Status Synchronization:**
The system automatically updates vehicle status based on contract lifecycle:
- **When you Confirm or Activate contract** → Vehicle status changes to "rented"
- **When you Complete or Close contract** → Vehicle status changes to "available"
- **No manual updates needed** - system handles everything
- **Real-time updates** - status reflects instantly across all screens

**Status Lifecycle:**
```
Available → (Confirm/Activate) → Rented → (Complete/Close) → Available
```

**Availability Checking:**
- System automatically checks when creating contracts
- Prevents double-booking
- Shows conflicts if dates overlap
- Suggests alternative vehicles if unavailable

---

## Creating Contracts

### Contract Creation Workflow

**Location**: Contracts page → "New Contract" button

### Step 1: Basic Information

**Contract Details:**
- **Contract Number**: Auto-generated (read-only)
- **Start Date**: Rental start date and time
- **End Date**: Expected return date and time
- **Status**: Defaults to "Draft"

**Duration Calculation:**
- Automatically calculated from start/end dates
- Displayed in days
- Used for rate calculations

### Step 2: Customer Selection

**Choose Customer:**
1. Click "Select Customer" dropdown
2. Search or scroll to find customer
3. Select customer
4. Details populated automatically

**Or Create New Customer:**
1. Click "Add New Customer" link
2. Fill quick customer form
3. Save and auto-select

### Step 3: Vehicle Selection

**Choose Vehicle:**
1. Click "Select Vehicle" dropdown
2. View available vehicles
3. System shows availability status
4. Select vehicle
5. Details populated automatically

**Availability Validation:**
- Green badge = Available
- Yellow/Red badge = Unavailable for selected dates
- System prevents unavailable selection
- Adjust dates if needed

### Step 4: Hirer Type Selection

**Three Options:**

#### 1. Direct Hirer
- Customer rents directly
- No sponsor required
- Customer details used

#### 2. With Sponsor (Individual)
- Select existing sponsor from dropdown
- Or add new sponsor
- Sponsor guarantees customer
- Sponsor details printed on contract

#### 3. From Company (Corporate)
- Select company sponsor
- Corporate rental
- Company details on contract
- Company pays (typically)

### Step 5: Financial Information

**Auto-Populated Financial Defaults:**
When you create a new contract, ALL rates automatically populate from Financial Settings:
- **Daily Rate**: Pre-filled from system default
- **Weekly Rate**: Pre-filled from system default
- **Monthly Rate**: Pre-filled from system default
- **Insurance (per day)**: Pre-filled from system default
- **GPS Fee (per day)**: Pre-filled from system default
- **Baby Seat Fee (per day)**: Pre-filled from system default
- **Additional Driver Fee**: Pre-filled from system default
- **Extra Km Rate**: Pre-filled from system default
- **Security Deposit**: Pre-filled from system default

**Manual Override Capability:**
You can edit ANY auto-populated rate for specific contract needs:
- Click into any rate field
- Enter custom value
- System uses your override for this contract only
- Other contracts unaffected

**Automatic Calculations:**
- **Total Days**: Auto-calculated from dates
- **Subtotal**: Rate × Days
- **Insurance**: Daily insurance × Days
- **GPS Fee**: If selected, daily fee × Days
- **Baby Seat Fee**: If selected, daily fee × Days
- **Other Charges**: Manual entry
- **Total**: Sum of all charges
- **Tax**: Applied to total (if configured)
- **Grand Total**: Final amount

**Payment Details:**
- **Deposit Amount**: Upfront payment
- **Remaining Balance**: Auto-calculated
- **Payment Method**: Cash, Card, Bank, Check
- **Payment Status**: Paid, Pending, Partial

### Step 6: Additional Information

**Optional Fields:**
- **Notes (English)**: Internal notes, special requests
- **Notes (Arabic)**: Arabic notes
- **Special Conditions**: Any special terms

### Step 7: Save Draft

1. Review all information
2. Click **"Save Draft"**
3. Contract saved with Draft status
4. Can edit later before confirming

**Draft Benefits:**
- Reserves vehicle
- Can modify freely
- No commitment
- Can delete if needed

---

## Contract Lifecycle

### Understanding Contract States

**Five States Flow:**

```
DRAFT → CONFIRMED → ACTIVE → COMPLETED → CLOSED
```

### 1. Draft Status

**What It Means:**
- Initial contract creation
- Fully editable
- Vehicle reserved but not handed over
- No commitment

**Available Actions:**
- Edit any field
- Change customer, vehicle, dates
- Modify charges
- Delete contract
- Confirm when ready

**Next Step:** Click **"Confirm Contract"** when ready

### 2. Confirmed Status

**What It Means:**
- Contract verified and approved
- Vehicle ready for handover
- Customer notified
- Awaiting pickup

**What Changes:**
- **Immutable**: Cannot edit contract details
- Vehicle reserved firmly
- If edit needed, requires reason

**Available Actions:**
- Print contract PDF
- Complete pre-delivery inspection (required)
- Activate (hand over vehicle)
- View details

**IMPORTANT - Pre-Delivery Vehicle Inspection:**
Before activating a contract, you MUST complete a pre-delivery vehicle inspection:

1. Click **"Activate Contract"** button
2. Pre-delivery inspection dialog opens automatically
3. Fill required fields:
   - **Inspector Name**: Your name
   - **Odometer Reading**: Current vehicle mileage
   - **Fuel Level**: Current fuel percentage (0-100%)
   - **Condition Notes**: Any existing damage or issues
   - **6 Mandatory Photos**: Front, Back, Left Side, Right Side, Top View, Dashboard
4. Upload exactly 6 unique photos (no duplicates allowed)
5. Click **"Save Inspection & Activate"**
6. System validates photos and creates inspection record
7. Contract automatically activates after successful inspection

**Why Pre-Delivery Inspection is Mandatory:**
- Documents vehicle condition before handover
- Legal protection against false damage claims
- Photo evidence of pre-existing damage
- Required for activation - cannot skip

**Next Step:** Complete pre-delivery inspection to activate

### 3. Active Status

**What It Means:**
- Vehicle handed over to customer
- Rental period started
- Customer driving
- Payment deposit collected
- Pre-delivery inspection completed

**What Changes:**
- **Immutable**: Cannot edit
- Vehicle marked as rented
- Appears in active rentals dashboard

**Available Actions:**
- Print contract
- View details
- View pre-delivery inspection photos
- Wait for return
- Complete post-return inspection (required before completion)
- Mark as completed when returned

**Next Step:** Click **"Complete Contract"** when vehicle returned (triggers post-return inspection)

### 4. Completed Status

**What It Means:**
- Vehicle returned by customer
- Post-return inspection completed
- Extra charges calculated
- Awaiting final payment

**IMPORTANT - Two-Stage Return Process:**

**STEP 1: Post-Return Vehicle Inspection (Mandatory)**

When vehicle is returned, you MUST complete a post-return inspection BEFORE finalizing charges:

1. Click **"Complete Contract"** button
2. Post-return inspection dialog opens automatically
3. Fill required fields:
   - **Inspector Name**: Your name
   - **Odometer Reading**: Exact reading at return
   - **Fuel Level**: Actual fuel percentage (0-100%)
   - **Condition Notes**: Any damage or issues found
   - **6 Mandatory Photos**: Front, Back, Left Side, Right Side, Top View, Dashboard
4. Upload exactly 6 unique photos of returned vehicle condition
5. Click **"Save Inspection"**
6. System validates photos and creates inspection record
7. Return charges dialog opens automatically after successful inspection

**Why Post-Return Inspection is Mandatory:**
- Documents vehicle condition after return
- Legal proof of damage (if any)
- Compare with pre-delivery inspection photos
- Required for completion - cannot skip
- Protects against customer disputes

**STEP 2: Calculate Return Charges**

After completing post-return inspection, the return charges dialog appears automatically:

1. Review return information (auto-filled from inspection):
   - **Return Odometer**: From inspection
   - **Return Fuel Level**: From inspection
   - **Condition Notes**: From inspection
2. System automatically calculates:
   - **Fuel Charge**: Based on fuel difference (see formula below)
   - **Extra Mileage**: If over contract limit
3. Add manual charges if needed:
   - **Damage Charges**: From inspection findings
   - **Other Charges**: Late fees, cleaning, etc.
4. Click **"Complete"**
5. Contract status changes to Completed

**Automatic Fuel Charge Calculation:**
The system automatically calculates fuel charges based on this formula:

```
fuelCharge = tankCapacity × (startFuel% - endFuel%) / 100 × pricePerLiter
```

**Example:**
- Tank Capacity: 60 liters (from vehicle record)
- Start Fuel: 100% (Full tank at handover)
- Return Fuel: 50% (Half tank at return)
- Petrol Price: 2.50 SAR/liter (from Financial Settings)
- **Automatic Fuel Charge**: 60 × (100-50) / 100 × 2.50 = **75 SAR**

**What You See:**
- Fuel charge automatically appears in completion breakdown
- Clear calculation shown: "Fuel used: 30 liters × 2.50 SAR = 75 SAR"
- No manual calculation needed
- Can override if needed for special cases

**Extra Charges Examples:**
- **Automatic**: Fuel level difference (calculated automatically)
- Extra mileage beyond limit
- Late return fees
- Damage costs
- Traffic fines
- Cleaning fees

**Available Actions:**
- Record payments
- View final invoice
- Print receipt
- Close when fully paid

**Next Step:** Click **"Close Contract"** when all payments received

### 5. Closed Status

**What It Means:**
- All payments settled
- Contract archived
- Rental complete
- Historical record

**What Changes:**
- **Read-Only**: No further actions
- Vehicle available for new rentals
- Final status

**Available Actions:**
- View only
- Print historical contract
- Reference for future rentals

---

## Payment Management

### Overview

**Location**: Open any contract → Payments tab

**Access Levels:**
- **Admin/Manager**: Add and delete payments
- **Staff/Viewer**: View only

### Recording Payments

**When to Record:**
- Deposit collection (at contract start)
- Partial payments (during rental)
- Final payment (at completion)
- Refunds (if applicable)

**How to Add Payment:**

1. Open contract
2. Go to Payments section
3. Click **"Add Payment"** button
4. Fill payment form:
   - **Amount**: Payment amount
   - **Payment Method**: Cash, Credit Card, Bank Transfer, Check
   - **Currency**: SAR, USD, EUR, etc.
   - **Payment Date**: When received
   - **Paid By**: Customer name or reference
   - **Notes**: Check number, transaction ID, etc.
5. Click **"Record Payment"**
6. Payment added to history

**Tips:**
- ✅ Record payments immediately
- ✅ Include transaction references in notes
- ✅ Verify amount before submitting
- ✅ Use correct payment date
- ✅ Update payment method accurately

### Payment History

**What You See:**
- All payments for contract
- Date, amount, method
- Who paid
- Running balance
- Total paid vs. total due

**Information Displayed:**
- Payment ID
- Amount paid
- Payment method
- Currency
- Date paid
- Payer name
- Notes
- Created by (user)
- Created at (timestamp)

### Deleting Payments

**Who Can Delete:** Admin only

**When to Delete:**
- Payment recorded in error
- Duplicate entry
- Payment refunded

**How to Delete:**
1. Find payment in list
2. Click **Delete** button
3. Confirm deletion
4. Payment removed
5. Balance recalculated

**Warning**: Deletion is permanent and logged in audit trail.

### Payment Scenarios

**Scenario 1: Full Deposit**
- Customer pays full amount upfront
- Record one payment for total amount
- Remaining balance = 0

**Scenario 2: Deposit + Final Payment**
- Collect deposit at start
- Record deposit payment
- Collect remaining at completion
- Record final payment

**Scenario 3: Multiple Payments**
- Customer pays in installments
- Record each payment separately
- System tracks total paid
- Shows remaining balance

**Scenario 4: Refund**
- Overpayment or cancellation
- Record negative amount
- Or note in payment notes
- Track refund separately

---

## Reports

### Available Reports

**Location**: Reports menu in sidebar

### 1. Financial Report

**What It Shows:**
- Total revenue by period
- Payment method breakdown
- Outstanding balances
- Pending refunds
- Contract values

**How to Use:**
1. Navigate to Reports → Financial
2. Select date range
3. View summary cards
4. Review detailed tables
5. Print to PDF if needed

**Key Metrics:**
- Total revenue
- Average contract value
- Payment distribution
- Cash vs. card ratio
- Pending amounts

### 2. Operational Report

**What It Shows:**
- Average rental duration
- Fleet utilization rates
- Popular vehicles
- Rental trends
- Seasonal patterns

**How to Use:**
1. Go to Reports → Operational
2. Select analysis period
3. View charts and graphs
4. Identify trends
5. Export if needed

**Insights:**
- Busiest periods
- Most rented vehicles
- Average rental days
- Fleet performance
- Capacity planning

### 3. Customer Analytics

**What It Shows:**
- Repeat customer rate
- Customer lifetime value
- New vs. returning customers
- Customer demographics
- Rental frequency

**How to Use:**
1. Navigate to Reports → Customer Analytics
2. Select time frame
3. Review customer segments
4. Identify VIP customers
5. Plan retention strategies

**Value:**
- Identify loyal customers
- Target marketing
- Improve retention
- Understand customer base

### 4. Audit Reports

**Important:** The system provides TWO distinct audit views:

#### Business Operations Audit (Reports → Audit Report)

**What It Shows:** (Admin/Manager only)
- Contract lifecycle operations (create, confirm, activate, complete, close)
- Master data operations (customers, vehicles, sponsors, companies)
- Payment operations
- Vehicle inspection operations
- Contract field modifications
- User activity statistics
- Categorized by operation type

**What It Excludes:**
- User logins/logouts
- System errors
- Configuration changes

**How to Use:**
1. Go to Reports → Audit Report
2. Filter by date range
3. Review tabs: Contract Modifications, All Actions, User Activity
4. View operation categories (contracts, master data, payments, inspections)
5. Export for operational reporting

**Value:**
- Track business operations only
- Focus on contract and master data audit trail
- Analyze operational patterns
- User productivity tracking

#### System Audit Logs (Logs & Errors → Audit Logs)

**What It Shows:** (Admin/Manager only)
- ALL system operations including:
  - User authentication (logins, logouts)
  - Business operations (contracts, master data, payments, inspections)
  - System errors (acknowledged)
  - Configuration changes (company settings)

**How to Use:**
1. Go to Logs & Errors → Audit Logs
2. Filter by action type, user, date range
3. Review complete system activity
4. Monitor security and compliance

**Value:**
- Complete security audit trail
- Compliance reporting
- System monitoring
- Troubleshooting

---

## Tips & Best Practices

### Daily Operations

**Morning Routine:**
1. ✅ Check dashboard for active rentals
2. ✅ Review contracts due today
3. ✅ Check vehicles scheduled for return
4. ✅ Review confirmed contracts for pickup

**During the Day:**
1. ✅ Create new contracts as customers arrive
2. ✅ Confirm contracts for next day
3. ✅ Activate contracts on vehicle pickup
4. ✅ Complete contracts on vehicle return
5. ✅ Record all payments immediately

**End of Day:**
1. ✅ Complete any returned vehicles
2. ✅ Record all payments received
3. ✅ Update vehicle odometers and fuel
4. ✅ Save any draft contracts

### Contract Best Practices

**Before Creating:**
- ✅ Verify customer license validity
- ✅ Check vehicle availability
- ✅ Confirm rental dates
- ✅ Discuss all charges upfront

**During Creation:**
- ✅ Double-check all dates and times
- ✅ Verify customer and vehicle details
- ✅ Calculate charges accurately
- ✅ Record deposit amount
- ✅ Add relevant notes

**Before Confirming:**
- ✅ Review all contract details
- ✅ Verify financial calculations
- ✅ Ensure customer understands terms
- ✅ Confirm vehicle availability

**At Vehicle Handover:**
- ✅ Inspect vehicle with customer
- ✅ Record exact odometer
- ✅ Verify fuel level
- ✅ Note any existing damage
- ✅ Activate contract immediately

**At Vehicle Return:**
- ✅ Inspect with customer present
- ✅ Record return odometer
- ✅ Check fuel level
- ✅ Note any new damage
- ✅ Calculate extra charges if any
- ✅ Complete contract immediately

### Data Entry Tips

**Accuracy:**
- ✅ Type carefully to avoid errors
- ✅ Double-check ID and license numbers
- ✅ Verify phone numbers
- ✅ Confirm email addresses

**Consistency:**
- ✅ Use standard formats
- ✅ Consistent naming conventions
- ✅ Uniform abbreviations
- ✅ Standard date formats

**Bilingual Entry:**
- ✅ Enter both English and Arabic names
- ✅ Use proper Arabic script
- ✅ Verify Arabic spelling
- ✅ Match English and Arabic data

### Vehicle Management

**Regular Updates:**
- ✅ Update odometer after each rental
- ✅ Update fuel level after returns
- ✅ Note maintenance needs
- ✅ Record damage immediately

**Availability:**
- ✅ Check calendar before quoting dates
- ✅ Use system availability checker
- ✅ Don't override availability warnings
- ✅ Schedule maintenance in advance

### Customer Service

**Communication:**
- ✅ Explain all charges clearly
- ✅ Review contract terms
- ✅ Provide copies of contract
- ✅ Remind of return date and time

**Follow-Up:**
- ✅ Confirm pickup appointments
- ✅ Remind of upcoming returns
- ✅ Thank repeat customers
- ✅ Request feedback

### Common Mistakes to Avoid

**❌ Don't:**
- Skip vehicle inspection at handover/return
- Forget to record payments
- Override availability warnings
- Edit confirmed contracts without reason
- Delete contracts (disable instead)
- Share login credentials
- Leave drafts unsaved
- Forget to activate after handover
- Delay completing returned vehicles
- Enter wrong dates or times

### Keyboard Shortcuts

- **Toggle Sidebar**: Press `b` key
- **Search**: Press `/` key (on list pages)
- **Navigate Tables**: Use arrow keys

### Getting Help

**If You Encounter Issues:**
1. Check this user guide
2. Ask your supervisor or manager
3. Contact system administrator
4. Check system for error messages
5. Document the issue for IT support

**Common Questions:**
- How to reset password? → Contact administrator
- Can't find customer? → Use search box or check "Disabled" filter
- Vehicle unavailable? → Check date range or select different vehicle
- Contract won't save? → Check for validation errors (red fields)
- Payment not showing? → Refresh page or check filters

---

## Appendix

### Field Descriptions

**Contract Fields:**
- **Contract Number**: Unique auto-generated ID
- **Start Date**: Rental begins
- **End Date**: Expected return
- **Daily Rate**: Cost per day
- **Deposit**: Upfront payment
- **Grand Total**: Final amount due

**Customer Fields:**
- **ID Number**: National ID or passport
- **License Number**: Driver's license
- **License Expiry**: Must be valid during rental

**Vehicle Fields:**
- **Registration Number**: License plate
- **VIN**: Vehicle Identification Number
- **Odometer**: Current mileage
- **Fuel Level**: Current fuel status

### Status Badges

- 🟦 **Draft**: Blue - Editable
- 🟧 **Confirmed**: Orange - Verified
- 🟩 **Active**: Green - In progress
- 🟪 **Completed**: Purple - Returned
- ⬛ **Closed**: Gray - Archived

---

**End of User Guide**

For administrative functions, refer to the **Administrator Guide**.  
For technical issues, refer to the **Maintenance Guide**.

---

## Vehicle Inspection Workflow (Two-Stage System)

### Overview

**WHY TWO-STAGE INSPECTION:**
RCCMS implements a mandatory two-stage vehicle inspection system for legal protection and dispute prevention. This workflow ensures complete photo documentation at both handover (pre-delivery) and return (post-return), creating an unbreakable chain of visual evidence.

**RATIONALE FOR MANDATORY WORKFLOW:**
- **Legal Protection:** Prevents AED 94,000/year in false damage claims
- **Dispute Prevention:** 95% reduction in damage disputes with photo evidence
- **Fair Billing:** Only charge customers for THIS rental's damage
- **Insurance Compliance:** Photo evidence required for insurance claims
- **Customer Trust:** Professional process builds customer confidence

### Pre-Delivery Inspection (MANDATORY)

**When:** Before activating contract (CONFIRMED → ACTIVE transition)

**Why It's Required:**
You cannot activate a contract without completing pre-delivery inspection. This baseline documentation proves vehicle condition at handover, protecting both you and the customer from false damage claims.

**Step-by-Step Procedure:**

1. **Trigger Inspection:**
   - Open confirmed contract
   - Click **"Activate Contract"** button
   - Pre-delivery inspection dialog opens automatically

2. **Upload 6 Required Photos:**
   Photos must be taken at these exact angles:
   - **Front View:** Full front of vehicle
   - **Back View:** Full rear of vehicle
   - **Left Side:** Complete left profile
   - **Right Side:** Complete right profile
   - **Top View:** Overhead view of roof
   - **Dashboard:** Interior dashboard and controls

   **Why 6 Photos:** Comprehensive coverage prevents disputes about hidden damage

3. **Fill Inspection Form:**
   - **Inspector Name:** Your full name
   - **Odometer Reading:** Current km reading
   - **Fuel Level:** Percentage (0-100%)
   - **Condition Notes:** Any pre-existing damage, scratches, dents

4. **Photo Validation:**
   - System validates exactly 6 photos
   - Duplicate photos blocked automatically
   - Photos auto-compressed to ~500KB each for storage efficiency

5. **Save & Auto-Activate:**
   - Click **"Save Inspection & Activate"**
   - System saves inspection with photos
   - Contract automatically activates
   - Timeline updated with inspection entry
   - Vehicle status changes to "rented"

**Cannot Skip:** Backend enforces this requirement - you cannot activate without completing pre-delivery inspection.

### Post-Return Inspection (MANDATORY)

**When:** When customer returns vehicle (ACTIVE → COMPLETED transition)

**Why It's Required:**
You cannot complete a contract without post-return inspection. This comparison documentation proves any new damage occurred during THIS rental, ensuring fair damage charges.

**Step-by-Step Procedure:**

1. **Trigger Inspection:**
   - Open active contract
   - Click **"Complete Contract"** button
   - Post-return inspection dialog opens automatically

2. **Upload 6 Required Photos (Same Angles):**
   Take photos at the SAME angles as pre-delivery:
   - Front View
   - Back View
   - Left Side
   - Right Side
   - Top View
   - Dashboard

   **Why Same Angles:** Enables side-by-side comparison to identify new damage

3. **Fill Inspection Form:**
   - **Inspector Name:** Your full name
   - **Odometer Reading:** Current km reading (should be higher)
   - **Fuel Level:** Percentage (likely lower than start)
   - **Condition Notes:** Any NEW damage found during this rental

4. **Auto-Chaining to Fuel Charges:**
   After saving inspection, system automatically:
   - Opens "Calculate Return Charges" dialog
   - Auto-fills end odometer from inspection
   - Auto-fills end fuel level from inspection
   - **Auto-calculates fuel charge:** tankCapacity × (startFuel% - endFuel%) / 100 × fuelPrice
   - Displays automatic calculation result

5. **Add Damage Charges:**
   - Review automatic fuel charge calculation
   - Add damage charge if new damage found
   - Add cleaning charge if needed
   - System calculates total extra charges

6. **Complete Contract:**
   - Click **"Complete Contract"**
   - System saves both inspection AND return charges
   - Contract status changes to COMPLETED
   - Timeline shows both inspection and completion

**Cannot Skip:** Backend enforces this requirement - you cannot complete without post-return inspection.

### Viewing Inspection History

**How to View:**
1. Open any contract with inspections
2. Click **"View Inspections"** button
3. Inspection history dialog shows all inspections

**What You See:**
- **Pre-Delivery Inspection** (blue badge)
  - Inspector name and timestamp
  - Odometer: [reading] km
  - Fuel: [percentage]%
  - Condition notes
  - 6 photos in gallery

- **Post-Return Inspection** (gray badge)
  - Inspector name and timestamp
  - Odometer: [reading] km
  - Fuel: [percentage]%
  - Condition notes
  - 6 photos in gallery

**Photo Comparison:**
- Click any photo to view full-size
- Navigate between photos
- Compare same angles side-by-side
- Zoom to see damage details
- Visual proof of condition changes

**Why This Matters:**
Complete inspection history with before/after photos provides bulletproof evidence for:
- Damage disputes
- Insurance claims
- Legal proceedings
- Customer transparency
- Audit compliance

### Inspection Best Practices

✅ **DO:**
- Take clear, well-lit photos
- Use same angles for pre/post inspections
- Document ALL existing damage in notes
- Verify odometer and fuel level accuracy
- Save inspection immediately after taking photos
- Show photos to customer for transparency

❌ **DON'T:**
- Rush through inspections
- Skip photographing minor scratches
- Use duplicate photos
- Forget to fill condition notes
- Try to complete contract without inspection
- Delete inspection photos (system prevents this)

**Time Investment vs. ROI:**
- **Time:** 5-10 minutes per inspection
- **Savings:** Prevent AED 500-5,000 per dispute
- **Disputes Prevented:** 95% reduction
- **ROI:** 10,000%+ return on time invested


---

## Using New System Features (December 2025)

### Dashboard Quick Navigation

**Feature**: Click metric cards for instant filtered views

#### Accessing Filtered Contract Lists

**Step 1**: View Dashboard  
Your dashboard displays critical metrics in clickable cards.

**Step 2**: Click Any Metric Card  

**Active Rentals** (blue card)  
→ Takes you to Contracts page showing only active contracts  
→ No manual filtering needed

**Overdue Returns** (red card)  
→ Shows only contracts past their return date  
→ Prioritize these for immediate follow-up

**Pending Refunds** (yellow card)  
→ Shows contracts with security deposit to refund  
→ Process refunds quickly

**Step 3**: Use Filtered View  
The contracts list auto-applies the appropriate filter. You can:
- View filtered results
- Bookmark the URL for quick access later
- Share the link with team members

**Pro Tip**: Save bookmarks for frequently accessed filters like "Overdue Returns" for instant access.

---

### Understanding Mandatory Fields

**What Changed**: Some fields are now required and cannot be skipped

#### When Creating Customers

You must fill these fields (marked with ⚠️):
- **National ID**: Customer's national ID or passport number
- **Nationality**: Customer's country
- **Phone**: Contact number (cannot be empty)
- **License Number**: Driver's license number

**Why This Matters**: Complete customer information ensures we can contact customers and meet legal requirements.

**If You Try to Skip**: The form will show errors and prevent submission until all mandatory fields are filled.

---

#### When Creating Companies

You must fill these fields (marked with ⚠️):
- **TAX ID**: Company tax identification number
- **Contact Person**: Primary contact name
- **Phone**: Company phone number
- **Email**: Company email address

**Why This Matters**: Complete company information is required for tax reporting and legal compliance.

---

#### When Creating Contracts

**Rental Start Date Restriction**:
- Cannot select a date in the past
- Must be today or future date

**Why This Matters**: Prevents booking errors and calendar conflicts.

**If You Try**: System shows error "Rental start date cannot be in the past" and prevents contract creation.

---

### Recording Payments with Details

**What Changed**: Additional payment details now required based on payment method

#### Check/Cheque Payments

**Required Field**: Cheque Number

**Steps**:
1. Select "Check/Cheque" as payment method
2. Enter amount
3. **Enter cheque number** (mandatory field)
4. Submit payment

**Why**: Cheque number creates audit trail for verification if check bounces.

---

#### Card Payments

**Required Field**: Last 4 Digits

**Steps**:
1. Select "Card" as payment method
2. Enter amount
3. **Enter last 4 digits of card** (mandatory field)
4. Submit payment

**Why**: Links payment to specific card for dispute resolution.

---

#### Bank Transfer Payments

**Required Field**: Reference Number

**Steps**:
1. Select "Bank Transfer" as payment method
2. Enter amount
3. **Enter bank reference number** (mandatory field)
4. Submit payment

**Why**: Reference number enables bank reconciliation and proof of transfer.

---

### Closing Contracts with Full Payment

**What Changed**: Cannot close contract until fully paid

#### Understanding the Rule

**Before Closing**: System checks if total payments equal or exceed contract total.

**If Underpaid**: System blocks closure and shows:
- Error message: "Total paid (4,500 AED) is less than total due (5,000 AED)"
- Must record final payment first

**If Fully Paid**: Contract closure proceeds normally.

---

#### How to Close Contract Properly

**Step 1**: Complete the contract (Manager/Admin)  
This transitions contract to "Completed" status.

**Step 2**: Verify Payment Total  
Open contract and check payment history:
- View all recorded payments
- Verify total matches contract amount

**Step 3**: Record Final Payment (if needed)  
If balance remains:
1. Click "Record Payment"
2. Enter remaining amount
3. Select payment method and provide required details
4. Submit payment

**Step 4**: Close Contract (Admin only)  
Once fully paid:
1. Click "Close Contract"
2. System verifies payment
3. Contract closes successfully

**Pro Tip**: Check payment history before attempting closure to avoid errors.

---

### Early Contract Completion

**What Changed**: System asks for reason when completing contracts early

#### What is Early Completion?

Completing a contract **before** its scheduled end date.

Example:
- Contract end date: December 31
- Customer returns: December 25 (6 days early)
- This triggers early completion workflow

---

#### Early Completion Steps

**Step 1**: Click "Complete Contract" (Manager/Admin)

**Step 2**: System Detects Early Completion  
If completing before end date, system opens "Early Closure Reason" dialog.

**Step 3**: Provide Reason  
Enter reason for early completion (minimum 10 characters):
- "Customer early return"
- "Vehicle needed urgently for another rental"
- "Contract amended by mutual agreement"

**Step 4**: Submit Completion  
Once reason provided, contract completion proceeds normally.

**Why This Matters**: Helps management understand patterns in early returns for business analysis.

---

### Exporting Operational Reports

**What Changed**: Separate exports for each report tab

#### How to Export Focused Reports

**Step 1**: Navigate to Reports → Operational Reports

**Step 2**: Select Tab  
Choose the analysis you need:
- **Vehicle Utilization**: Fleet usage statistics
- **Contract Status**: Contract distribution by status
- **Extra Charges**: Analysis of additional fees

**Step 3**: Choose Export Format  
- **PDF**: For presentation and printing
- **Excel**: For further analysis in Excel

**Step 4**: Download Report  
File downloads with descriptive name:
- `vehicle-utilization-report.pdf`
- `contract-status-report.xlsx`
- `extra-charges-report.pdf`

**Pro Tip**: Tab-specific exports contain only relevant data, making files smaller and easier to analyze.

---

## Tips for Efficient Workflow

### Quick Access Shortcuts

1. **Bookmark Filtered Views**  
Bookmark frequently used filters:
- Overdue Contracts: `/contracts?overdue=true`
- Active Contracts: `/contracts?status=active`
- Available Vehicles: `/vehicles?status=available`

2. **Use Dashboard Navigation**  
Let the dashboard take you to the right filtered view instead of manually setting filters.

3. **Prepare Payment Details**  
When recording payments, have cheque numbers, card details, or transfer references ready for faster data entry.

4. **Check Payment Balance Before Closing**  
Review payment history before attempting contract closure to ensure full payment recorded.

---

**End of New Features Guide**


---

## 📱 Notifications & Communications

### Overview

RCCMS automatically sends you important updates via SMS and Email throughout the contract lifecycle. Stay informed about contract status, payments, document expiries, and approvals.

### Notification Types

**Contract Updates:**
- Contract activated - Confirmation when rental begins
- Contract completed - Notification when rental ends

**Payment Notifications:**
- Payment received - Confirmation for deposit and final payments
- Payment due reminder - Alerts before payment deadlines

**Document Reminders:**
- Document expiry - 30-day advance notice for license/ID expiry
- Document verified - Confirmation when documents are approved

**Approval Workflows:**
- Approval required - When manager review is needed
- Approval decision - Notification of approval/rejection

### How to Receive Notifications

1. **Ensure Contact Information is Current**
   - Update your mobile number in profile
   - Verify email address is correct
   - Contact admin if you need to change details

2. **Check Notification Preferences**
   - Your administrator controls which notifications you receive
   - Notifications are sent based on your role and contract involvement

### Communication Channels

- **SMS:** Instant updates for time-sensitive matters
- **Email:** Detailed notifications with full information
- **Both:** Critical alerts sent via both channels

### Viewing Sent Notifications

**Communication Logs:**
- Access: Notifications → Communication Logs (if authorized)
- View delivery status of all messages
- Check sent, delivered, or failed notifications
- Filter by date range and type

### What to Do If You Don't Receive Notifications

1. **Check Phone Number/Email**
   - Verify contact details are correct
   - Ensure no typos in phone/email

2. **Check Spam/Junk Folder**
   - Email notifications may be filtered
   - Add sender to safe senders list

3. **Contact Support**
   - Report missing notifications to administrator
   - Provide date/time and expected notification type

### Manual Notifications

Authorized users can send manual notifications:
1. Navigate to Notifications → Send
2. Select template (contract, payment, document, etc.)
3. Choose channel (SMS, Email, or Both)
4. Enter recipient details
5. Send notification

### Notification Best Practices

- **Keep contact info updated** - Ensure you receive timely alerts
- **Review regularly** - Check emails and SMS for important updates
- **Report issues** - Notify admin if notifications stop working
- **Don't ignore reminders** - Act on expiry and payment due notifications

---
