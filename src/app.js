'use strict';

/**
 * ============================================
 * @minervajs/auditlogs – Public API Contracts
 * ============================================
 *
 * Este archivo define ÚNICAMENTE la API pública del paquete.
 */

/**
 * @typedef {'INFO'|'WARN'|'ERROR'|'DEBUG'} LogLevel
 */

/**
 * @typedef {Object} LogEvent
 * @property {string} timestamp  ISO 8601
 * @property {LogLevel|string} level
 * @property {string} source
 * @property {string} message
 * @property {Object} meta
 */

/**
 * Configuración base del Logger / Audit
 *
 * @typedef {Object} LoggerOptions
 * @property {boolean} [enabled]
 * @property {boolean} [useColors]
 * @property {string}  [format]
 * @property {Array<Object>} handlers
 * @property {Array<Function>} [pipeline]
 */

/**
 * Logger técnico (observabilidad y diagnóstico)
 *
 * @class Logger
 */
const Logger = require('./core/Logger');

/**
 * Logger de auditoría formal (no descartable)
 *
 * @class AuditLogger
 */
const Audit = require('./core/Audit');

module.exports = 
{
  Logger,
  Audit
};
