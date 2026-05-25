'use strict';

/**
 * HandlerFactory
 *
 * Traduce configuraciones declarativas de handlers
 * a instancias internas concretas.
 *
 * Permite registro dinámico de nuevos handlers
 * mediante HandlerFactory.register(type, class).
 *
 * ESTE ARCHIVO NO ES PARTE DE LA API PÚBLICA
 */

const ConsoleHandler = require('../handlers/ConsoleHandler');
const FileHandler    = require('../handlers/FileHandler');
const DbHandler      = require('../handlers/DbHandler');

class HandlerFactory 
{
  /**
   * Registro interno de handlers disponibles
   *
   * @type {Map<string, Function>}
   */
  static registry = new Map();

  /**
   * Inicializa handlers core
   */
  static _initializeCore()
  {
    if (this._coreInitialized) return;

    this.register('console', ConsoleHandler);
    this.register('file', FileHandler);
    this.register('db', DbHandler);

    this._coreInitialized = true;
  }

  /**
   * Permite registrar handlers dinámicamente
   *
   * @param {string} type
   * @param {Function} HandlerClass
   */
  static register(type, HandlerClass)
  {
    if (!type || typeof type !== 'string') return;
    if (typeof HandlerClass !== 'function') return;

    this.registry.set(type, HandlerClass);
  }

  /**
   * Crea instancias de handlers a partir de configuración
   *
   * @param {Array<Object>} configs
   * @returns {Array<Object>} handlers instanciados
   */
  static create(configs = [])
  {
    const handlers = [];
	
	this._initializeCore();

    if (!Array.isArray(configs)) return [];

    for (const config of configs) 
    {
      if (!config || typeof config !== 'object') continue;

      try 
      {
        const HandlerClass = this.registry.get(config.type);

		// tipo desconocido → ignorar silenciosamente
        if (!HandlerClass) continue; 

        handlers.push(new HandlerClass(config));
      } 
      catch 
      {} // Nunca romper el logger
    }

    return handlers;
  }
}

module.exports = HandlerFactory;
