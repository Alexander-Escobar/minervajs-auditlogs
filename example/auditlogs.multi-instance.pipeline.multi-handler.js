/**
 * Module: AuditLogs
 * Type: EXAMPLE
 * Feature: Multi Instance Logger with Multiple Handlers, Pipeline Processing and File Rotation
 * Description:
 * Demonstrates the configuration of multiple Logger instances using console,
 * file (with rotation), and database handlers, including pipeline filtering
 * and event enrichment.
 */



const path = require('path');
const { Logger } = require('@minervajs/auditlogs');

// -------------------------------------------------------------
// Función simulada para DB
async function saveToDB(event) 
{
  console.log('[DB SIMULADA] Guardando evento:', event);
}

// -------------------------------------------------------------
// Pipeline de ejemplo
function pipelineFilter(event) 
{
	// Filtrar logs DEBUG
	if (event.level === 'DEBUG') return null;

	// Agregar información adicional
	return Object.assign({}, event, 
	{
		meta: Object.assign({}, event.meta, 
		{
			processedAt: new Date().toISOString()
		})
	});

}

// -------------------------------------------------------------
// Instancia 1: Logger de la app principal
const appLogger = new Logger('MyApp', 
{
  handlers: [
    {
      type: 'console',
      useColors: true,
      format: '%currentline% %color.begin% [%timestamp%] %source%%color.end% %level% - %message%',
      maxLines: 10 // contador de líneas para prueba
    },
    {
      type: 'file',
      maxLines: 10, // rotación a cada 10 líneas
      format: '%currentline%,%timestamp%,%source%,%level%,%message%',
	  fileNameFormat: path.join(__dirname, 'logs','MyApp%timestamp%-%sequential%.log')
    },
    {
      type: 'db',
      executor: saveToDB
    }
  ],
  pipeline: [pipelineFilter]
});

// -------------------------------------------------------------
// Instancia 2: Logger de autenticación
const authLogger = new Logger('AuthModule', 
{
  handlers: [
    {
      type: 'console',
      useColors: false,
      format: '[%timestamp%] %source% %level% %message%',
      maxLines: 10
    },
    {
      type: 'file',
      maxLines: 10,
	  fileNameFormat: path.join(__dirname, 'logs','auth%timestamp%-%sequential%.log')
    }
  ],
  pipeline: 
  [
	(event) => Object.assign({}, event, 
	{ message: '[AUTH] ' + event.message })  // Adiciona a cada mensaje '[AUTH] '
  ]
});

// -------------------------------------------------------------
// Uso de los loggers (generar más de 10 líneas para probar rotación)
for (let i = 1; i <= 15; i++) 
{
  appLogger.info(`Aplicación info #${i}`);
  appLogger.warn(`Aplicación warning #${i}`);
  authLogger.info(`Login info #${i}`);
  authLogger.error(`Login error #${i}`);
}

// DEBUG debe ser filtrado por pipeline
appLogger.debug('Mensaje NO se escribe');

appLogger.error('Error crítico final');
authLogger.warn('Advertencia final');

