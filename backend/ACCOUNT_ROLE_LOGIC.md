# Account and Role Logic Documentation

## Overview
This document explains how the system ensures one email = one account = one role, with no duplicates or role synchronization issues.

## Database-Level Protection

### 1. Unique Email Index
- **Location**: `backend/models/User.js`
- **Implementation**: Unique index created on `email` field at database level
- **Enforcement**: MongoDB prevents duplicate emails even if application logic fails
- **Command**: `npm run create-index` (already executed)

### 2. User Model Validation
- **Email Normalization**: Email is automatically lowercased and trimmed before saving
- **Pre-save Hook**: Checks for duplicate emails before saving
- **Role Validation**: Only allows roles: `admin`, `project_manager`, `site_worker`, `client`
- **Default Role**: `site_worker` if no role is specified

## Registration Logic

### Process Flow:
1. **Input Validation**:
   - Name, email, and password are required
   - Email format is validated with regex
   - Password must be at least 6 characters
   - Role is validated against allowed values

2. **Email Normalization**:
   - Email is converted to lowercase
   - Email is trimmed of whitespace
   - Example: `"  User@Example.COM  "` → `"user@example.com"`

3. **Duplicate Check**:
   - Checks database for existing user with same email (case-insensitive)
   - Returns error if duplicate found
   - Prevents creation if email exists

4. **User Creation**:
   - Creates user with normalized email
   - Sets role (defaults to `site_worker` if invalid)
   - Password is hashed automatically by pre-save hook

5. **Response**:
   - Returns user data with role from database
   - Returns JWT token for authentication

## Login Logic

### Process Flow:
1. **Email Normalization**: Email is lowercased and trimmed
2. **User Lookup**: Finds user by normalized email
3. **Password Verification**: Compares provided password with hashed password
4. **Token Generation**: Creates JWT token with user ID
5. **Response**: Returns user data with **role from database** (not from token)

## Role Management

### Key Principles:
1. **Role is Stored in Database**: Role is always retrieved from database, never from token
2. **Role Cannot Change via Profile Update**: Profile update endpoint does not accept role changes
3. **Role is Immutable for Users**: Users cannot change their own role
4. **Role is Set at Registration**: Role is determined during registration and remains fixed

### Role Values:
- `admin`: Full system access, can create projects
- `project_manager`: Can manage assigned projects, see assigned tasks
- `site_worker`: Can see and update assigned tasks only
- `client`: Can see projects where they are the client

## Frontend Synchronization

### AuthContext Behavior:
1. **On Login**: Fetches user data from backend, sets role from response
2. **On Registration**: Sets user data with role from backend response
3. **On App Load**: Calls `/auth/me` to get fresh user data with correct role
4. **Refresh Function**: `refreshUser()` always fetches latest role from database

### No Caching Issues:
- User data is always fetched from backend
- Role is never cached or stored in localStorage
- Role is always from the most recent database query

## Duplicate Prevention

### Multiple Layers:
1. **Application Level**: Checks before creating user
2. **Model Level**: Pre-save hook validates uniqueness
3. **Database Level**: Unique index prevents duplicates
4. **Error Handling**: Catches MongoDB duplicate key errors (E11000)

## Testing Commands

### Check for Duplicates:
```bash
npm run check-duplicates
```

### Create Unique Index:
```bash
npm run create-index
```

### Clear Database:
```bash
npm run clear-db
```

## Error Messages

### Registration Errors:
- `"An account with this email already exists"` - Email is already registered
- `"Name, email, and password are required"` - Missing required fields
- `"Please provide a valid email address"` - Invalid email format
- `"Password must be at least 6 characters long"` - Password too short

### Login Errors:
- `"Invalid email or password"` - Wrong credentials or user doesn't exist

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **Email Normalization**: Prevents case-sensitivity issues
3. **JWT Tokens**: Secure authentication without storing passwords
4. **Role-Based Access**: Permissions checked on every request

## Summary

✅ **One Email = One Account**: Enforced at database, model, and application levels
✅ **One Account = One Role**: Role is set at registration and cannot be changed by user
✅ **No Duplicates**: Multiple validation layers prevent duplicate accounts
✅ **Role Synchronization**: Frontend always fetches role from database, never caches
✅ **Fresh Data**: User data is refreshed on login and app load

