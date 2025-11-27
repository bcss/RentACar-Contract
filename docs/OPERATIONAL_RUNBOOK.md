# KarāraOS Permission Toggle Management - Operational Runbook

**Version:** 1.0  
**Last Updated:** November 3, 2025  
**Target Audience:** System Administrators  
**Status:** Production-Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Reference](#quick-reference)
3. [Permission Toggle Management](#permission-toggle-management)
4. [Common Scenarios](#common-scenarios)
5. [Security Best Practices](#security-best-practices)
6. [Troubleshooting](#troubleshooting)
7. [Audit & Compliance](#audit--compliance)
8. [Emergency Procedures](#emergency-procedures)

---

## Overview

### What Are Permission Toggles?

Permission toggles are granular access controls that allow administrators to grant additional capabilities to users beyond their base role permissions. KarāraOS implements three toggles:

- **canAccessReports**: Access to reports and analytics
- **canCloseContracts**: Ability to close completed contracts
- **canViewAllContracts**: View all system contracts (not just own)

### Design Philosophy

**Balance of Simplicity and Flexibility:**
- 4 core roles provide clear organizational structure
- 3 targeted toggles enable granular permission elevation
- Avoids role explosion while maintaining flexibility

### Who Can Manage Toggles?

**Only Admin users** can grant or revoke permission toggles. Managers and other roles cannot modify permissions.

---

## Quick Reference

### Default Toggle States by Role

| Role     | canAccessReports | canCloseContracts | canViewAllContracts |
|----------|------------------|-------------------|---------------------|
| Admin    | ✅ true          | ✅ true           | ✅ true             |
| Manager  | ✅ true          | ✅ true           | ✅ true             |
| Staff    | ❌ false         | ❌ false          | ❌ false            |
| Viewer   | ❌ false         | ❌ false          | ❌ false            |

### Common Permission Combinations

| User Type               | Reports | Close | ViewAll | Use Case                          |
|-------------------------|---------|-------|---------|-----------------------------------|
| Standard Staff          | ❌      | ❌    | ❌      | Daily operations, own contracts   |
| Senior Staff            | ❌      | ✅    | ❌      | Can finalize deals                |
| Analytics Staff         | ✅      | ❌    | ✅      | Business intelligence role        |
| Full-Access Staff       | ✅      | ✅    | ✅      | Near-manager capabilities         |
| Audit Viewer            | ✅      | ❌    | ✅      | Compliance monitoring             |
| Limited Viewer          | ❌      | ❌    | ❌      | Department-specific read-only     |

---

## Permission Toggle Management

### Step-by-Step: Granting Permission Toggles

**Prerequisites:**
- You must be logged in as an Admin user
- The target user must exist and be enabled

**Process:**

1. **Navigate to User Management**
   - Click **Settings** in the sidebar
   - Select **User Management** tab
   - Locate the user in the active users table

2. **Edit User Permissions**
   - Click the **Edit** (pencil) icon next to the user
   - Scroll to the **Permission Toggles** section

3. **Configure Toggles**
   - Check/uncheck the desired permission toggles:
     - **Access Reports**: Grant access to analytics and reporting
     - **Close Contracts**: Allow closing completed contracts
     - **View All Contracts**: Enable system-wide contract visibility
   
4. **Save Changes**
   - Click **Save Changes** button
   - Wait for success confirmation toast

5. **Verify**
   - User must log out and log back in for changes to take effect
   - Check audit logs for permission change record

### Step-by-Step: Revoking Permission Toggles

**Same process as granting - simply uncheck the toggles you want to revoke.**

**Important:**
- Revoking toggles takes effect immediately on next user action
- Users may need to refresh their browser
- Active sessions are not automatically terminated

### Bulk Operations (Not Currently Supported)

**Current Limitation:**
- Permission toggles must be managed one user at a time
- No bulk toggle assignment available

**Workaround:**
- For similar users, create a reference user configuration
- Document standard permission sets for each role type
- Apply manually following your documented standards

**Future Enhancement:**
- Bulk permission management planned for System Administrator Suite
- User groups/templates for permission assignment

---

## Common Scenarios

### Scenario 1: Promoting Staff to Senior Role

**Situation:** Staff member demonstrates competence and needs to finalize contracts.

**Solution:**
```
Role: Staff
canAccessReports: ❌ false (unless needed)
canCloseContracts: ✅ true (new capability)
canViewAllContracts: ❌ false (unless needed)
```

**Business Impact:**
- Staff can now complete full contract lifecycle
- Still cannot access reports (maintains separation of duties)
- Maintains own-contract visibility (data isolation)

### Scenario 2: Creating Analytics Staff Member

**Situation:** Need dedicated staff for business intelligence and reporting.

**Solution:**
```
Role: Staff
canAccessReports: ✅ true (analytics access)
canCloseContracts: ❌ false (reports only)
canViewAllContracts: ✅ true (full data visibility)
```

**Business Impact:**
- Can generate and analyze all reports
- Can view all contracts for comprehensive analysis
- Cannot modify contracts (read-only analytics)

### Scenario 3: Compliance/Audit Viewer

**Situation:** Compliance officer needs to monitor all activities but not modify data.

**Solution:**
```
Role: Viewer
canAccessReports: ✅ true (audit reports)
canCloseContracts: ❌ false (read-only)
canViewAllContracts: ✅ true (full visibility)
```

**Business Impact:**
- Complete read-only access to all data
- Can generate compliance reports
- Cannot perform any modifications

### Scenario 4: Department-Specific Staff

**Situation:** Staff member only works with specific customer segment.

**Solution:**
```
Role: Staff
canAccessReports: ❌ false
canCloseContracts: ❌ false
canViewAllContracts: ❌ false (only see own contracts)
```

**Business Impact:**
- Natural data isolation through contract ownership
- Cannot see contracts created by other staff
- Maintains department boundaries

### Scenario 5: Temporary Permission Elevation

**Situation:** Manager on vacation, senior staff needs temporary full access.

**Process:**
1. Grant all three toggles to staff member
2. Document temporary elevation in change log
3. Set calendar reminder for permission revocation
4. Revoke toggles when manager returns

**Best Practice:**
- Document reason and duration in internal notes
- Set up accountability tracking
- Review audit logs during elevation period

### Scenario 6: Demoting User Access

**Situation:** User performance issues or role change requires reduced access.

**Process:**
1. Review current user permissions
2. Determine appropriate new permission level
3. Revoke unnecessary toggles
4. Notify user of access changes
5. Monitor for access attempts to restricted features

**Important Considerations:**
- Cannot demote Admin to another role (immutable admins)
- Check for dependent workflows before revoking
- Inform affected users before access changes

---

## Security Best Practices

### Principle of Least Privilege

**Core Rule:** Grant only the minimum permissions required for job function.

**Implementation:**
- Start with base role permissions
- Add toggles only when justified by business need
- Review permissions quarterly
- Revoke toggles when no longer needed

### Separation of Duties

**Critical Separations:**

1. **Financial Controls:**
   - Staff who record payments ≠ Staff who close contracts
   - Consider: Base Staff for payments, toggle `canCloseContracts` for supervisors only

2. **Data Visibility:**
   - Staff handling sensitive customers ≠ Staff with `canViewAllContracts`
   - Limit cross-department visibility unless required

3. **Analytics Access:**
   - Operational staff ≠ Reporting staff
   - Grant `canAccessReports` to designated analytics users only

### Regular Audit Reviews

**Monthly:**
- Review active users and their permission toggles
- Verify toggles align with current job responsibilities
- Check for dormant accounts with elevated permissions

**Quarterly:**
- Full permission audit across all users
- Update permission standards documentation
- Remove inactive users

**Annually:**
- Comprehensive access control review
- Update role definitions if needed
- Revise permission policies

### Permission Change Documentation

**Required Documentation for Toggle Changes:**

```
Change Record Template:
- User: [Username/Full Name]
- Date: [YYYY-MM-DD]
- Changed By: [Admin Username]
- Permission Changed: [Toggle name]
- Old Value: [true/false]
- New Value: [true/false]
- Reason: [Business justification]
- Duration: [Permanent / Until YYYY-MM-DD]
- Approved By: [Manager/Department Head]
```

**Storage:**
- Maintain in internal change management system
- Supplement to automated audit logs
- Reference during compliance audits

### Access Anomaly Detection

**Monitor for:**

1. **Unusual Permission Patterns:**
   - Staff with all three toggles enabled (near-Manager access)
   - Viewers with `canCloseContracts` (nonsensical combination)
   - Multiple recent permission elevations

2. **Suspicious Timing:**
   - Permission granted right before contract closure
   - Toggle enabled/disabled on same day
   - After-hours permission changes

3. **Frequency Patterns:**
   - Same user repeatedly elevated/demoted
   - Bulk permission changes without documentation
   - Permission changes by inactive admins

**Response:**
- Investigate anomalies within 24 hours
- Document findings
- Revoke suspicious permissions pending review

---

## Troubleshooting

### Issue: User Claims They Can't Access Feature

**Diagnostic Steps:**

1. **Verify User Login:**
   - Confirm user is logged in with correct account
   - Check session hasn't expired

2. **Check Permission Toggles:**
   - Navigate to User Management
   - View user's current toggle states
   - Compare with required permissions for feature

3. **Verify Role:**
   - Confirm user's base role
   - Check if feature requires specific role (not just toggle)

4. **Browser Cache:**
   - Instruct user to log out completely
   - Clear browser cache
   - Log back in
   - Test feature access again

5. **Check Audit Logs:**
   - Search for permission changes on user account
   - Verify when toggles were last modified
   - Check for any account disable/enable events

**Common Resolutions:**
- ✅ Grant missing permission toggle
- ✅ User logout/login to refresh session
- ✅ Clear browser cache
- ✅ Check for typo in username (wrong account)

### Issue: Permission Changes Not Taking Effect

**Diagnostic Steps:**

1. **Session Persistence:**
   - User sessions cache permission state
   - Changes require new login to take effect

2. **Verify Save Succeeded:**
   - Check for error toast messages
   - Reload user in edit form to verify toggle state
   - Check audit logs for change record

3. **Database Verification:**
   - Admin can check database directly (if access available)
   - Query: `SELECT canAccessReports, canCloseContracts, canViewAllContracts FROM users WHERE username = '[username]'`

4. **Frontend Cache:**
   - Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
   - Clear application cache
   - Try incognito/private window

**Resolution:**
- ✅ Force user logout/login
- ✅ Verify toggle saved correctly
- ✅ Check for frontend caching issues
- ✅ Escalate if persistent after all steps

### Issue: Audit Logs Don't Show Permission Change

**Diagnostic Steps:**

1. **Verify Change Was Saved:**
   - Check if toggle state actually changed
   - Audit logs only record actual changes

2. **Search Criteria:**
   - Expand date range
   - Search by admin username (who made change)
   - Filter by action type: "edit"

3. **System Health:**
   - Check for system errors during timeframe
   - Verify audit logging is functioning

**Understanding Audit Behavior:**
- Audit logs only record fields that **actually changed**
- If toggle was already in desired state, no log entry created
- Audit logs show: "Updated user [username]: canAccessReports to true"

**Resolution:**
- ✅ Verify toggle state actually changed
- ✅ Search with broader criteria
- ✅ Check System Errors page for logging issues

### Issue: Cannot Edit Certain Users

**Diagnostic Steps:**

1. **Immutable User Check:**
   - Some users (super admin) are immutable
   - System prevents editing immutable users

2. **Permission Verification:**
   - Only Admins can edit users
   - Verify you're logged in as Admin

3. **User Status:**
   - Disabled users may have restricted edit capabilities
   - Enable user first, then edit

**Resolution:**
- ✅ Cannot edit immutable users (by design)
- ✅ Verify admin privileges
- ✅ Enable user if disabled

### Issue: Toggle Appears Enabled But Feature Blocked

**Diagnostic Steps:**

1. **Multi-Factor Requirements:**
   - Some features require role AND toggle
   - Example: Close contract requires Editor role (Admin/Manager/Staff) AND canCloseContracts
   - Viewers cannot close contracts even with toggle

2. **Frontend vs Backend:**
   - Frontend may hide UI elements
   - Backend still enforces all permissions
   - Check browser console for authorization errors

3. **Middleware Check:**
   - Some endpoints require multiple permissions
   - Verify user meets ALL requirements

**Resolution:**
- ✅ Verify role supports feature
- ✅ Check for multi-permission requirements
- ✅ Review ROLE_PERMISSIONS.md for feature matrix

---

## Audit & Compliance

### Audit Log Review

**Accessing Permission Change Logs:**

1. Navigate to **Settings → Audit Logs**
2. Filter by:
   - **Action:** "edit"
   - **Description:** Contains "canAccessReports" or "canCloseContracts" or "canViewAllContracts"
3. Review change history

**Audit Log Entry Format:**
```
Action: edit
User: [Admin who made change]
Description: Updated user [target_username]: canAccessReports to true
Timestamp: [Date and time]
IP Address: [Admin's IP]
```

### Compliance Reporting

**Monthly Permission Report Template:**

```markdown
## Monthly Permission Toggle Report
**Period:** [Month YYYY]
**Prepared By:** [Admin Name]
**Date:** [Report Date]

### Summary Statistics
- Total Users: [count]
- Users with canAccessReports: [count] ([percentage]%)
- Users with canCloseContracts: [count] ([percentage]%)
- Users with canViewAllContracts: [count] ([percentage]%)

### Permission Changes This Month
| Date       | User      | Toggle            | Old   | New   | Changed By | Reason        |
|------------|-----------|-------------------|-------|-------|------------|---------------|
| 2025-11-01 | jsmith    | canAccessReports  | false | true  | admin1     | Analytics role|
| ...        | ...       | ...               | ...   | ...   | ...        | ...           |

### Users with Elevated Permissions
| User      | Role   | Reports | Close | ViewAll | Justification           |
|-----------|--------|---------|-------|---------|-------------------------|
| agarcia   | Staff  | ✅      | ✅    | ❌      | Senior staff - approved |
| ...       | ...    | ...     | ...   | ...     | ...                     |

### Recommendations
- [Any concerns or suggestions]
- [Users for review]
- [Policy updates needed]
```

### Regulatory Compliance

**ISO 27001 / SOC 2 Alignment:**

1. **Access Control (A.9):**
   - Permission toggles document who has access to what
   - Audit logs prove access control changes are tracked
   - Regular reviews demonstrate ongoing compliance

2. **Segregation of Duties:**
   - Toggle system enables fine-grained separation
   - Document role segregation in security policies
   - Reference ROLE_PERMISSIONS.md in compliance documentation

3. **User Access Review:**
   - Quarterly permission audits
   - Document access justifications
   - Revoke unnecessary permissions

**GDPR Considerations:**

- **Data Minimization:** `canViewAllContracts` should be granted sparingly
- **Access Logging:** All permission changes are logged with timestamp, user, IP
- **Right to Access:** Audit logs show who accessed what data (via permissions)

---

## Emergency Procedures

### Emergency Access Revocation

**Scenario:** User account compromised or insider threat detected

**Immediate Actions:**

1. **Disable User Account:**
   - Navigate to User Management
   - Click "Disable" on compromised account
   - Effect: Immediate logout and access block

2. **Document Incident:**
   - Record time of detection
   - Note what access user had (role + toggles)
   - Document which data may have been accessed

3. **Review Audit Logs:**
   - Check user's recent activity
   - Identify contracts accessed/modified
   - Export logs for incident investigation

4. **Notify Stakeholders:**
   - Inform security team
   - Alert affected departments
   - Follow incident response plan

**Recovery:**
- Investigate root cause
- Determine if re-enablement appropriate
- If yes: Reset password, revoke sensitive toggles, monitor closely
- If no: Keep disabled, document decision

### Emergency Permission Elevation

**Scenario:** Manager unavailable, critical contract needs closure

**Authorized Process:**

1. **Verify Emergency:**
   - Confirm business-critical need
   - Document emergency justification
   - Get approval from appropriate authority

2. **Temporary Elevation:**
   - Grant `canCloseContracts` to designated staff
   - Document in change log: "EMERGENCY - [reason]"
   - Set calendar reminder for revocation

3. **Supervised Access:**
   - Monitor user's actions during elevation
   - Review completed actions
   - Export audit trail

4. **Revocation:**
   - Revoke toggle as soon as emergency resolved
   - Update incident documentation
   - Review process for improvement

**Post-Emergency Review:**
- Analyze why emergency occurred
- Update procedures to prevent recurrence
- Consider permanent role adjustments if pattern emerges

### Mass Permission Revocation

**Scenario:** Security policy change requires immediate access reduction

**Process:**

1. **Identify Affected Users:**
   - Query User Management for users with target toggle
   - Export list for documentation

2. **Communication:**
   - Notify affected users BEFORE revocation (if possible)
   - Explain policy change and timeline
   - Provide alternative access methods if available

3. **Staged Revocation:**
   - Start with lowest-risk users
   - Monitor for operational impact
   - Adjust approach based on feedback

4. **Documentation:**
   - Record all revocations in change log
   - Document business justification
   - Update security policies

---

## Appendix

### Permission Toggle Technical Reference

**Database Schema:**
```typescript
users {
  canAccessReports: boolean (default: false)
  canCloseContracts: boolean (default: false)
  canViewAllContracts: boolean (default: false)
}
```

**Middleware Functions:**
- `requireReportsAccess`: Admin OR Manager OR canAccessReports
- `requireContractCloseAccess`: Admin OR Manager OR canCloseContracts
- `requireEditor`: Admin OR Manager OR Staff (base operational access)

**Frontend Hooks:**
```typescript
const { user, isAdmin, isManager, isEditor, isViewer } = useAuth();

// Toggle checks
if (user?.canAccessReports) {
  // Show reports menu
}
if (user?.canCloseContracts) {
  // Show close button
}
if (user?.canViewAllContracts) {
  // Fetch all contracts
}
```

### Related Documentation

- **ROLE_PERMISSIONS.md** - Comprehensive permission system documentation
- **ADMIN_GUIDE.md** - Full administrator guide
- **USER_GUIDE.md** - End-user documentation (role-specific sections)
- **TESTING_GUIDE.md** - Testing permission scenarios
- **replit.md** - Authoritative system architecture and preferences

---

## Change Log

| Version | Date       | Author      | Changes                              |
|---------|------------|-------------|--------------------------------------|
| 1.0     | 2025-11-03 | System Team | Initial operational runbook creation |

---

## Feedback & Improvements

This runbook is a living document. Submit feedback or improvement suggestions through:
- System administrator communication channels
- Quarterly permission system reviews
- Security policy update cycles

**Document Owner:** System Administration Team  
**Review Frequency:** Quarterly  
**Next Review:** February 2026

---

## 📱 Communications Platform Operations

### Monitoring Automated Notifications

**Cron Jobs Status:**
```bash
# Check if automation orchestrator is initialized
# Logs will show: "[Automation] Initializing Automation Orchestrator..."
grep "Automation" /tmp/logs/*.log
```

**Job Schedule:**
- **2:00 AM** - Nightly Risk Score Calculation (triggers risk elevated notifications)
- **8:00 AM** - Document Expiry Check (creates reminders 30 days before expiry)
- **9:00 AM** - Contract Expiry Reminders (sends expiry notifications)
- **10:00 AM** - Payment Due Reminders (sends payment due alerts)

### Communication Provider Health

**Check Provider Status:**
1. Navigate to Settings → Communication Providers
2. Review health status column:
   - 🟢 Healthy - Provider operational
   - 🟡 Degraded - Experiencing issues
   - 🔴 Failed - Provider unavailable

**Health Check Actions:**
- Healthy providers process messages normally
- Degraded/Failed providers automatically skipped
- Fallback providers activated on primary failure
- Manual testing via Notifications → Send

### Troubleshooting Communication Issues

**Symptom: No notifications sent**
1. Check cron jobs are running
2. Verify at least one provider is healthy
3. Review communication logs for errors
4. Test with Manual Notification Sender

**Symptom: High failure rate**
1. Check provider credentials (API keys, tokens)
2. Verify provider account status (quotas, billing)
3. Review error messages in communication logs
4. Test connectivity to provider APIs

**Symptom: Notifications delayed**
1. Check server load and performance
2. Verify database connection is stable
3. Review cron job execution times
4. Check provider API rate limits

### Performance Metrics

**Target SLAs:**
- Delivery Rate: >95% for critical notifications
- Provider Health: >99% uptime for primary providers
- Notification Latency: <30 seconds for event-driven
- Cron Job Execution: 100% on-time execution

**Monitoring:**
- Review Communication Logs daily
- Check provider health weekly
- Monitor delivery rates in reports
- Track failed notifications

### Incident Response

**Provider Outage:**
1. Verify fallback provider is configured
2. Check fallback provider health
3. Monitor delivery via fallback
4. Contact primary provider support
5. Document incident in logs

**Mass Notification Failure:**
1. Check all provider health status
2. Review recent configuration changes
3. Verify environment variables
4. Test individual providers
5. Escalate to technical team

### Maintenance Tasks

**Weekly:**
- Review communication logs for patterns
- Check provider health trends
- Verify cron job execution
- Update template content if needed

**Monthly:**
- Analyze delivery rate metrics
- Review provider costs and usage
- Test disaster recovery (fallback activation)
- Update provider credentials if rotating

**Quarterly:**
- Full audit of notification touchpoints
- Provider contract review
- Template content refresh
- Performance optimization review

---
