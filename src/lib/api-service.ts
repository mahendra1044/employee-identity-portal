/**
 * Centralized API service with automatic token management
 */

import { API_BASE, STORAGE_KEYS } from "./constants";
import { ErrorHandler } from "./error-handler";
import { StorageService } from "./storage";
import type { Features, LoginResponse, SystemKey, SystemData, SnowResponse } from "./types";

export class APIService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  /**
   * Load token from storage
   */
  private loadToken(): void {
    this.token = StorageService.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Set token for subsequent requests
   */
  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      StorageService.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      StorageService.removeItem(STORAGE_KEYS.TOKEN);
    }
  }

  /**
   * Make authenticated API request
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await ErrorHandler.parseResponseError(response);
      throw new Error(error);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * Get configuration and features
   */
  async getFeatures(): Promise<Features> {
    return this.request<Features>("/config/features");
  }

  /**
   * Get system data for current user
   */
  async getSystemData(system: SystemKey): Promise<SystemData> {
    return this.request<SystemData>(`/api/own-${system}`);
  }

  /**
   * Get detailed system data for current user
   */
  async getSystemDetails(system: SystemKey): Promise<SystemData> {
    return this.request<SystemData>(`/api/own-${system}/details`);
  }

  /**
   * Search for employee
   */
  async searchEmployee(query: string): Promise<any[]> {
    const response = await this.request<{ results?: any[] }>(
      `/api/search-employee?q=${encodeURIComponent(query)}`
    );
    return response.results || [];
  }

  /**
   * Get employee details for specific system
   */
  async getEmployeeSystemDetails(
    userId: string,
    system: SystemKey
  ): Promise<SystemData> {
    return this.request<SystemData>(
      `/api/search-employee/${encodeURIComponent(userId)}/details?system=${system}`
    );
  }

  /**
   * Get SNOW incidents
   */
  async getSnowIncidents(email?: string): Promise<SnowResponse> {
    const query = email ? `?email=${encodeURIComponent(email)}` : "";
    return this.request<SnowResponse>(`/api/snow/incidents${query}`);
  }

  /**
   * Submit SNOW ticket
   */
  async submitSnowTicket(data: {
    short_description: string;
    description: string;
    assigned_to?: string;
  }): Promise<any> {
    return this.request("/api/snow/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Get all system data for user (multi-system)
   */
  async getAllSystemsData(): Promise<Record<SystemKey, any>> {
    return this.request<Record<SystemKey, any>>("/api/all-systems");
  }

  /**
   * Generic GET request
   */
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  /**
   * Generic POST request
   */
  async post<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Generic PUT request
   */
  async put<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Generic DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

/**
 * Singleton instance
 */
export const apiService = new APIService();
