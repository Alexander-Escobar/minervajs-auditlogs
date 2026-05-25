/**
 * Module: AuditLogs
 * Type: EXAMPLE
 * Feature: Audit Instance with Non-Lossy Pipeline and File Rotation
 * Description:
 * Demonstrates the usage of the Audit class with a non-discarding pipeline
 * that enriches events for compliance purposes, combined with file-based
 * handler rotation using maxLines and sequential file naming.
 * Ejemplo exclusivo de auditoría (NO-LOSSY)
 * - Usa AuditLogger
 * - Pipeline NO descartable
 * - Rotación de archivos
 */
'use strict';

const path = require('path');
const { Audit } = require('@minervajs/auditlogs');

// -------------------------------------------------------------
// Pipeline de auditoría (NO descarta eventos)
// - Enriquece
// - Marca cumplimiento
function auditPipeline(event)
{
  return Object.assign({}, event,
  {
    meta: Object.assign({}, event.meta,
    {
      auditedAt: new Date().toISOString(),
      compliance: true
    })
  });
}

// -------------------------------------------------------------
// Instancia de AuditLogger
const auditLogger = new Audit('AuditService',
{
  handlers: [
    {
      type: 'file',
      maxLines: 5, // rotación agresiva para prueba
      format: '%currentline%,%timestamp%,%level%,%source%,%message%',
      fileNameFormat: path.join(
        __dirname,
        'audit-logs',
        'audit-%timestamp%-%sequential%.log'
      )
    }
  ],
  pipeline: [auditPipeline]
});

// -------------------------------------------------------------
// Eventos de auditoría
auditLogger.audit({
  level: 'SECURITY',
  action: 'LOGIN',
  entity: 'UserAccount',
  user: 'juliusmanx',
  context: { ip: '192.168.1.10' }
});

auditLogger.audit({
  level: 'SECURITY',
  action: 'LOGIN',
  entity: 'User',
  user: 'admin',
  context: { ip: '192.168.1.10' }
});

auditLogger.audit({
  level: 'COMPLIANCE',
  action: 'UPDATE',
  entity: 'Role',
  user: 'system',
  context: { role: 'ADMIN' }
});

auditLogger.audit({
  level: 'HIGH',
  action: 'DELETE',
  entity: 'Account',
  user: 'auditor',
  context: { reason: 'inactivity' }
});

auditLogger.audit({
  level: 'CRITICAL',
  action: 'EXPORT',
  entity: 'Database',
  user: 'root',
  context: { tables: ['users', 'roles'] }
});

auditLogger.audit({
  level: 'SECURITY',
  action: 'LOGOUT',
  entity: 'User',
  user: 'admin',
  context: {}
});


auditLogger.audit({
  level: 'COMPLIANCE',
  action: 'EXPORT',
  entity: 'CustomerData',
  user: 'admin',
  context: { format: 'CSV' }
});

auditLogger.audit({
  level: 'CRITICAL',
  action: 'DELETE',
  entity: 'DatabaseRecord',
  user: 'system',
  context: { table: 'users', id: 42 }
});

// Forzar rotación
for (let i = 1; i <= 10; i++)
{
  auditLogger.audit({
    level: 'LOW',
    action: 'READ',
    entity: 'ConfigFile',
    user: 'service',
    context: { index: i }
  });
};