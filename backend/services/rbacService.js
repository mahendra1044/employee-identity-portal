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
    if (lower.startsWith('ops@')) return 'ops';
    if (lower.startsWith('management@')) return 'management';
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
