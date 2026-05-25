/**
 * Module: AuditLogs
 * Component: Logger
 * Type: EXAMPLE
 * Feature: Multiple Logger Instances with Different Formats
 * Description:
 * Demonstrates how to use multiple independent Logger instances:
 * - Separate logger contexts (MyApp and MyServer)
 * - Different formatting strategies (JSON-style vs Classic)
 * - Console output with color support
 * - Independent logging flows per instance
 */

'use strict';

const { Logger } = require('@minervajs/auditlogs');

/* ============================================================
 * Instance 1: MyApp
 * Application Logger (JSON format)
 * ============================================================
 */
const myAppLogger = new Logger('MyApp', {
  handlers: [
    {
      type: 'console',
      useColors: true,
      format: '%color.begin%{"hora":"%timestamp%","nivel":"%level%","source":"%source%","msg":"%message%"}%color.end%'
    }
  ]
});

// Todos los niveles usando formato tipo JSON
myAppLogger.debug('Inicializando contexto de aplicación');
myAppLogger.debug('Dependencias cargadas');
myAppLogger.info('Aplicación lista');
myAppLogger.warn('Configuración por defecto en uso');
myAppLogger.error('Error al cargar módulo opcional');
myAppLogger.error('Fallo crítico en inicialización');
myAppLogger.error('Arranque completado');


/* ============================================================
 * Instance 2: MyServer
 * Infrastructure Logger (Classic format)
 * ============================================================
 */
const myServerLogger = new Logger('MyServer', {
  handlers: [
    {
      type: 'console',
      useColors: true,
      format: '%timestamp% %color.begin%[%source%] [%level%]%color.end% %message%'
    }
  ]
});

myServerLogger.debug('Inicializando servidor HTTP');
myServerLogger.debug('Pool de conexiones creado');
myServerLogger.info('Servidor escuchando en puerto 8080');
myServerLogger.warn('Latencia elevada detectada');
myServerLogger.error('Timeout en petición externa');
myServerLogger.error('Servidor no responde');
myServerLogger.error('Servidor recuperado correctamente');

