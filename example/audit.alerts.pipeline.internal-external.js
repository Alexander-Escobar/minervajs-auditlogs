/**
 * Module: AuditLogs
 * Type: EXAMPLE
 * Feature: Audit Pipeline with Internal and External Alert Dispatch
 * Description:
 * Demonstrates a multi-step non-lossy audit pipeline that evaluates
 * critical events and triggers both internal console alerts and
 * external service notifications, while maintaining full event flow.
 */

const { Audit } = require('@minervajs/auditlogs');

/* ======================================================
   External Alert Service (infra layer)
====================================================== */
class ExternalAlertService 
{
  async send(payload) 
  {
    // Aquí iría Filtro externo, NO BLOQUEANTE
	// Consulta criterios con reddis, cache, memoria
    console.log('🌍 EXTERNAL ALERT SENT:', payload);
  }
}

const externalAlertService = new ExternalAlertService();


/* ======================================================
   Pipeline Steps (application layer)
====================================================== */

const criticalAuditFilter = (event) => 
{
  const isCritical = event.meta?.audit && event.level === 'CRITICAL';
  return isCritical ? event : event; // mantiene NO-LOSSY
};

const internalAlertStep = (event) => 
{
  if (event.meta?.audit && event.level === 'CRITICAL') 
  { console.log(`🚨 INTERNAL ALERT → ${event.meta.action} on ${event.meta.entity}`); }
  return event;
};

const externalAlertStep = (event) => 
{
  if (event.meta?.audit && event.level === 'CRITICAL') 
  {
    externalAlertService.send({
      source: event.source,
      action: event.meta.action,
      entity: event.meta.entity,
      user: event.meta.user,
      timestamp: event.timestamp
    });
  }
  return event;
};


/* ======================================================
   Audit Instance
====================================================== */

const audit = new Audit('AlertsApp', {
  enabled: true,
  minLevel: 'INFO',

  pipeline: [
    criticalAuditFilter,
    internalAlertStep,
    externalAlertStep
  ],
  handlers: [
    { type: 'console' }
  ]
});


/* ======================================================
   Trigger
====================================================== */

audit.audit({
  level: 'CRITICAL',
  action: 'DROP_TABLE',
  entity: 'DATABASE',
  user: 'SYSTEM'
});


