/**
 * Module: AuditLogs
 * Type: EXAMPLE
 * Feature: Multiple Logger Instances with File Rotation and Custom Console Format
 * Description:
 * Demonstrates two independent Logger instances configured with
 * file handlers, including custom JSON-style formatting,
 * and file rotation using maxLines.
 */
'use strict';

const path = require('path');
const { Logger } = require('@minervajs/auditlogs');

/**
 * Logger principal de aplicación
 */
const appLogger = new Logger('MyApp', 
{
  handlers: [
    {
      type: 'file',
      maxLines: 10, // rotación agresiva para prueba
      format: '{id:%currentline%} {hora:"%timestamp%"} {nivel:"%level%"} {source:"%source%"} {msg:"%message%"}',
      fileNameFormat: path.join( __dirname, 'MyApp', 'MyApp-%timestamp%-%sequential%.log' )
    }
  ]
});


/**
 * Logger del servidor
 */
const serverLogger = new Logger('MyServer', { handlers: [{type: 'file', maxLines: 10}] });

appLogger.info('Log entry 1');
appLogger.debug('Log entry 2');
appLogger.warn('Log entry 3');
appLogger.error('Log entry 4');
appLogger.info('Log entry 5');
appLogger.info('Log entry 6');
appLogger.debug('Log entry 7');
appLogger.info("Línea 8 de log.");
appLogger.info("Línea 9 de log.");
appLogger.info("Línea 10 de log."); // Debería rotar después de esta linea
appLogger.info("Línea 11 de log.");
appLogger.info("Línea 12 de log.");
appLogger.info("Línea 13 de log en el nuevo archivo.");
appLogger.info("Línea 14 log en el nuevo archivo.");
appLogger.info("Línea 15 log en el nuevo archivo.");
appLogger.debug("Mensaje de depuración.");
appLogger.error("¡Un error ha ocurrido!");
appLogger.warn("¡Un aviso!");

// Debería rotar aquí, nuevamente
for (let i = 0; i < 20; i++) 
{ appLogger.info(`Mensaje de prueba ${i + 1}`); }

for (let i = 0; i < 20; i++) 
{ serverLogger.info(`Mensaje de prueba ${i + 1}`); }
serverLogger.debug("Mensaje de depuración.");
serverLogger.error("¡Un error ha ocurrido!");
serverLogger.warn("¡Un aviso!");

