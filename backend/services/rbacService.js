import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rolesPath = path.join(__dirname, '../config/roles.json');

class RBACService {
  constructor() {
    this.roles = JSON.parse(fs.readFileSync(rolesPath, 'utf-8'));
  }
  
  getRoleFromEmail(email) {
    const lower = (email || '').toLowerCase();
    
    // Check for specialized ops modes first (order matters)
    if (lower.startsWith('sso_ops@') || lower.includes('sso_ops@')) return 'sso_ops';
    if (lower.startsWith('pam_ops@') || lower.includes('pam_ops@')) return 'pam_ops';
    if (lower.startsWith('iga_ops@') || lower.includes('iga_ops@')) return 'iga_ops';
    if (lower.startsWith('tpag_ops@') || lower.includes('tpag_ops@')) return 'tpag_ops';
    
    // Check for general ops
    if (lower.startsWith('ops@')) return 'ops';
    
    // Check for management
    if (lower.startsWith('management@')) return 'management';
    
    // Default to employee
    return 'employee';
  }
  
  isSystemEnabled(system, features) {
    return !!(features?.systems && features.systems[system]);
  }
  
  hasPermission(role, system, permission) {
    const roleObj = this.roles[role] || this.roles['employee'];
    return !!(roleObj && roleObj[system] && roleObj[system][permission]);
  }
}

export const rbacService = new RBACService();
