/**
 * Module: AuditLogs
 * Type: EXAMPLE
 * Feature: Basic Audit Usage
 * Description:
 * Demonstrates the minimal usage of AuditLogs:
 * - Creating an Audit instance
 * - Configuring console and file handlers
 * - Registering audit events (INFO and CRITICAL)
 
 * - Using minAuditLevel to filter events
 * - Logging to console and file with simple handlers
 * - Minimal configuration for fast setup
 */
 
'use strict';

const { Audit } = require('@minervajs/auditlogs');

const auditService = new Audit('MiAplicacion', 
{
	handlers: [
    { type: 'console' },
    { type: 'file' }
  ]
});

// Auditoría informativa
auditService.audit({
  level: 'INFO',
  action: 'LOGIN',
  entity: 'AUTH',
  userId: 'user01',
  username: 'jdoe',
  ip: '127.0.0.1',
  source: 'WEB'
});

auditService.audit({
  level: 'CRITICAL',
  action: 'DROP_TABLE',
  entity: 'DATABASE',
  user: 'SYSTEM'
});

// Auditoría de evento crítico
auditService.audit({
  level: 'CRITICAL',
  action: 'DELETE',
  entity: 'USERS',
  entityId: 123,
  userId: 'admin',
  username: 'root',
  ip: '127.0.0.1',
  source: 'SYSTEM',
  extra: {
    reason: 'Forced removal'
  }
});
