/**
 * API Client for backend communication
 */

import axios, { AxiosInstance, AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add response interceptor for better error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.data) {
          const errorData = error.response.data as { detail?: string };
          throw new Error(errorData.detail || `Request failed with status ${error.response.status}`);
        }
        throw new Error(error.message || "Network error");
      }
    );
  }

  // Auth endpoints
  async getLoginUrl(): Promise<{ authorization_url: string; state: string }> {
    const response = await this.client.get("/auth/login");
    return response.data;
  }

  async handleCallback(code: string): Promise<{
    access_token: string;
    user: {
      id: string;
      email: string;
      google_id: string;
      created_at: string;
    };
  }> {
    const response = await this.client.get(`/auth/callback?code=${code}`);
    return response.data;
  }

  async getCurrentUser(userId: string): Promise<{
    id: string;
    email: string;
    google_id: string;
    created_at: string;
  }> {
    const response = await this.client.get(`/auth/me?user_id=${userId}`);
    return response.data;
  }

  // Chat endpoints
  async sendMessage(
    userId: string,
    message: string,
    conversationHistory: Array<{ role: string; content: string; metadata?: Record<string, unknown> | null }> = []
  ): Promise<{
    message: string;
    action_taken: string | null;
    metadata: Record<string, unknown> | null;
  }> {
    const response = await this.client.post(`/chat/message?user_id=${userId}`, {
      message,
      conversation_history: conversationHistory,
    });
    return response.data;
  }

  async getChatHistory(userId: string, limit: number = 50): Promise<
    Array<{
      id: string;
      user_id: string;
      role: string;
      content: string;
      metadata: Record<string, unknown> | null;
      created_at: string;
    }>
  > {
    const response = await this.client.get(
      `/chat/history?user_id=${userId}&limit=${limit}`
    );
    return response.data;
  }
}

export const apiClient = new ApiClient();
