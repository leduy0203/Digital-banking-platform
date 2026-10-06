import { apiClient } from './axios';
import { 
  BankAccount, 
  TransferRequest, 
  TransferReceipt, 
  OtpVerificationPayload, 
  Beneficiary, 
  CreateBeneficiaryPayload
} from './types';
import { mockCustomerAccounts, mockBeneficiaries } from './mock/customerData';

export { employeeApi } from './api/employeeApi';
export { adminApi } from './api/adminApi';
export { authApi } from './api/authApi';
export { mediaApi } from './api/mediaApi';
export { customerApi } from './api/customerApi';
export { notificationApi } from './api/notificationApi';
export type { NotificationItem, NotificationPageResponse } from './api/notificationApi';
export type { RegisterPayload, RegisterResponse, SendOtpPayload, SendOtpResponse, VerifyOtpPayload, VerifyOtpResponse, LoginPayload, LoginResponse, AuthResponseData, UserSummary } from './api/authApi';
export type { UploadKycImageResponse, KycDocType } from './api/mediaApi';
export type { CustomerOnboardingPayload, CustomerProfile, CustomerResponse, UpdateProfilePayload } from './api/customerApi';

export * from './types/employee';
export * from './types/admin';


export { accountApi } from './api/accountApi';
export type { AccountResponseData, AccountsListResponse, AccountLookupResponseData } from './api/accountApi';

export { transferApi } from './api/transferApi';
export type {
  InternalTransferInitiatePayload,
  TransferInitiateResponseData,
  InternalTransferInitiateApiResponse,
  InternalTransferConfirmPayload,
  InternalTransferConfirmApiResponse,
  TransactionResponseData,
} from './api/transferApi';

export { transactionApi } from './api/transactionApi';
export type {
  TransactionSummaryData,
  PageResponse,
  TransactionHistoryFilterParams,
  TransactionHistoryApiResponse,
  SingleTransactionApiResponse,
} from './api/transactionApi';

export { beneficiaryApi } from './api/beneficiaryApi';
export type { BeneficiaryItem, CreateBeneficiaryPayload } from './api/beneficiaryApi';

