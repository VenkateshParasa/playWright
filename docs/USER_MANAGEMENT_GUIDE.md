# User Management Guide

## Overview

The User Management system provides comprehensive tools for administrators to manage users, roles, and permissions in the Playwright & Selenium Learning Platform.

## Table of Contents

1. [Accessing User Management](#accessing-user-management)
2. [User Management Page](#user-management-page)
3. [User Detail View](#user-detail-view)
4. [User Operations](#user-operations)
5. [Bulk Operations](#bulk-operations)
6. [Role Management](#role-management)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Accessing User Management

### Prerequisites
- Admin role is required to access user management features
- Navigate to `/admin/users` in the application

### Permissions
Only users with the `admin` role can:
- View all users
- Edit user details
- Suspend/activate accounts
- Delete users
- Reset passwords
- Manage roles and permissions

---

## User Management Page

### Features

#### 1. User List
- **Paginated table** displaying all users
- **Columns:**
  - User (name and avatar)
  - Email
  - Role (student, instructor, admin)
  - Status (active, suspended, deleted)
  - Joined date
  - Last active date
  - Actions

#### 2. Search and Filters

**Search:**
- Search by name or email
- Real-time search with debouncing (300ms)

**Filters:**
- **Role:** Filter by student, instructor, admin, or all
- **Status:** Filter by active, suspended, deleted, or all
- **Sort By:** Registration date, name, email, or last login
- **Sort Order:** Ascending or descending
- **Date Range:** Filter by registration date

#### 3. Bulk Selection
- Select individual users with checkboxes
- Select all users on current page
- View selected count
- Execute bulk operations on selected users

#### 4. Statistics
- **Total Users:** Count of all non-deleted users
- **Active Users:** Count of active accounts
- **Suspended Users:** Count of suspended accounts
- **Selected:** Number of users currently selected

#### 5. Export
- **CSV Export:** Export users to CSV format
- **JSON Export:** Export users to JSON format
- Export all users or only selected users

---

## User Detail View

### Accessing
Click "View Details" on any user in the list or navigate to `/admin/users/:id`

### Information Displayed

#### User Profile
- Full name and avatar
- Email address (verification status)
- Role badge
- Status badge
- Registration date
- Last active timestamp

#### Suspension Information
If user is suspended:
- Suspension reason
- Suspended date and time
- Suspended by (admin who performed action)

#### Activity Timeline
- Chronological list of user activities
- Activity types:
  - Lesson completions
  - Quiz completions
  - Exercise completions
  - Review sessions
  - Achievement unlocks

#### User Progress (if available)
- Lessons completed
- Quizzes completed
- Exercises completed
- Flashcards reviewed
- Study time
- Achievements

---

## User Operations

### 1. Edit User

**Access:** Click "Edit User" button on user detail page

**Editable Fields:**
- First Name
- Last Name
- Email
- Role (student, instructor, admin)
- Email Verified (checkbox)

**Process:**
1. Click "Edit User"
2. Modify desired fields
3. Click "Save Changes"
4. Changes are logged in audit log

**Note:** Changing a user's role will immediately affect their permissions.

---

### 2. Suspend User

**Purpose:** Temporarily disable a user account

**Access:** Click "Suspend" button (only visible for active users)

**Process:**
1. Click "Suspend"
2. Enter reason for suspension (required)
3. Confirm action
4. User account is immediately suspended
5. User cannot log in until reactivated

**Effects:**
- User cannot access the platform
- Existing sessions are terminated
- All data is preserved
- Suspension is logged in audit log

---

### 3. Activate User

**Purpose:** Re-enable a suspended account

**Access:** Click "Activate" button (only visible for suspended users)

**Process:**
1. Click "Activate"
2. Confirm action
3. User account is immediately activated
4. Suspension information is cleared
5. User can log in again

---

### 4. Reset Password

**Purpose:** Generate a new temporary password for a user

**Access:** Click "Reset Password" button

**Process:**
1. Click "Reset Password"
2. Choose whether to send password via email:
   - **Yes (OK):** Email is sent to user with temporary password
   - **No (Cancel):** Temporary password is displayed to admin
3. User must change password on next login

**Security:**
- Temporary passwords are randomly generated
- Old password is immediately invalidated
- Action is logged in audit log

---

### 5. Delete User

**Purpose:** Remove a user from the system

**Access:** Click "Delete" button

**Deletion Types:**

#### Soft Delete (Recommended)
- User account is marked as "deleted"
- Data is preserved
- Account can be restored later
- User cannot log in
- Account appears in deleted users list

#### Hard Delete (Permanent)
- User account is permanently removed
- All associated data is deleted:
  - Progress records
  - Quiz attempts
  - Flashcard reviews
  - Achievements
- **Cannot be undone**
- Use only when required for compliance (GDPR, etc.)

**Process:**
1. Click "Delete"
2. Confirmation dialog appears
3. Choose deletion type:
   - "Soft Delete" (default)
   - "Permanent Delete"
4. Confirm action
5. User is deleted

**Warning:** Always use soft delete unless permanent removal is legally required.

---

## Bulk Operations

### Accessing
1. Select users using checkboxes
2. Click "Bulk Actions" button
3. Or navigate to `/admin/users/bulk?ids=<comma-separated-ids>`

### Available Operations

#### 1. Bulk Suspend
- Suspend multiple users at once
- Requires reason (applies to all)
- Useful for handling violations

**Process:**
1. Select "Suspend Users"
2. Enter suspension reason
3. Click "Execute Action"
4. All selected users are suspended

#### 2. Bulk Activate
- Activate multiple suspended users
- No additional input required

**Process:**
1. Select "Activate Users"
2. Click "Execute Action"
3. All selected users are activated

#### 3. Bulk Delete
- Soft delete multiple users
- Confirmation required

**Process:**
1. Select "Delete Users"
2. Click "Execute Action"
3. Confirm deletion
4. All selected users are soft deleted

#### 4. Bulk Export
- Export data for selected users
- Available formats: CSV, JSON
- Useful for reporting and analysis

**Process:**
1. Select users to export
2. Click "Export" dropdown
3. Choose "Export as CSV" or "Export as JSON"
4. File downloads automatically

---

## Role Management

### Available Roles

#### Student (Default)
**Permissions:**
- Read lessons
- Take quizzes and exercises
- Review flashcards
- Update own profile
- View own progress

**Use Cases:**
- Regular learners
- Default role for new registrations

---

#### Instructor
**Permissions:**
- All student permissions
- Create/edit lessons
- Create/edit quizzes
- Create/edit exercises
- Create/edit flashcards
- View student progress
- View analytics

**Use Cases:**
- Content creators
- Course instructors
- Teaching assistants

---

#### Admin
**Permissions:**
- All instructor permissions
- Manage users (CRUD operations)
- Manage roles and permissions
- Access analytics dashboard
- System settings
- Audit logs

**Use Cases:**
- Platform administrators
- System managers
- Support staff

---

### Changing User Roles

1. Open user detail page
2. Click "Edit User"
3. Select new role from dropdown
4. Save changes
5. New permissions take effect immediately

**Warning:** Be cautious when assigning admin role. Admins have full system access.

---

## Best Practices

### User Management

1. **Regular Audits**
   - Review user list monthly
   - Check for inactive accounts
   - Verify role assignments
   - Review suspended accounts

2. **Account Suspension**
   - Always provide clear reason
   - Document policy violations
   - Set review dates for temporary suspensions
   - Communicate with users when possible

3. **Password Resets**
   - Use email delivery when possible
   - Verify user identity before resetting
   - Require password change on next login
   - Log all password reset actions

4. **Data Privacy**
   - Use soft delete by default
   - Only hard delete when legally required
   - Export user data before deletion if requested
   - Follow GDPR and data protection regulations

5. **Role Assignment**
   - Follow principle of least privilege
   - Review instructor and admin assignments regularly
   - Document role change reasons
   - Train users on their permissions

### Security

1. **Admin Access**
   - Limit number of admin accounts
   - Use strong passwords
   - Enable two-factor authentication (if available)
   - Monitor admin activity logs

2. **Bulk Operations**
   - Double-check user selection before executing
   - Use preview when available
   - Keep backups before large operations
   - Test on small sets first

3. **Audit Logging**
   - Review audit logs regularly
   - Investigate suspicious activities
   - Maintain log retention policy
   - Export logs for compliance

---

## Troubleshooting

### Common Issues

#### Cannot Access User Management
**Symptom:** User management page shows "Access Denied" or redirects

**Solutions:**
1. Verify you have admin role
2. Check authentication status
3. Clear browser cache and cookies
4. Log out and log back in
5. Contact system administrator

---

#### User List Not Loading
**Symptom:** Empty table or loading spinner persists

**Solutions:**
1. Check internet connection
2. Refresh the page
3. Clear filters and search
4. Check browser console for errors
5. Verify backend server is running

---

#### Cannot Update User
**Symptom:** Save button doesn't work or shows error

**Solutions:**
1. Verify all required fields are filled
2. Check email format is valid
3. Ensure email is unique (not used by another user)
4. Check for validation errors
5. Verify backend API is accessible

---

#### Bulk Operation Failed
**Symptom:** Bulk action completes with errors

**Solutions:**
1. Check if some users were already in target state
2. Reduce batch size
3. Verify all user IDs are valid
4. Check audit logs for details
5. Retry failed operations individually

---

#### Export Not Working
**Symptom:** Export button doesn't trigger download

**Solutions:**
1. Check browser download settings
2. Disable popup blockers
3. Try different export format
4. Reduce number of users to export
5. Check browser console for errors

---

### Getting Help

If you encounter issues not covered in this guide:

1. **Check Audit Logs:** Review recent admin actions for clues
2. **System Logs:** Check backend logs for error messages
3. **Browser Console:** Look for JavaScript errors
4. **Contact Support:** Provide details:
   - Error message
   - Steps to reproduce
   - Browser and version
   - Time of occurrence
   - Affected user(s)

---

## Audit Trail

All administrative actions are logged including:
- User viewed
- User updated (with field changes)
- User suspended (with reason)
- User activated
- User deleted
- Password reset
- Bulk operations

Audit logs include:
- Admin who performed action
- Action timestamp
- IP address
- User agent
- Changes made
- Affected resources

Access audit logs through the admin analytics dashboard or database queries.

---

## Compliance and Privacy

### GDPR Compliance

1. **Right to Access:** Users can request their data
2. **Right to Erasure:** Support hard delete for data removal
3. **Data Portability:** Export user data in standard formats
4. **Purpose Limitation:** Only collect necessary data
5. **Data Minimization:** Delete inactive accounts per policy

### Data Retention

- **Active Users:** Retain indefinitely while active
- **Soft Deleted:** Retain for 30 days, then hard delete
- **Audit Logs:** Retain for 1 year minimum
- **Backups:** Follow organization backup policy

### User Rights

Users have the right to:
- Access their personal data
- Request data correction
- Request data deletion
- Export their data
- Object to processing
- Lodge complaints

---

## Glossary

- **Soft Delete:** Marking account as deleted without removing data
- **Hard Delete:** Permanent removal of account and all data
- **Suspension:** Temporary account disable with data preservation
- **Audit Log:** Record of all administrative actions
- **RBAC:** Role-Based Access Control
- **GDPR:** General Data Protection Regulation

---

## Version History

- **v1.0** (2024-02): Initial user management system release

---

For technical documentation, see: [RBAC_GUIDE.md](./RBAC_GUIDE.md)
