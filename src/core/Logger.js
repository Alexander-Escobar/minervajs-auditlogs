'use strict';

const Base = require('./Base');
const HandlerFactory = require('./HandlerFactory');

/**
 * Logger técnico
 *
 * Uso:
 * - observabilidad
 * - diagnóstico
 * - depuración
 *
 * NO es auditoría
 * NO es sistema de alertas
 */
class Logger extends Base 
{
  /**
   * @param {string} source  Nombre del logger (ej: app, http, db)
   * @param {Object} options
   * @param {Array<Object>} [options.handlers]
   * @param {Array<Function>} [options.pipeline]
   */
  constructor(source = 'logger', options = {}) 
  {
    // Traducir handlers declarativos → handlers reales
    const resolvedHandlers = HandlerFactory.create(options.handlers);

    // Pasar a Base SOLO lo que Base necesita conocer
    super(source, 
	{
      enabled: options.enabled,
      format: options.format,
      handlers: resolvedHandlers,
      pipeline: options.pipeline
    });
  }

  /**
   * Log informativo
   */
  info(message, meta = {}) 
  { return this.emit('INFO', message, meta); }

  /**
   * Advertencia
   */
  warn(message, meta = {}) 
  { return this.emit('WARN', message, meta); }

  /**
   * Error técnico
   */
  error(message, meta = {}) 
  { return this.emit('ERROR', message, meta); }

  /**
   * Depuración
   */
  debug(message, meta = {}) 
  { return this.emit('DEBUG', message, meta); }
}

module.exports = Logger;
