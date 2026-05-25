'use strict';

const EventPipeline = require('./EventPipeline');

/**
 * Base logger compartido
 *
 * Responsabilidades:
 * - Construir eventos
 * - Ejecutar pipeline
 * - Despachar a handlers
 * - Nunca romper la aplicación
 */
class Base 
{
  /**
   * @param {string} source  Nombre del logger (ej: app, auth, audit)
   * @param {Object} options
   * @param {boolean} [options.enabled=true]
   * @param {string}  [options.format]
   * @param {Array<Object>} options.handlers
   * @param {Array<Function>} [options.pipeline]
   */
  constructor(source, options = {}) 
  {
    this.source = source;

    this.enabled = options.enabled !== false;

    this.format = options.format ?? '[%timestamp%] [%source%] [%level%] %message%';

    this.handlers = Array.isArray(options.handlers)
      ? options.handlers
      : [];

    this.pipeline = new EventPipeline(options.pipeline ?? []);
  }

  /**
   * Construye un evento base inmutable
   * @private
   */
  _buildEvent(level, message, meta = {}) {
    return Object.freeze({
      timestamp: new Date().toISOString(),
      level,
      source: this.source,
      message: String(message),
      meta: meta && typeof meta === 'object' ? meta : {}
    });
  }

  /**
   * Emisión base del evento
   *
   * @param {string} level
   * @param {string} message
   * @param {Object} [meta]
   */
  async emit(level, message, meta = {}) 
  {
    if (!this.enabled) return;

    let event;

    try 
	{ event = this._buildEvent(level, message, meta); } 
	catch 
	{ return; }

    let processed;

    try 
	{ processed = this.pipeline.run(event); } 
	catch 
	{ return; }

    if (!processed) return;

    await this._dispatch(processed);
  }

  /**
   * Despacha el evento a los handlers configurados
   * @private
   */
  async _dispatch(event) 
  {
    for (const handler of this.handlers) 
	{
      if (!handler || typeof handler.handle !== 'function') continue;

      try 
	  {
        await handler.handle(event);
      } 
	  catch 
	  {
        // El logger JAMÁS debe romper el flujo
      }
    }
  }
}

module.exports = Base;
