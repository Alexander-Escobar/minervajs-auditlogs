'use strict';

/**
 * DbHandler
 * ES: Persistencia en base de datos
 * EN: Database event handler
 *
 * Recibe un executor que será invocado con el evento.
 * No maneja conexión ni transformación de datos.
 */
class DbHandler 
{
  /**
   * @param {Object} config
   * @param {Function} config.executor - función que recibe el evento
   */
  constructor(config = {}) 
  {
    if (!config || typeof config.executor !== 'function') 
	{ throw new Error('DbHandler requires an executor function'); }

    this.executor = config.executor;
  }

  /**
   * Maneja el evento
   * @param {Object} event
   */
  async handle(event) 
  {
    try 
	{ await this.executor(event); } 
	catch 
	{
      // Nunca romper el logger
    }
  }
}

module.exports = DbHandler;
