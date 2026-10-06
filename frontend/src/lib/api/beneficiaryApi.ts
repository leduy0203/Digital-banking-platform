import { apiClient } from '../axios';

export interface BeneficiaryItem {
  id: string;
  accountNumber: string;
  beneficiaryName: string;
  bankCode: string;
  aliasName?: string;
  createdAt: string;
}

export interface CreateBeneficiaryPayload {
  accountNumber: string;
  beneficiaryName: string;
  aliasName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export const beneficiaryApi = {
  /**
   * GET /api/v1/beneficiaries
   */
  async getMyBeneficiaries(): Promise<ApiResponse<BeneficiaryItem[]>> {
    const res = await apiClient.get<ApiResponse<BeneficiaryItem[]>>('/beneficiaries');
    return res.data;
  },

  /**
   * POST /api/v1/beneficiaries
   */
  async createBeneficiary(payload: CreateBeneficiaryPayload): Promise<ApiResponse<BeneficiaryItem>> {
    const res = await apiClient.post<ApiResponse<BeneficiaryItem>>('/beneficiaries', payload);
    return res.data;
  },

  /**
   * DELETE /api/v1/beneficiaries/{id}
   */
  async deleteBeneficiary(id: string): Promise<ApiResponse<void>> {
    const res = await apiClient.delete<ApiResponse<void>>(`/beneficiaries/${id}`);
    return res.data;
  },
};
