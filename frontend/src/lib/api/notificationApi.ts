import { apiClient } from '../axios';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  referenceType?: string;
  referenceId?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationPageResponse {
  content: NotificationItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export const notificationApi = {
  /**
   * GET /api/v1/notifications
   * Lấy danh sách thông báo phân trang
   */
  async getMyNotifications(page = 0, size = 15): Promise<ApiResponse<NotificationPageResponse>> {
    const res = await apiClient.get<ApiResponse<NotificationPageResponse>>('/notifications', {
      params: { page, size },
    });
    return res.data;
  },

  /**
   * GET /api/v1/notifications/unread-count
   * Đếm số lượng thông báo chưa đọc
   */
  async getUnreadCount(): Promise<ApiResponse<number>> {
    const res = await apiClient.get<ApiResponse<number>>('/notifications/unread-count');
    return res.data;
  },

  /**
   * PUT /api/v1/notifications/{id}/read
   * Đánh dấu 1 thông báo là đã đọc
   */
  async markAsRead(id: string): Promise<ApiResponse<void>> {
    const res = await apiClient.put<ApiResponse<void>>(`/notifications/${id}/read`);
    return res.data;
  },

  /**
   * PUT /api/v1/notifications/read-all
   * Đánh dấu tất cả là đã đọc
   */
  async markAllAsRead(): Promise<ApiResponse<void>> {
    const res = await apiClient.put<ApiResponse<void>>('/notifications/read-all');
    return res.data;
  },
};
