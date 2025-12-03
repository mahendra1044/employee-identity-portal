import { mockDataService, rbacService } from '../services/index.js';

const SYSTEMS = ['ping-directory', 'ping-federate', 'cyberark', 'saviynt', 'azure-ad', 'ping-mfa'];

/**
 * System Group Mapping
 * --------------------
 * Maps each system to its group for data source configuration
 */
const SYSTEM_TO_GROUP = {
  // SSO/Ping Systems
  'ping-directory': 'sso',
  'ping-federate': 'sso',
  'ping-mfa': 'sso',
  'ping-access': 'sso',
  'ping-authorize': 'sso',
  'ping-intelligence': 'sso',
  
  // PAM/CyberArk Systems
  'cyberark': 'pam',
  'cyberark-epm': 'pam',
  'cyberark-alero': 'pam',
  'cyberark-conjur': 'pam',
  'cyberark-dpa': 'pam',
  'cyberark-identity': 'pam',
  
  // IGA/Saviynt Systems
  'saviynt': 'iga',
  'saviynt-certifications': 'iga',
  'saviynt-analytics': 'iga',
  'saviynt-controls': 'iga',
  'saviynt-requests': 'iga',
  'saviynt-provisioning': 'iga',
  
  // Entra ID/Azure AD Systems
  'azure-ad': 'entraId',
  'azure-ad-users': 'entraId',
  'azure-ad-groups': 'entraId',
  'azure-ad-apps': 'entraId',
  'azure-ad-conditional': 'entraId',
  'azure-ad-signin': 'entraId',
  
  // TPAG Systems
  'saviynt-tpag': 'tpag',
  'saviynt-tpag-vendors': 'tpag',
  'saviynt-tpag-contracts': 'tpag',
  'saviynt-tpag-access': 'tpag',
  'saviynt-tpag-risk': 'tpag',
  'saviynt-tpag-lifecycle': 'tpag',
};

/**
 * Get the data source mode for a system
 * @param {string} system - System key
 * @param {object} features - Features configuration
 * @returns {'USE_API' | 'USE_MOCK'} Data source mode
 */
function getDataSourceForSystem(system, features) {
  const group = SYSTEM_TO_GROUP[system];
  if (!group || !features.systemDataSource) {
    // Fallback to global useMocks setting
    return features.useMocks ? 'USE_MOCK' : 'USE_API';
  }
  return features.systemDataSource[group] || 'USE_MOCK';
}

/**
 * Check if a system should use mock data
 * @param {string} system - System key
 * @param {object} features - Features configuration
 * @returns {boolean} True if system should use mock data
 */
function shouldUseMock(system, features) {
  return getDataSourceForSystem(system, features) === 'USE_MOCK';
}

export function setupSystemRoutes(app, features, logger) {
  app.get('/api/own-:system', (req, res) => {
    const system = req.params.system;
    
    if (!SYSTEMS.includes(system)) {
      return res.status(404).json({ error: 'System not found' });
    }
    
    if (!rbacService.isSystemEnabled(system, features)) {
      return res.status(404).json({ error: 'Feature not enabled' });
    }
    
    const role = (req.user && req.user.role) || 'employee';
    if (!rbacService.hasPermission(role, system, 'own')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Check data source mode for this system
    const dataSource = getDataSourceForSystem(system, features);
    const group = SYSTEM_TO_GROUP[system] || 'unknown';
    
    if (shouldUseMock(system, features)) {
      // USE_MOCK: Return mock data
      const data = mockDataService.getSystemData(system);
      logger.info({ msg: 'system_own', system, role, dataSource, group });
      return res.json({ data, _dataSource: 'MOCK' });
    }
    
    // USE_API: Call real API integration
    // TODO: Implement real API calls for each system group
    // For now, return a placeholder indicating real API is not yet implemented
    logger.info({ msg: 'system_own_api', system, role, dataSource, group });
    return res.status(501).json({ 
      error: `Real API for ${group} systems not yet implemented`,
      system,
      group,
      dataSource,
      hint: 'Change systemDataSource in features.json to USE_MOCK, or implement the real API integration'
    });
  });
  
  app.get('/api/own-:system/details/:userId', (req, res) => {
    const { system, userId } = req.params;
    
    if (!SYSTEMS.includes(system)) {
      return res.status(404).json({ error: 'System not found' });
    }
    
    const role = (req.user && req.user.role) || 'employee';
    if (!rbacService.hasPermission(role, system, 'own')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Check data source mode for this system
    const dataSource = getDataSourceForSystem(system, features);
    const group = SYSTEM_TO_GROUP[system] || 'unknown';
    
    if (shouldUseMock(system, features)) {
      // USE_MOCK: Return mock data
      const data = mockDataService.getSystemDetails(system, userId);
      
      if (!data) {
        return res.status(404).json({ error: 'No data found' });
      }
      
      logger.info({ msg: 'system_details', system, userId, dataSource, group });
      return res.json({ data, _dataSource: 'MOCK' });
    }
    
    // USE_API: Call real API integration
    // TODO: Implement real API calls for each system group
    logger.info({ msg: 'system_details_api', system, userId, dataSource, group });
    return res.status(501).json({ 
      error: `Real API for ${group} systems not yet implemented`,
      system,
      group,
      dataSource,
      hint: 'Change systemDataSource in features.json to USE_MOCK, or implement the real API integration'
    });
  });
}
