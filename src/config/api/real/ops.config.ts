/**
 * Operations Real API Configuration
 * ==================================
 * 
 * Real API endpoints for Operations systems (ServiceNow, Email, etc.).
 * Used for common operations features.
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * - SNOW_API_BASE_URL: ServiceNow instance URL
 * - SNOW_CLIENT_ID: ServiceNow OAuth client ID
 * - SNOW_CLIENT_SECRET: ServiceNow OAuth client secret
 * - SMTP_HOST: SMTP server for email
 * - SMTP_USER: SMTP username
 * - SMTP_PASS: SMTP password
 * 
 * Features covered:
 * - ServiceNow ticket management
 * - Email notifications
 * - User search (common)
 * 
 * @module config/api/real/ops
 */

import type { RealSystemConfig } from '../types';

export const OPS_REAL_CONFIG: RealSystemConfig = {
  // ===========================================================================
  // CONNECTION SETTINGS (ServiceNow)
  // ===========================================================================
  connection: {
    baseUrl: process.env.SNOW_API_BASE_URL || 'https://company.service-now.com/api',
    clientId: process.env.SNOW_CLIENT_ID || '',
    clientSecret: process.env.SNOW_CLIENT_SECRET || '',
    authMethod: 'oauth2',
    tokenEndpoint: '/oauth_token.do',
    timeout: 30000,
  },

  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // ===========================================================================
  // SYSTEM CARDS - Not applicable for ops
  // ===========================================================================
  systemCards: {},

  // ===========================================================================
  // SEARCH - Common user search (delegates to other systems)
  // ===========================================================================
  search: {
    searchUsers: {
      endpoint: '/now/table/sys_user',
      method: 'GET',
      queryParams: ['sysparm_query', 'sysparm_limit', 'sysparm_fields'],
      description: 'Search users in ServiceNow',
      requestMapping: {
        'sysparm_query': 'nameLIKE{query}^ORemailLIKE{query}^ORuser_nameLIKE{query}',
        'sysparm_limit': '50',
        'sysparm_fields': 'sys_id,name,email,user_name,department,title',
      },
      responseMapping: {
        userId: 'user_name',
        name: 'name',
        email: 'email',
        department: 'department.display_value',
      },
    },
    getUserDetails: {
      endpoint: '/now/table/sys_user/{userId}',
      method: 'GET',
      description: 'Get detailed user info from ServiceNow',
      responseMapping: {
        // Full user object
      },
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
    // ServiceNow Incident Operations
    getIncidents: {
      endpoint: '/now/table/incident',
      method: 'GET',
      queryParams: ['sysparm_query', 'sysparm_limit', 'sysparm_fields', 'sysparm_display_value'],
      description: 'Get ServiceNow incidents for user',
      requestMapping: {
        'sysparm_query': 'caller_id.email={email}^ORassigned_to.email={email}',
        'sysparm_limit': '100',
        'sysparm_fields': 'number,short_description,state,priority,sys_updated_on,assigned_to,caller_id',
        'sysparm_display_value': 'true',
      },
      responseMapping: {
        number: 'number',
        description: 'short_description',
        state: 'state',
        priority: 'priority',
        updatedAt: 'sys_updated_on',
        assignedTo: 'assigned_to.display_value',
      },
    },
    createTicket: {
      endpoint: '/now/table/incident',
      method: 'POST',
      description: 'Create new ServiceNow incident',
      requestBody: {
        short_description: '{shortDescription}',
        description: '{description}',
        caller_id: '{callerId}',
        category: 'Identity Management',
        subcategory: '{subcategory}',
        priority: '{priority}',
        assignment_group: '{assignmentGroup}',
        cmdb_ci: '{configurationItem}',
      },
      responseMapping: {
        ticketNumber: 'number',
        ticketId: 'sys_id',
      },
      successMessage: 'Incident created successfully',
    },
    updateTicket: {
      endpoint: '/now/table/incident/{ticketId}',
      method: 'PATCH',
      description: 'Update ServiceNow incident',
      requestBody: {
        work_notes: '{workNotes}',
        state: '{state}',
      },
      successMessage: 'Incident updated',
    },

    // Email Operations
    sendEmail: {
      endpoint: '/now/table/sys_email',
      method: 'POST',
      description: 'Send notification email via ServiceNow',
      requestBody: {
        type: 'smtp-sender',
        recipients: '{recipients}',
        subject: '{subject}',
        body: '{body}',
        content_type: 'text/html',
      },
      successMessage: 'Email sent successfully',
    },

    // User List Operations
    getAllUsers: {
      endpoint: '/now/table/sys_user',
      method: 'GET',
      queryParams: ['sysparm_query', 'sysparm_limit', 'sysparm_fields'],
      description: 'Get all active users',
      requestMapping: {
        'sysparm_query': 'active=true',
        'sysparm_limit': '1000',
        'sysparm_fields': 'sys_id,name,email,user_name,department',
      },
      responseMapping: {
        users: 'result',
      },
    },
  },
};
