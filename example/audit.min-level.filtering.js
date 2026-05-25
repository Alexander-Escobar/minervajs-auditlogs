/**
 * Module: AuditLogs
 * Type: EXAMPLE
 * Feature: Audit Instance with Minimum Level Filtering
 * Description:
 * Demonstrates how the minLevel configuration filters audit events
 * based on severity, allowing only events equal to or higher than
 * the defined threshold to be processed by the handlers.
 */


const { Audit } = require('@minervajs/auditlogs');

const audit = new Audit('AuditService',{
  minLevel: 'HIGH',
  handlers: [{
    type: 'console'
  }]
});

audit.audit({ level: 'INFO', action: 'READ', entity: 'User', user: 'admin' });      // ❌ no sale
audit.audit({ level: 'HIGH', action: 'DELETE', entity: 'User', user: 'admin' });    // ✅ sale
audit.audit({ level: 'CRITICAL', action: 'DROP', entity: 'DB', user: 'root' });     // ✅ sale
audit.audit({
  level: 'SECURITY',
  action: 'LOGIN',
  entity: 'UserAccount',
  user: 'juliusmanx',
  context: { ip: '192.168.1.10' }
});