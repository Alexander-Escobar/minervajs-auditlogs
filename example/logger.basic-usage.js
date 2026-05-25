/**
 * Module: AuditLogs
 * Component: Logger
 * Type: EXAMPLE
 * Feature: Basic Multi-Handler Configuration
 * Description:
 * Demonstrates basic Logger usage including:
 * - Logger instantiation
 * - Multiple handler configuration (console + file)
 * - Custom output formatting
 * - Console color support
 * - File rotation using maxLines
 * - Runtime console line counter reset
 */
 
const { Logger } = require('@minervajs/auditlogs');

const logger = new Logger('ExampleService', 
{
  handlers: [
    {
      type: 'console',
	  format: '%timestamp% [%prefix%] [%level%] %message%',
      useColors: true
    },
    {
      type: 'file',
      filenameBase: 'app.log',
	  format: '%timestamp% [%prefix%] [%level%] %message%',
      maxLines: 5000
    }
  ]
});

logger.info('Aplicación iniciada');
logger.debug('Configuración cargada');
logger.warn('Uso elevado de memoria');
logger.error('Error de conexión a base de datos');
logger.resetConsoleLineCounter();
logger.info('Contador reiniciado');
