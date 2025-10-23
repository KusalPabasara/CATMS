# Design Document

## Overview

This design addresses critical authentication failures in the MedSync application caused by database schema mismatches between the SQL schema and Sequelize models. The primary issue is that the `patients` table lacks authentication-related columns (`password_hash`, `last_login`, `is_active`) that the application code expects. This design provides a comprehensive solution including database migration, error handling improvements, connection resilience, and enhanced logging.

## Architecture

### System Components

1. **Database Layer**
   - MySQL 8.0 database with schema alignment
   - Migration scripts for schema updates
   - Connection pool management with retry logic

2. **Backend API Layer**
   - Express.js controllers with enhanced error handling
   - Sequelize ORM models synchronized with database schema
   - JWT-based authentication for staff and patients

3. **Frontend Layer**
   - React/Vite application with improved error display
   - API client with retry logic and error categorization
   - User-friendly error messages

4. **Logging & Monitoring**
   - Structured logging for authentication events
   - Error tracking with sanitized output
   - Audit trail for security events

### Data Flow

```
User Login Request → Frontend Validation → API Request → 
Backend Controller → Database Query → Password Verification → 
Token Generation → Response → Frontend State Update
```

## Components and Interfaces

### 1. Database Migration Script

**Purpose:** Update the `patients` table schema to include authentication columns

**Location:** `database/migrations/001_add_patient_auth_columns.sql`

**Schema Changes:**
```sql
ALTER TABLE patients 
ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL AFTER email,
ADD COLUMN last_login TIMESTAMP NULL AFTER active,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER last_login;

-- Add index for performance
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_active ON patients(is_active);
```

**Rollback Script:**
```sql
ALTER TABLE patients 
DROP COLUMN password_hash,
DROP COLUMN last_login,
DROP COLUMN is_active;

DROP INDEX idx_patients_email ON patients;
DROP INDEX idx_patients_active ON patients;
```

### 2. Database Connection Manager

**Purpose:** Provide resilient database connections with automatic retry

**Location:** `backend/config/database.ts`

**Enhanced Configuration:**
- Connection retry logic (3 attempts with exponential backoff)
- Health check endpoint
- Connection pool monitoring
- Graceful degradation on connection loss

**Interface:**
```typescript
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  pool: PoolConfig;
  retry: RetryConfig;
}

interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

async function connectWithRetry(): Promise<Sequelize>;
async function healthCheck(): Promise<boolean>;
```

### 3. Error Handler Middleware

**Purpose:** Centralized error handling with sanitized responses

**Location:** `backend/middleware/error.middleware.ts`

**Error Categories:**
- `DatabaseError` (500) - Database connection/query failures
- `AuthenticationError` (401) - Invalid credentials
- `AuthorizationError` (403) - Insufficient permissions
- `ValidationError` (400) - Invalid input data
- `NotFoundError` (404) - Resource not found
- `ServiceUnavailableError` (503) - External service failures

**Interface:**
```typescript
interface ErrorResponse {
  error: string;           // User-friendly message
  code: string;            // Error code for frontend handling
  timestamp: string;       // ISO timestamp
  requestId?: string;      // For tracking
}

interface ErrorLogEntry {
  level: 'error' | 'warn';
  message: string;
  stack?: string;
  context: {
    userId?: number;
    patientId?: number;
    ip: string;
    path: string;
    method: string;
  };
}

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void;
```

### 4. Enhanced Patient Authentication Controller

**Purpose:** Secure patient login with comprehensive error handling

**Location:** `backend/controllers/patient.auth.controller.ts`

**Key Improvements:**
- Database error handling with specific messages
- Password hash existence validation
- Account activation status checks
- Detailed server-side logging with sanitized client responses
- Last login timestamp updates

**Updated Login Flow:**
```typescript
async function patientLogin(req: Request, res: Response): Promise<void> {
  try {
    // 1. Validate input
    // 2. Find patient with error handling
    // 3. Check account status (active, has password)
    // 4. Verify password
    // 5. Update last_login
    // 6. Generate token
    // 7. Log audit trail
    // 8. Return sanitized response
  } catch (error) {
    // Categorize and handle error appropriately
  }
}
```

### 5. Enhanced Staff Authentication Controller

**Purpose:** Secure staff login with role-based access

**Location:** `backend/auth/auth.controller.ts`

**Key Improvements:**
- Similar error handling as patient auth
- Role and branch validation
- Account active status checks
- Enhanced logging

### 6. Patient Model Updates

**Purpose:** Align Sequelize model with updated database schema

**Location:** `backend/models/patient.model.ts`

**Updated Attributes:**
```typescript
interface PatientAttributes {
  patient_id: number;
  full_name: string;
  email: string;
  password_hash?: string;      // NEW
  last_login?: Date;           // NEW
  is_active: boolean;          // NEW (with default true)
  // ... existing fields
}
```

**Model Configuration:**
```typescript
Patient.init({
  // ... existing fields
  password_hash: { 
    type: DataTypes.STRING(255), 
    allowNull: true 
  },
  last_login: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  is_active: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Patient',
  tableName: 'patients',
  timestamps: false
});
```

### 7. Frontend API Client Enhancement

**Purpose:** Handle API errors gracefully with retry logic

**Location:** `frontend/src/utils/api.ts`

**Error Handling Strategy:**
```typescript
interface ApiError {
  status: number;
  code: string;
  message: string;
  retryable: boolean;
}

async function apiRequest<T>(
  method: string,
  url: string,
  data?: any,
  options?: RequestOptions
): Promise<T> {
  try {
    // Make request with timeout
    const response = await axios.request({...});
    return response.data;
  } catch (error) {
    // Categorize error
    const apiError = categorizeError(error);
    
    // Retry if appropriate
    if (apiError.retryable && retryCount < maxRetries) {
      await delay(retryDelay);
      return apiRequest(...); // Recursive retry
    }
    
    // Log and throw
    logError(apiError);
    throw apiError;
  }
}

function categorizeError(error: AxiosError): ApiError {
  if (!error.response) {
    return {
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to server. Please check your internet connection.',
      retryable: true
    };
  }
  
  switch (error.response.status) {
    case 500:
      return {
        status: 500,
        code: 'SERVER_ERROR',
        message: 'Something went wrong on our end. Please try again.',
        retryable: true
      };
    case 503:
      return {
        status: 503,
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service temporarily unavailable. Please try again in a moment.',
        retryable: true
      };
    case 401:
      return {
        status: 401,
        code: 'UNAUTHORIZED',
        message: error.response.data?.error || 'Invalid credentials',
        retryable: false
      };
    default:
      return {
        status: error.response.status,
        code: 'API_ERROR',
        message: error.response.data?.error || 'An error occurred',
        retryable: false
      };
  }
}
```

### 8. Frontend Error Display Component

**Purpose:** User-friendly error messages with retry options

**Location:** `frontend/src/components/ErrorDisplay.tsx`

**Component Interface:**
```typescript
interface ErrorDisplayProps {
  error: ApiError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps): JSX.Element {
  // Display appropriate icon and message based on error code
  // Show retry button for retryable errors
  // Show contact support for non-retryable errors
}
```

### 9. Logging Service

**Purpose:** Structured logging with sensitive data redaction

**Location:** `backend/services/logging.service.ts`

**Log Levels:**
- `error` - Critical failures requiring immediate attention
- `warn` - Non-critical issues that should be investigated
- `info` - General informational messages
- `debug` - Detailed debugging information (dev only)

**Interface:**
```typescript
interface LogContext {
  userId?: number;
  patientId?: number;
  ip: string;
  userAgent: string;
  path: string;
  method: string;
  duration?: number;
}

function logAuthAttempt(
  success: boolean,
  userType: 'staff' | 'patient',
  identifier: string,
  context: LogContext
): void;

function logDatabaseError(
  error: Error,
  query: string,
  context: LogContext
): void;

function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high',
  context: LogContext
): void;
```

**Redaction Rules:**
- Remove `password`, `password_hash`, `token` fields
- Mask email addresses (show first 2 chars + domain)
- Mask phone numbers (show last 4 digits)
- Truncate long strings to 100 chars

## Data Models

### Updated Patient Model

```typescript
interface Patient {
  patient_id: number;
  full_name: string;
  first_name?: string;
  last_name?: string;
  national_id?: string;
  dob?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  blood_type?: string;
  phone?: string;
  email: string;
  password_hash?: string;        // NEW - bcrypt hashed password
  last_login?: Date;             // NEW - timestamp of last successful login
  is_active: boolean;            // NEW - account activation status
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  allergies?: string;
  profile_picture?: string;
  active: boolean;               // EXISTING - general active status
  created_at: Date;
}
```

**Note:** The model has both `active` (existing) and `is_active` (new) fields. We'll use `is_active` for authentication purposes and keep `active` for backward compatibility.

### Authentication Token Payload

```typescript
interface PatientTokenPayload {
  patient_id: number;
  email: string;
  full_name: string;
  type: 'patient';
  iat: number;  // Issued at
  exp: number;  // Expiration
}

interface StaffTokenPayload {
  user_id: number;
  email: string;
  role: string;
  branch_id?: number;
  branch_name?: string;
  staff_title?: string;
  type: 'staff';
  iat: number;
  exp: number;
}
```

## Error Handling

### Error Response Format

All API errors will follow this consistent format:

```typescript
{
  error: string;        // User-friendly message
  code: string;         // Machine-readable error code
  timestamp: string;    // ISO 8601 timestamp
  requestId?: string;   // Optional request tracking ID
}
```

### Error Codes

| Code | HTTP Status | Description | User Message |
|------|-------------|-------------|--------------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid email/password | Invalid login credentials |
| `AUTH_ACCOUNT_INACTIVE` | 401 | Account is inactive | Your account is inactive. Please contact support. |
| `AUTH_PASSWORD_NOT_SET` | 401 | Password not configured | Account not activated. Please contact clinic staff. |
| `DATABASE_CONNECTION_ERROR` | 503 | Cannot connect to database | Service temporarily unavailable. Please try again. |
| `DATABASE_QUERY_ERROR` | 500 | Query execution failed | Something went wrong. Please try again. |
| `VALIDATION_ERROR` | 400 | Invalid input data | Please check your input and try again. |
| `NETWORK_ERROR` | 0 | Network connectivity issue | Unable to connect. Please check your internet. |

### Error Handling Flow

```
Error Occurs → 
Catch in Controller → 
Categorize Error Type → 
Log Detailed Error (server) → 
Map to Error Code → 
Return Sanitized Response (client) → 
Frontend Displays User Message
```

## Testing Strategy

### Unit Tests

1. **Database Migration Tests**
   - Test migration script execution
   - Verify column additions
   - Test rollback functionality
   - Validate data preservation

2. **Model Tests**
   - Test Patient model with new fields
   - Verify password hashing
   - Test model validation rules
   - Test default values

3. **Controller Tests**
   - Test patient login with valid credentials
   - Test patient login with invalid credentials
   - Test patient login without password_hash
   - Test patient login with inactive account
   - Test staff login scenarios
   - Test error handling for database failures

4. **Error Handler Tests**
   - Test error categorization
   - Test response sanitization
   - Test logging functionality
   - Test sensitive data redaction

### Integration Tests

1. **Authentication Flow Tests**
   - End-to-end patient login
   - End-to-end staff login
   - Token generation and validation
   - Session management

2. **Database Connection Tests**
   - Test connection retry logic
   - Test connection pool behavior
   - Test graceful degradation
   - Test health check endpoint

3. **Error Handling Tests**
   - Test 500 error handling
   - Test 401 error handling
   - Test 503 error handling
   - Test network error handling

### Manual Testing Checklist

1. **Patient Authentication**
   - [ ] Login with valid email and password
   - [ ] Login with invalid password
   - [ ] Login with non-existent email
   - [ ] Login with account without password_hash
   - [ ] Login with inactive account
   - [ ] Login with national_id instead of email

2. **Staff Authentication**
   - [ ] Login with valid credentials
   - [ ] Login with invalid credentials
   - [ ] Login with inactive account
   - [ ] Login with wrong branch_id

3. **Error Display**
   - [ ] Verify user-friendly error messages
   - [ ] Test retry functionality
   - [ ] Test error dismissal
   - [ ] Verify no sensitive data in client errors

4. **Database Resilience**
   - [ ] Stop MySQL and verify error handling
   - [ ] Restart MySQL and verify reconnection
   - [ ] Test with slow database responses

## Implementation Phases

### Phase 1: Database Schema Update
- Create migration script
- Test migration on development database
- Apply migration to Docker container
- Verify schema changes

### Phase 2: Backend Error Handling
- Implement error handler middleware
- Update patient auth controller
- Update staff auth controller
- Enhance database connection manager
- Implement logging service

### Phase 3: Model Updates
- Update Patient model
- Update User model (if needed)
- Sync models with database
- Test model operations

### Phase 4: Frontend Error Handling
- Enhance API client
- Create ErrorDisplay component
- Update login components
- Test error scenarios

### Phase 5: Testing & Validation
- Run unit tests
- Run integration tests
- Perform manual testing
- Fix any issues found

### Phase 6: Monitoring & Logging
- Verify logging is working
- Set up log monitoring
- Test audit trail
- Document error codes

## Security Considerations

1. **Password Security**
   - Use bcrypt with salt rounds >= 10
   - Never log or return password_hash to clients
   - Implement password complexity requirements

2. **Error Messages**
   - Never reveal whether email exists in error messages
   - Don't expose internal error details to clients
   - Use generic messages for authentication failures

3. **Rate Limiting**
   - Implement rate limiting on login endpoints
   - Block IPs after multiple failed attempts
   - Log suspicious activity

4. **Token Security**
   - Use secure JWT signing keys
   - Implement token expiration
   - Validate tokens on every request
   - Implement token refresh mechanism

5. **Audit Logging**
   - Log all authentication attempts
   - Log all password changes
   - Log all account modifications
   - Include IP addresses and timestamps

## Performance Considerations

1. **Database Queries**
   - Add indexes on email and is_active columns
   - Use connection pooling
   - Implement query timeouts

2. **Password Hashing**
   - Use async bcrypt operations
   - Don't block event loop
   - Consider caching for repeated operations

3. **Error Handling**
   - Minimize error handling overhead
   - Use efficient logging
   - Avoid synchronous operations

4. **Frontend**
   - Implement request debouncing
   - Cache error messages
   - Use optimistic UI updates

## Rollback Plan

If issues arise after deployment:

1. **Database Rollback**
   ```sql
   -- Run rollback script
   source database/migrations/001_add_patient_auth_columns_rollback.sql
   ```

2. **Code Rollback**
   - Revert to previous Git commit
   - Rebuild Docker containers
   - Restart services

3. **Data Recovery**
   - Restore from backup if needed
   - Verify data integrity
   - Re-run migrations if necessary

## Success Metrics

1. **Error Rate Reduction**
   - Target: 0 authentication 500 errors
   - Measure: Error logs and monitoring

2. **User Experience**
   - Target: Clear error messages for all scenarios
   - Measure: User feedback and support tickets

3. **System Reliability**
   - Target: 99.9% authentication success rate (for valid credentials)
   - Measure: Success/failure ratio in logs

4. **Performance**
   - Target: Login response time < 500ms
   - Measure: API response time monitoring
