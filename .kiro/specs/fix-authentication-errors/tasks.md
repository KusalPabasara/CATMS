# Implementation Plan

- [x] 1. Create and execute database migration script
  - Create migration SQL file to add `password_hash`, `last_login`, and `is_active` columns to patients table
  - Create rollback SQL file for safe reversal
  - Add indexes for email and is_active columns for performance
  - Execute migration against the running MySQL container
  - Verify schema changes with DESCRIBE patients query
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.2, 7.4_

- [-] 2. Update Patient Sequelize model
  - Add `password_hash` field (STRING(255), nullable) to PatientAttributes interface
  - Add `last_login` field (DATE, nullable) to PatientAttributes interface
  - Add `is_active` field (BOOLEAN, default true) to PatientAttributes interface
  - Update Patient.init() configuration with new fields
  - Ensure timestamps: false to match database schema
  - _Requirements: 1.3, 1.4_

- [ ] 3. Implement centralized error handler middleware
  - Create `backend/middleware/error.middleware.ts` file
  - Define ErrorResponse and ErrorLogEntry interfaces
  - Implement error categorization function (DatabaseError, AuthenticationError, etc.)
  - Implement errorHandler middleware function with sanitized responses
  - Create error code mapping for consistent client responses
  - Add sensitive data redaction for logging
  - _Requirements: 2.1, 2.4, 2.5, 3.1, 6.5_

- [ ] 4. Create structured logging service
  - Create `backend/services/logging.service.ts` file
  - Define LogContext interface
  - Implement logAuthAttempt function for authentication events
  - Implement logDatabaseError function for database failures
  - Implement logSecurityEvent function for security-related events
  - Add sensitive data redaction (passwords, tokens, partial email/phone masking)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 5. Enhance database connection with retry logic
  - Update `backend/config/database.ts` with retry configuration
  - Implement connectWithRetry function with exponential backoff
  - Add connection health check function
  - Configure connection pool with proper timeouts
  - Add connection event listeners for monitoring
  - Implement graceful degradation on connection loss
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 6. Update patient authentication controller with comprehensive error handling
  - Update `backend/controllers/patient.auth.controller.ts` patientLogin function
  - Add try-catch with specific error categorization
  - Check if patient.is_active before authentication
  - Check if password_hash exists before password verification
  - Update last_login timestamp on successful login
  - Return sanitized error responses (no internal details)
  - Add detailed server-side logging with context
  - Use logging service for all authentication attempts
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1_

- [ ] 7. Update patient registration controller
  - Update `backend/controllers/patient.auth.controller.ts` patientRegister function
  - Set is_active to true by default for new registrations
  - Add database error handling with specific messages
  - Use logging service for registration events
  - Return sanitized errors on failure
  - _Requirements: 2.1, 2.5, 6.1_

- [ ] 8. Update staff authentication controller with error handling
  - Update `backend/auth/auth.controller.ts` login function
  - Add is_active check for staff accounts
  - Implement comprehensive error handling
  - Add detailed logging for staff authentication attempts
  - Return sanitized error responses
  - Use logging service for all authentication events
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 6.1_

- [ ] 9. Register error handler middleware in Express app
  - Update `backend/server.ts` or main app file
  - Import error handler middleware
  - Register as last middleware (after all routes)
  - Ensure it catches all unhandled errors
  - Test that errors are properly caught and formatted
  - _Requirements: 2.5, 3.1_

- [ ] 10. Create frontend API error categorization utility
  - Update `frontend/src/utils/api.ts` or create new error utility file
  - Define ApiError interface with status, code, message, retryable fields
  - Implement categorizeError function to map HTTP status to error types
  - Map 500 → SERVER_ERROR (retryable)
  - Map 503 → SERVICE_UNAVAILABLE (retryable)
  - Map 401 → UNAUTHORIZED (not retryable)
  - Map network errors → NETWORK_ERROR (retryable)
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 11. Implement API request retry logic in frontend
  - Update API client request function with retry capability
  - Implement exponential backoff for retryable errors
  - Set max retry attempts to 3
  - Add request timeout configuration
  - Only retry on retryable error codes
  - Log retry attempts for debugging
  - _Requirements: 4.2, 5.1, 5.4_

- [ ] 12. Create ErrorDisplay component for frontend
  - Create `frontend/src/components/ErrorDisplay.tsx` component
  - Define ErrorDisplayProps interface
  - Implement component with error icon and message display
  - Add retry button for retryable errors
  - Add dismiss button for all errors
  - Style component for visibility and user-friendliness
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 13. Update frontend Login component with error handling
  - Update patient and staff login components
  - Import and use ErrorDisplay component
  - Handle API errors from login requests
  - Display specific error messages from API responses
  - Implement retry functionality for failed logins
  - Clear errors on successful login or component unmount
  - _Requirements: 5.1, 5.4, 5.5_

- [ ] 14. Add authentication error handling to API interceptors
  - Update axios interceptors in API client
  - Handle 401 errors by redirecting to login page
  - Handle 503 errors with service unavailable message
  - Handle 500 errors with generic error message
  - Clear authentication tokens on 401 errors
  - _Requirements: 5.2, 5.3, 5.4_

- [ ] 15. Write unit tests for error handler middleware
  - Create test file for error middleware
  - Test DatabaseError categorization and response
  - Test AuthenticationError categorization and response
  - Test ValidationError categorization and response
  - Test sensitive data redaction in logs
  - Test error response format consistency
  - _Requirements: 2.5, 6.5_

- [ ] 16. Write unit tests for patient authentication
  - Create test file for patient auth controller
  - Test successful login with valid credentials
  - Test login failure with invalid password
  - Test login failure with non-existent email
  - Test login failure when password_hash is null
  - Test login failure when is_active is false
  - Test last_login timestamp update on success
  - Mock database and logging services
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 17. Write unit tests for staff authentication
  - Create test file for staff auth controller
  - Test successful login with valid credentials
  - Test login failure with invalid credentials
  - Test login failure when is_active is false
  - Test role and branch validation
  - Mock database and logging services
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 18. Write integration tests for authentication flow
  - Create integration test file
  - Test end-to-end patient login flow
  - Test end-to-end staff login flow
  - Test token generation and validation
  - Test database connection retry on failure
  - Use test database for integration tests
  - _Requirements: 2.1, 2.2, 3.1, 4.1, 4.2_

- [ ] 19. Perform manual testing of authentication scenarios
  - Test patient login with valid credentials in browser
  - Test patient login with invalid password
  - Test patient login with non-existent email
  - Test patient login with account without password_hash
  - Test staff login with valid credentials
  - Test staff login with invalid credentials
  - Verify error messages are user-friendly
  - Verify no sensitive data in client responses
  - Test retry functionality for network errors
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.4, 5.5_

- [ ] 20. Test database resilience and connection handling
  - Stop MySQL container and verify error handling
  - Restart MySQL container and verify automatic reconnection
  - Test connection pool exhaustion scenario
  - Verify health check endpoint functionality
  - Test graceful degradation when database is unavailable
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 21. Verify logging and audit trail functionality
  - Check logs for authentication attempts (success and failure)
  - Verify sensitive data is redacted in logs
  - Verify IP addresses and timestamps are logged
  - Check audit_log table for authentication events
  - Verify error stack traces are logged server-side only
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 22. Update API documentation with error codes
  - Document all error codes and their meanings
  - Document error response format
  - Add examples of error responses for each endpoint
  - Document retry behavior for retryable errors
  - Add troubleshooting guide for common errors
  - _Requirements: 2.5, 5.5_
