// API utility functions for the seller admin portal

// const API_BASE_URL = 'https://dst-engine-uat.onrender.com';
 export const API_BASE_URL = 'http://localhost:3002';
// export const API_BASE_URL = 'https://sellerengine.onrender.com';

console.log('API Base URL:', API_BASE_URL); // Debug log

interface ApiResponse<T = any> {
  status?: 'SUCCESS' | 'FAILED';
  success?: boolean;
  message: string;
  data?: T;
  errCode?: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get auth token from localStorage if available (for future admin auth)
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      console.log('Response Status:', response.status);
      
      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      console.log('Response Data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      console.error('Request URL:', url);
      console.error('Request Config:', config);
      throw error;
    }
  }

  // Seller Management APIs
  async getPendingSellers() {
    return this.request('/api/seller/sellers/admin/pending');
  }

  async getAllSellers(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/seller/sellers/admin/all${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<{
      sellers: any[];
      pagination?: {
        currentPage: number;
        totalPages: number;
        totalSellers: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>(endpoint);
  }

  async approveSeller(sellerId: string, approvedBy: string) {
    return this.request(`/api/seller/sellers/admin/${sellerId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approvedBy }),
    });
  }

  async rejectSeller(sellerId: string, rejectedBy: string, rejectionReason: string) {
    return this.request(`/api/seller/sellers/admin/${sellerId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectedBy, rejectionReason }),
    });
  }

  async getSellerById(sellerId: string) {
    return this.request(`/api/seller/sellers/${sellerId}`);
  }

  async updateSeller(sellerId: string, sellerData: any) {
    return this.request(`/api/seller/sellers/admin/${sellerId}`, {
      method: 'PUT',
      body: JSON.stringify(sellerData),
    });
  }

  // Seller User Management APIs
  async getSellerUsers(sellerId: string) {
    return this.request(`/api/seller/users/seller/${sellerId}/users`);
  }

  async getAllSellerUsers() {
    return this.request('/api/seller/users/admin/all');
  }

  async getSellerUserById(userId: string) {
    return this.request(`/api/seller/users/${userId}`);
  }

  async updateSellerUserStatus(userId: string, status: 'active' | 'inactive') {
    return this.request(`/api/seller/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateSellerUserByIdAdmin(userId: string, userData: { name?: string; email?: string; phone?: string; userType?: string; status?: string; permissions?: any }) {
    return this.request(`/api/seller/users/admin/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Product Management APIs
  async getAllProducts(params?: { page?: number; limit?: number; status?: string; sellerId?: string; search?: string; category?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/seller/products/admin/all${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<{
      products: any[];
      pagination?: {
        currentPage: number;
        totalPages: number;
        totalProducts: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>(endpoint);
  }

  async updateProductStatus(productId: string, status: 'pending' | 'approved' | 'rejected') {
    return this.request(`/api/seller/products/admin/${productId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateProduct(productId: string, productData: any) {
    return this.request(`/api/seller/products/admin/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  // Main Price Products APIs (TMT, ANGLE products shown in seller app rates)
  async getAllMainProducts() {
    return this.request<{
      success: boolean;
      products: any[];
    }>('/product/admin/all');
  }

  async updateMainProduct(productId: string, productData: { name?: string; price?: number[]; category?: string; saleOpen?: string }) {
    return this.request(`/product/admin/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async getMainProduct(productId: string) {
    return this.request(`/product/admin/${productId}`);
  }

  async createMainProduct(productData: { name: string; price: number[]; category: string; saleOpen?: string }) {
    return this.request('/product/admin/create', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async deleteMainProduct(productId: string) {
    return this.request(`/product/admin/${productId}`, {
      method: 'DELETE',
    });
  }

  // Master Rates Management APIs
  async getAllMasterRates(params?: { page?: number; limit?: number; status?: string; sellerId?: string; search?: string; category?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/seller/master-rates/admin/all${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<{
      rates: any[];
      pagination?: {
        currentPage: number;
        totalPages: number;
        totalRates: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>(endpoint);
  }

  // Bidding Management APIs
  async getAllBids(params?: { status?: string; sellerId?: string; dealerId?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/seller/bidding/all${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<{
      success: boolean;
      count: number;
      data: any[];
    }>(endpoint);
  }

  async getBidById(bidId: string) {
    return this.request(`/api/seller/bidding/bid/${bidId}`);
  }

  async updateBidStatus(bidId: string, status: 'Accepted' | 'Rejected') {
    return this.request(`/api/seller/bidding/status/${bidId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getBidsBySeller(sellerId: string, status?: string) {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    
    const endpoint = `/api/seller/bidding/seller/${sellerId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getBidsByDealer(dealerId: string, status?: string) {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    
    const endpoint = `/api/seller/bidding/dealer/${dealerId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  // Orders Management APIs
  async getAllOrders() {
    return this.request<{
      success: boolean;
      count: number;
      data: any[];
    }>('/api/seller/orders/getall');
  }

  async getOrderById(orderId: string) {
    return this.request(`/api/seller/orders/getone/${orderId}`);
  }

  async getOrdersBySeller(sellerId: string) {
    return this.request(`/api/seller/orders/seller/${sellerId}`);
  }

  async getLastTwoDaysOrders() {
    return this.request('/api/seller/orders/getlasttwodays');
  }

  async getSameDayOrders() {
    return this.request('/api/seller/orders/getsameday');
  }

  async updateOrder(orderId: string, orderData: any) {
    return this.request(`/api/seller/orders/updateone/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(orderId: string) {
    return this.request(`/api/seller/orders/deleteone/${orderId}`, {
      method: 'DELETE',
    });
  }

  // Truck Status Management APIs
  async getAllTruckStatuses() {
    return this.request<{
      success: boolean;
      count: number;
      data: any[];
    }>('/api/seller/truck-status/all');
  }

  async getTruckStatusById(truckId: string) {
    return this.request(`/api/seller/truck-status/status/${truckId}`);
  }

  async getTruckStatusByOrderId(orderId: string) {
    return this.request(`/api/seller/truck-status/order/${orderId}`);
  }

  async getTruckStatusesByDealer(dealerId: string) {
    return this.request(`/api/seller/truck-status/dealer/${dealerId}`);
  }

  async getTruckStatusesBySeller(sellerId: string) {
    return this.request(`/api/seller/truck-status/seller/${sellerId}`);
  }

  async updateTruckStatus(truckId: string, truckData: any) {
    return this.request(`/api/seller/truck-status/update/${truckId}`, {
      method: 'PUT',
      body: JSON.stringify(truckData),
    });
  }

  async getOrderTruckStatusDetails(orderId: string) {
    return this.request(`/api/seller/truck-status/order-details/${orderId}`);
  }

  // Admin Authentication APIs
  async adminLogin(email: string, password: string) {
    return this.request<{
      token: string;
      user: {
        userId: string;
        name: string;
        email: string;
        role: string;
        permissions: string[];
        lastLogin?: string;
      };
    }>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getAdminProfile() {
    return this.request('/admin/auth/profile');
  }

  async updateAdminProfile(data: { name?: string; email?: string }) {
    return this.request('/admin/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changeAdminPassword(data: { currentPassword: string; newPassword: string }) {
    return this.request('/admin/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async adminLogout() {
    return this.request('/admin/auth/logout', {
      method: 'POST',
    });
  }

  // Admin Dashboard APIs
  async getAdminDashboardStats() {
    return this.request<{
      mainStats: {
        sellersCount: number;
        pendingSellersCount: number;
        productsCount: number;
        pendingProductsCount: number;
        bidsCount: number;
        pendingBidsCount: number;
        ordersCount: number;
        inTransitOrdersCount: number;
      };
      detailedStats: any;
      recentActivity: any;
    }>('/admin/dashboard/stats');
  }

  async getRecentActivity(limit?: number) {
    const endpoint = `/admin/dashboard/recent-activity${limit ? `?limit=${limit}` : ''}`;
    return this.request<{
      activities: any[];
      count: number;
    }>(endpoint);
  }

  // Admin-specific APIs (with authentication)
  async adminGetAllBids() {
    return this.request('/api/seller/bidding/admin/all');
  }

  async adminGetAllOrders() {
    return this.request('/api/seller/orders/admin/getall');
  }

  async adminGetAllTruckStatuses() {
    return this.request('/api/seller/truck-status/admin/all');
  }

  async adminUpdateBidStatus(bidId: string, status: 'Accepted' | 'Rejected') {
    return this.request(`/api/seller/bidding/admin/status/${bidId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async adminUpdateTruckStatus(truckId: string, truckData: any) {
    return this.request(`/api/seller/truck-status/admin/update/${truckId}`, {
      method: 'PUT',
      body: JSON.stringify(truckData),
    });
  }

  async adminDeleteOrder(orderId: string) {
    return this.request(`/api/seller/orders/admin/deleteone/${orderId}`, {
      method: 'DELETE',
    });
  }

  // Support Chat APIs - Group Based
  async getAllSupportGroups(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/seller/support-chat/admin/support-groups${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<any[]>(endpoint);
  }

  async getGroupMessages(groupId: string, params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/seller/support-chat/admin/support-groups/${groupId}/messages${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<any[]>(endpoint);
  }

  async sendGroupMessage(groupId: string, message: string) {
    return this.request(`/api/seller/support-chat/admin/support-groups/${groupId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getGroupParticipants(groupId: string) {
    return this.request<any[]>(`/api/seller/support-chat/admin/support-groups/${groupId}/participants`);
  }

  async markGroupMessagesAsRead(groupId: string) {
    return this.request(`/api/seller/support-chat/admin/support-groups/${groupId}/read`, {
      method: 'PUT',
    });
  }

  // Master Categories Management APIs
  async getAllMasterCategories(params?: { status?: 'Active' | 'Inactive'; limit?: number; page?: number }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/seller/master-categories${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<any[]>(endpoint);
  }

  async getMasterCategoryById(id: string) {
    return this.request(`/api/seller/master-categories/${id}`);
  }

  async getCategoriesBySellerIds(sellerIds: string[]) {
    return this.request('/api/seller/master-categories/by-sellers', {
      method: 'POST',
      body: JSON.stringify({ sellerIds }),
    });
  }

  async createMasterCategory(categoryData: { name: string; sellerIds: string[]; status?: 'Active' | 'Inactive' | 'Pending' }) {
    return this.request('/api/seller/master-categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateMasterCategory(id: string, categoryData: { name?: string; sellerIds?: string[]; status?: 'Active' | 'Inactive' | 'Pending' }) {
    return this.request(`/api/seller/master-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteMasterCategory(id: string) {
    return this.request(`/api/seller/master-categories/${id}`, {
      method: 'DELETE',
    });
  }

  async addSellerToCategory(id: string, sellerId: string) {
    return this.request(`/api/seller/master-categories/${id}/sellers/add`, {
      method: 'POST',
      body: JSON.stringify({ sellerId }),
    });
  }

  async removeSellerFromCategory(id: string, sellerId: string) {
    return this.request(`/api/seller/master-categories/${id}/sellers/remove`, {
      method: 'POST',
      body: JSON.stringify({ sellerId }),
    });
  }

  // Activity Log APIs
  async getAllActivities(params?: { page?: number; limit?: number; sellerId?: string; action?: string; category?: string; priority?: string; startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/activity/admin/activities${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<{
      activities: any[];
      pagination?: {
        currentPage: number;
        totalPages: number;
        totalActivities: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>(endpoint);
  }

  async getRecentActivitiesNew(limit?: number) {
    // Using unified activity log (notifications) endpoint
    const endpoint = `/api/seller/notifications/admin/all${limit ? `?limit=${limit}` : ''}`;
    return this.request<{
      activities: any[];
      count: number;
    }>(endpoint);
  }

  async getSellerActivities(sellerId: string, params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/activity/admin/activities/seller/${sellerId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<{
      activities: any[];
      pagination?: {
        currentPage: number;
        totalPages: number;
        totalActivities: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>(endpoint);
  }

  async getOnlineSellers() {
    return this.request<{
      onlineSellers: Array<{
        sellerId: string;
        sellerName: string;
        onlineUsers: Array<{
          userId: string;
          userName: string;
          userType: string;
          lastActivity: string;
          lastHeartbeat: string;
          loginAt: string;
          deviceType: string;
        }>;
      }>;
      totalOnlineUsers: number;
      totalOnlineSellers: number;
    }>('/api/activity/admin/online-sellers');
  }

  async getActivityStats(params?: { sellerId?: string; startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/activity/admin/activities/stats${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async updateHeartbeat() {
    return this.request('/api/activity/heartbeat', {
      method: 'POST',
    });
  }

  // Product Difference APIs
  async getProductDifferenceByProductId(productId: string) {
    return this.request(`/api/seller/product-differences/admin/product/${productId}`);
  }

  async createOrUpdateProductDifference(productId: string, differenceRate: number) {
    return this.request('/api/seller/product-differences/admin/create-update', {
      method: 'POST',
      body: JSON.stringify({ productId, differenceRate }),
    });
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for use in components
export type { ApiResponse };
