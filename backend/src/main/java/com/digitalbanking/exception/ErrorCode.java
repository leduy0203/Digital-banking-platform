package com.digitalbanking.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 1. SYSTEM & GENERAL

    UNCATEGORIZED_EXCEPTION("SYS_001", "Uncategorized system error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY("SYS_002", "Invalid configuration or key", HttpStatus.BAD_REQUEST),
    VALIDATION_ERROR("SYS_003", "Invalid input data", HttpStatus.BAD_REQUEST),

    // 2. AUTHENTICATION & AUTHORIZATION

    UNAUTHENTICATED("AUTH_001", "Unauthenticated or session has expired", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED("AUTH_002", "Access denied: insufficient permissions", HttpStatus.FORBIDDEN),
    INVALID_CREDENTIALS("AUTH_003", "Invalid email or password", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED("AUTH_004", "Authentication token has expired", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_INVALID("AUTH_005", "Refresh token is invalid or expired", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_REVOKED("AUTH_006", "Refresh token has been revoked", HttpStatus.UNAUTHORIZED),
    PASSWORD_NOT_MATCH("AUTH_007", "Confirm password does not match", HttpStatus.BAD_REQUEST),
    INVALID_CURRENT_PASSWORD("AUTH_008", "Invalid current password", HttpStatus.BAD_REQUEST),

    // 3. USER & CUSTOMER

    USER_NOT_FOUND("USER_001", "User not found", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTS("USER_002", "Email or phone number is already registered", HttpStatus.CONFLICT),
    EMAIL_ALREADY_EXISTS("USER_003", "Email is already registered", HttpStatus.BAD_REQUEST),
    PHONE_NUMBER_ALREADY_EXISTS("USER_004", "Phone number is already registered", HttpStatus.BAD_REQUEST),
    USER_LOCKED("USER_005", "User account is locked", HttpStatus.FORBIDDEN),
    ACCOUNT_INACTIVE("USER_006", "Account is inactive or blocked", HttpStatus.UNAUTHORIZED),
    ROLE_NOT_FOUND("USER_007", "Default user role not found in system", HttpStatus.INTERNAL_SERVER_ERROR),
    CUSTOMER_NOT_FOUND("CUST_001", "Customer profile not found", HttpStatus.NOT_FOUND),
    KYC_NOT_VERIFIED("CUST_002", "Customer eKYC verification is required", HttpStatus.FORBIDDEN),
    NATIONAL_ID_ALREADY_EXISTS("USER_008", "National ID (CCCD/CMND) is already registered", HttpStatus.BAD_REQUEST),

    // EMPLOYEE
    EMPLOYEE_NOT_FOUND("EMP_001", "Employee profile not found", HttpStatus.NOT_FOUND),

    // 4. ACCOUNT & LEDGER

    ACCOUNT_NOT_FOUND("ACC_001", "Bank account not found", HttpStatus.NOT_FOUND),
    ACCOUNT_LOCKED("ACC_002", "Bank account is frozen or closed", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_FUNDS("ACC_003", "Insufficient available balance", HttpStatus.BAD_REQUEST),
    MAX_ACCOUNT_LIMIT_REACHED("ACC_004", "Maximum number of accounts reached for this customer", HttpStatus.BAD_REQUEST),

    // 5. TRANSACTION & TRANSFER

    INVALID_TRANSFER_TARGET("TRF_001", "Source and destination accounts must be different", HttpStatus.BAD_REQUEST),
    TRANSACTION_LIMIT_EXCEEDED("TRF_002", "Transaction amount exceeds allowed limit", HttpStatus.BAD_REQUEST),
    DUPLICATE_IDEMPOTENCY_KEY("TRF_003", "Transaction is already being processed or completed", HttpStatus.CONFLICT),
    TRANSACTION_FAILED("TRF_004", "Transaction execution failed, please try again later", HttpStatus.INTERNAL_SERVER_ERROR),

    // 6. CARD

    CARD_NOT_FOUND("CARD_001", "Bank card not found", HttpStatus.NOT_FOUND),
    CARD_LOCKED("CARD_002", "Bank card is locked", HttpStatus.BAD_REQUEST),
    INVALID_PIN("CARD_003", "Invalid card PIN", HttpStatus.BAD_REQUEST),
    PIN_NOT_MATCH("CARD_004", "Card PIN does not match", HttpStatus.BAD_REQUEST),

    // 7. OTP

    OTP_NOT_FOUND("OTP_001", "OTP not found", HttpStatus.NOT_FOUND),
    OTP_EXPIRED("OTP_002", "OTP has expired", HttpStatus.BAD_REQUEST),
    OTP_INVALID("OTP_003", "Invalid OTP", HttpStatus.BAD_REQUEST),
    INVALID_OTP("OTP_004", "Invalid or expired OTP code", HttpStatus.BAD_REQUEST),
    OTP_MAX_ATTEMPTS_EXCEEDED("OTP_005", "Maximum OTP verification attempts exceeded", HttpStatus.BAD_REQUEST),
    EMAIL_SEND_FAILED("EMAIL_001", "Failed to send verification email. Please try again later.", HttpStatus.SERVICE_UNAVAILABLE),
    EXTERNAL_SERVICE_ERROR("SYS_004", "External service is currently unavailable.", HttpStatus.BAD_GATEWAY),


    // RATE LIMIT
    TOO_MANY_REQUESTS("SYS_005", "Too many requests. Please try again later.", HttpStatus.TOO_MANY_REQUESTS),

    // PROFILE
    CUSTOMER_PROFILE_ALREADY_EXISTS("CUST_003", "Customer profile already exists for this user", HttpStatus.CONFLICT),



    // KYC
    KYC_DOCUMENT_NOT_FOUND("KYC_001", "KYC document not found", HttpStatus.NOT_FOUND),
    KYC_ALREADY_PROCESSED("KYC_002", "KYC document has already been processed", HttpStatus.BAD_REQUEST),
    KYC_DOCUMENT_NOT_PENDING("KYC_003", "KYC document is not in PENDING status", HttpStatus.BAD_REQUEST),

    // 8. TRANSACTION PIN
    TRANSACTION_PIN_NOT_SET("PIN_001", "Transaction PIN has not been set up yet", HttpStatus.BAD_REQUEST),
    TRANSACTION_PIN_ALREADY_SETUP("PIN_002", "Transaction PIN is already set up", HttpStatus.BAD_REQUEST),
    INVALID_TRANSACTION_PIN("PIN_003", "Invalid transaction PIN", HttpStatus.BAD_REQUEST),
    TRANSACTION_PIN_LOCKED("PIN_004", "Transaction PIN is temporarily locked due to too many failed attempts. Please try again in 15 minutes.", HttpStatus.FORBIDDEN),

    // 9. NOTIFICATION
    NOTIFICATION_NOT_FOUND("NOTIFICATION_001", "Notification not found", HttpStatus.NOT_FOUND),

    // 10. BENEFICIARY
    BENEFICIARY_NOT_FOUND("BENEFICIARY_001", "Beneficiary not found", HttpStatus.NOT_FOUND),
    BENEFICIARY_ALREADY_EXISTS("BENEFICIARY_002", "Beneficiary already exists", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}