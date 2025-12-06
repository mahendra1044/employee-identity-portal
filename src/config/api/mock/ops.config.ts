/**
 * Operations Mock API Configuration
 * ==================================
 * 
 * Mock API endpoints for Operations systems (ServiceNow, Email, etc.).
 * Used for common operations features across all system groups.
 * 
 * Features covered:
 * - ServiceNow ticket management
 * - Email notifications
 * - User search (common)
 * - All users list
 * 
 * @module config/api/mock/ops
 */

import type { MockSystemConfig } from '../types';

export const OPS_MOCK_CONFIG: MockSystemConfig = {
  // ===========================================================================
  // CONNECTION (Mock - uses local Next.js API routes)
  // ===========================================================================
  connection: {
    baseUrl: '',
    authMethod: 'none',
    timeout: 30000,
  },

  headers: {
    'Content-Type': 'application/json',
  },

  // ===========================================================================
  // SYSTEM CARDS - Not applicable for ops (uses other system cards)
  // ===========================================================================
  systemCards: {},

  // ===========================================================================
  // SEARCH - Common user search
  // ===========================================================================
  search: {
    searchUsers: {
      endpoint: '/api/search-employee/{query}',
      method: 'GET',
      description: 'Search users across all systems',
      mockFile: 'all-users.json',
    },
    getUserDetails: {
      endpoint: '/api/search-employee/{query}/details',
      method: 'GET',
      description: 'Get detailed user info across systems',
      mockFile: 'user-details.json',
    },
  },

  // ===========================================================================
  // FAILURES - Not applicable for ops config
  // ===========================================================================
  failures: {},

  // ===========================================================================
  // QUICK ACTIONS - ServiceNow and Email operations
  // ===========================================================================
  quickActions: {
    // ServiceNow Operations
    getIncidents: {
      endpoint: '/api/snow/incidents?email={email}',
      method: 'GET',
      description: 'Get ServiceNow incidents for user',
      mockFile: 'snow-incidents.json',
    },
    createTicket: {
      endpoint: '/api/submit-snow-ticket',
      method: 'POST',
      description: 'Create new ServiceNow ticket',
      mockResponse: { 
        success: true, 
        ticketNumber: 'INC0010099',
        message: 'Ticket created successfully' 
      },
    },
    
    // Email Operations
    sendEmail: {
      endpoint: '/api/send-email',
      method: 'POST',
      description: 'Send notification email',
      mockResponse: { 
        success: true, 
        message: 'Email sent successfully' 
      },
    },

    // User List Operations
    getAllUsers: {
      endpoint: '/api/all-users',
      method: 'GET',
      description: 'Get all users list',
      mockFile: 'all-users.json',
    },
  },
};
