/** @module Audit_Logs */
const fs = require('node:fs/promises');
const path = require('node:path');
const fetch = global.fetch || require('node-fetch');


// Códigos de escape ANSI para colores
const colores = 
{
  reset: '\x1b[0m',
  rojo: '\x1b[31m',			//
  verde: '\x1b[32m',		//
  amarillo: '\x1b[33m',		//
  azul: '\x1b[34m',			//
  magenta: '\x1b[35m',
  cian: '\x1b[36m',
  gris: '\x1b[90m',			//
};

// Niveles de auditoría
// const AUDIT_LEVELS = {
//   LOW: 'LOW',
//   MEDIUM: 'MEDIUM',
//   HIGH: 'HIGH',
//   CRITICAL: 'CRITICAL'
// };

const AUDIT_LEVELS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4
};


/**
 * Clase Audit_Logs personalizada que permite registrar mensajes en la consola con colores
 * por nivel y también guardarlos en archivos de log rotativos basados en el número de líneas.
 */
class AuditLogs 
{
  /**
   * Crea una instancia del Audit_Logs.
   * @param {string} [prefijo=''] - Un prefijo opcional que se añadirá a cada mensaje de log.
   * @param {string} [filenameBase='app.log'] - El nombre base del archivo de log. Se le
   * añadirá un sufijo numérico para la rotación.
   * @param {boolean} [useColors=true] - Indica si se deben usar colores en la salida de la consola.
   * @param {number} [maxLines=10000] - El número máximo de líneas por archivo de log antes de la rotación.
   * @param {boolean} [writeToDisk=false] - Indica si se realizaran escrituras a disco en paralelo despues de la escritura en consola.
   */
  constructor(prefijo = 'AuditLogs', options = {}) 
  {
	  
	/**
	* Configuración de auditoría
	*/
	this.auditConfig = options?.audit ?? {};
	this.minAuditLevel = AUDIT_LEVELS[this.auditConfig?.minAuditLevel] ?? AUDIT_LEVELS.LOW;
	
	/**
	* Configuración de Webhook
	*/
	this.webhook = {
		enabled: this.auditConfig?.webhook?.enabled ?? false,
		url: this.auditConfig?.webhook?.url ?? null,
		headers: this.auditConfig?.webhook?.headers ?? {},
		levels: this.auditConfig?.webhook?.levels ?? ['CRITICAL'],
		timeout: this.auditConfig?.webhook?.timeout ?? 5000
	};

    /**
     * El prefijo que se añade a cada mensaje de log.
     * @type {string}
     */
    this.prefijo = prefijo;
	
    /**
     * El nombre base del archivo de log.
     * @type {string}
     */
    this.filenameBase = path.resolve(__dirname, options?.filenameBase ?? 'app.log');

    /**
     * Indica si se deben usar colores en la salida de la consola.
     * @type {boolean}
     */
	this.useColors = options?.useColors ?? true;

    /**
     * Indica si se realizaran escrituras en modo depuracion, esto permite adicionar caracteristicas de depuracion, como maxLines < 100 lineas.
     * @type {boolean}
     */
	this.debugger = options?.debuger ?? false;

    /**
     * El número máximo de líneas por archivo de log antes de la rotación.
	 * No se permite un minimo menor a 100 lineas a menos que estemos trabajando en modo debug = true
     * @type {number}
     */
	this.maxLines = options?.maxLines ?? 10000;
	if (this.maxLines < 100 && this.debugger === false)
	{ this.maxLines = 100; }

    /**
     * Indica si se realizaran escrituras a disco en paralelo despues de la escritura en consola.
     * @type {boolean}
     */
	this.writeToDisk = options?.writeToDisk ?? false;
	
    /**
     * Permitir a los usuarios definir su propio formato para las líneas de log.
	 * Esto podría incluir el orden de los elementos (timestamp, prefijo, nivel, mensaje), la inclusión de información adicional (como el nombre del archivo y la línea donde se generó el log)
	 * o formatos más estructurados (como JSON)
     * @type {string}
     */
	this.format = options?.format ?? '[%timestamp%] [%prefix%]%colorbegin% [%level%] %message% %colorend%';
	

    /**
     * El número de línea actual en el archivo de log actual.
     * @private
     * @type {number}
     */
    this.currentLineCount = 0;

    /**
     * El número de secuencia del archivo de log actual.
     * @private
     * @type {number}
     */
    this.fileSequence = 1;

    /**
     * La ruta completa del archivo de log actual.
     * @private
     * @type {string}
     */
    this.currentFilename = this.getFilename();

    /**
     *  Cola de promesas para asegurar el orden de escritura
     * @private
     * @type {Promise}
     */	
    this.writeQueue = Promise.resolve();
	
	this.start(`Prefijo:            ${this.prefijo}`);
	this.start(`Nombre Archivo Base:${this.filenameBase}`);
	this.start(`Uso de Color:       ${this.useColors}`);
	this.start(`Max Lineas:         ${this.maxLines}`);
	this.start(`Escritura a Disco:  ${this.writeToDisk}`);
  }

  /**
   * Genera el nombre del archivo de log actual basado en el nombre base y la secuencia.
   * @private
   * @returns {string} La ruta completa del archivo de log actual.
   */
  getFilename() 
  {
    const { name, ext } = path.parse(this.filenameBase);
    // return `${name}-${this.fileSequence}${ext}`;
	return path.join( path.dirname(this.filenameBase), `${name}-${this.fileSequence}${ext}`);

  }

  /**
   * Rota el archivo de log actual, cerrándolo y creando uno nuevo con la siguiente secuencia.
   * No necesitamos explícitamente cerrar el archivo con appendFile; el sistema operativo se encarga.
   * La próxima escritura a un archivo con un nombre diferente creará uno nuevo.
   * @async
   * @private
   */
  async rotateLogFile() 
  {
    this.currentLineCount = 0;
    this.fileSequence++;
    this.currentFilename = this.getFilename();
  }

  /**
   * Registra un mensaje con el nivel especificado.
   * @async
   * @param {string} nivel - El nivel del log ('info', 'debug', 'warn', 'error').
   * @param {string} mensaje - El mensaje que se va a registrar.
   */
  log(nivel, mensaje)
  {
    const ahora = new Date().toISOString();
    const nivelTexto = nivel.toUpperCase();
    let lineaConsola = this.formatLog(nivel, mensaje);
    const lineaArchivo = this.formatLog(nivel, mensaje, "archivo"); //`[${ahora}] [${this.prefijo}] [${nivelTexto}] ${mensaje}\n`;

	// Mostrar en consola
    console.log(lineaConsola);

	// Escribir en archivo
	// Si writeToDisk es false, simplemente omitimos la escritura.
    if (this.writeToDisk) 
	{
	  // Encolar la operación de escritura
      this.writeQueue = this.writeQueue.then(async () => {
        try 
		{
          this.currentLineCount++;
          if (this.currentLineCount >= this.maxLines) 
		  { await fs.appendFile(this.currentFilename, lineaArchivo + `Rotando archivo de log ${this.currentFilename}\r`, 'utf8');
			await this.rotateLogFile(); }
		  else
		  { await fs.appendFile(this.currentFilename, lineaArchivo, 'utf8'); }
        } 
		catch (error) 
		{
          console.error('Error al escribir en el archivo de log:', error);
          return Promise.resolve();
        }
      });
    }
  }
  
  formatLog(a_nivel, a_mensaje, a_tipo = 'consola') 
  {
	let l_formatted = this.format || '[%timestamp%] [%prefix%]%colorbegin% [%level%] %message% %colorend%';
	const l_now = new Date().toISOString();
	
	l_formatted = l_formatted.replace('%timestamp%', l_now);
	l_formatted = l_formatted.replace('%level%', a_nivel.toUpperCase());
	l_formatted = l_formatted.replace('%prefix%', this.prefijo);
	
	if (a_tipo == 'archivo')
	{
		l_formatted = l_formatted.replace('%colorbegin%', '');
		l_formatted = l_formatted.replace('%colorend%', '');
		l_formatted = l_formatted + '\n';
	}

	// Aplicar colores a la salida de la consola
    if (this.useColors)
	{
      switch (a_nivel)
	  {
        case 'start': 
			l_formatted = l_formatted.replace('%colorbegin%', colores.gris);
			l_formatted = l_formatted.replace('%colorend%', colores.reset);
			break;
        case 'info': 
			l_formatted = l_formatted.replace('%colorbegin%', colores.verde);
			l_formatted = l_formatted.replace('%colorend%', colores.reset);
			break;
        case 'debug': 
			l_formatted = l_formatted.replace('%colorbegin%', colores.azul);
			l_formatted = l_formatted.replace('%colorend%', colores.reset);
			break;
        case 'warn': 
			l_formatted = l_formatted.replace('%colorbegin%', colores.amarillo);
			l_formatted = l_formatted.replace('%colorend%', colores.reset);
			break;
        case 'error': 
			l_formatted = l_formatted.replace('%colorbegin%', colores.rojo);
			l_formatted = l_formatted.replace('%colorend%', colores.reset);
			break;
		case 'audit':
			const parsed = (() => {
				try { return JSON.parse(a_mensaje); }
				catch { return null; }
			})();

			switch (parsed?.level) 
			{
				case 'LOW':
					l_formatted = l_formatted.replace('%colorbegin%', colores.cian);
					break;
				case 'MEDIUM':
					l_formatted = l_formatted.replace('%colorbegin%', colores.verde);
					break;
				case 'HIGH':
					l_formatted = l_formatted.replace('%colorbegin%', colores.amarillo);
					break;
				case 'CRITICAL':
					l_formatted = l_formatted.replace('%colorbegin%', colores.rojo);
					break;
				default:
					l_formatted = l_formatted.replace('%colorbegin%', colores.magenta);
			}
			l_formatted = l_formatted.replace('%colorend%', colores.reset);
			break;
      }
    }
	else
	{
		l_formatted = l_formatted.replace('%colorbegin%', colores.gris);
		l_formatted = l_formatted.replace('%colorend%', colores.reset);
	}
	
	l_formatted = l_formatted.replace('%message%', a_mensaje);
	
	return l_formatted;
  }
  
  
  
  /**
  * Envía un evento de auditoría vía Webhook
  * @private
  */
  async sendWebhook(payload, rawEvent) 
  {
	if (!this.webhook.enabled || !this.webhook.url) return;
	
	let body = payload;
	if (this.webhook.format === 'slack') 
	{ body = this.formatSlack(rawEvent); }
	else if (this.webhook.format === 'siem') 
	{ body = this.formatSIEM(rawEvent); }

	
	
	try 
	{
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), this.webhook.timeout);
	
		await fetch(this.webhook.url, 
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json', ...this.webhook.headers },
			body: JSON.stringify(body),
			signal: controller.signal
		});
	
		clearTimeout(timeout);
	} 
	catch (error) 
	{ this.error(`Webhook error: ${error.message}`); }
  }

  
  
  
  /**
   * Registra un evento de auditoría estructurado.
   * Responde:
   * - ¿Quién?
   * - ¿Qué?
   * - ¿Cuándo?
   * - ¿Dónde?
   * - ¿Antes y después?
   * - ¿Qué tan crítico es este evento para el negocio, seguridad o cumplimiento?
   *
   * | Nivel      | Significado   | Ejemplos                 |
   * | ---------- | ------------- | ------------------------ |
   * | `LOW`      | Seguimiento   | Consultas, listados      |
   * | `MEDIUM`   | Cambio normal | CREATE / UPDATE          |
   * | `HIGH`     | Riesgo        | DELETE, cambios críticos |
   * | `CRITICAL` | Seguridad     | Login admin, permisos    |
   *
   * @param {Object} data - Información de auditoría
   */
  async audit(data = {}) 
  {
	if (typeof data !== 'object') 
	{ throw new Error('audit() requiere un objeto como parámetro'); }

	const level = data.level ?? 'MEDIUM';
	const eventLevelValue = AUDIT_LEVELS[level];
	
	if (!eventLevelValue) 
	{
		this.warn(`Nivel de auditoría inválido: ${level}`);
		return;
	}
	
	if (eventLevelValue < this.minAuditLevel) 
	{
		return; // evento ignorado silenciosamente
	}	


  /**
   * Registra un evento de auditoría estructurado.
   * Responde:
   * ¿Quién?
   * ¿Qué?
   * ¿Cuándo?
   * ¿Dónde?
   * ¿Antes y después?
   * 
   * Ejemplo: Contrato de Adutoria
   * {
   *   level: 'LOW | MEDIUM | HIGH | CRITICAL',
   *   action: 'CREATE | UPDATE | DELETE | LOGIN | LOGOUT',
   *   entity: 'USERS',
   *   entityId: 15,
   *   before: {...},
   *   after: {...},
   *   userId: 3,
   *   username: 'admin',
   *   ip: '192.168.1.10',
   *   source: 'API',
   *   timestamp: ISODate
   * }
   */
    const auditEvent = {
      timestamp: new Date().toISOString(),
      level,
      action: data.action ?? 'UNDEFINED',
      entity: data.entity ?? 'UNKNOWN',
      entityId: data.entityId ?? null,
      before: data.before ?? null,
      after: data.after ?? null,
      userId: data.userId ?? null,
      username: data.username ?? null,
      ip: data.ip ?? null,
      source: data.source ?? 'SYSTEM',
      extra: data.extra ?? null
    };

	// Auditoría SIEMPRE en formato JSON
	// Usamos el motor existente
	this.log('audit', JSON.stringify(auditEvent));
	
	if (this.webhook.levels.includes(level)) 
	{
		await this.sendWebhook({
			schemaVersion: '1.0',
			source: 'MinervaJS.AuditLogs',
			service: this.prefijo,
			eventType: 'AUDIT',
			event: auditEvent
		}, auditEvent);
	}


  }


	/**
	* Registra un mensaje con nivel 'Start'.
	* @param {string} mensaje - El mensaje inicializacion.
	*/
	start(mensaje) { this.log('start', mensaje); }
	
	/**
	* Registra un mensaje con nivel 'info'.
	* @param {string} mensaje - El mensaje informativo.
	*/
	info(mensaje) { this.log('info', mensaje); }
	
	/**
	* Registra un mensaje con nivel 'debug'.
	* @param {string} mensaje - El mensaje de depuración.
	*/
	debug(mensaje) { this.log('debug', mensaje); }
	
	/**
	* Registra un mensaje con nivel 'error'.
	* @param {string} mensaje - El mensaje de error.
	*/
	error(mensaje) { this.log('error', mensaje); }
	
	/**
	* Registra un mensaje con nivel 'warn'.
	* @param {string} mensaje - El mensaje de advertencia.
	*/
	warn(mensaje) { this.log('warn', mensaje); }
  
  
	/**
	* Formatea un evento de auditoría para Slack
	* @private
	*/
	formatSlack(event) 
	{
		const emoji =
		event.level === 'CRITICAL' ? '🚨' :
		event.level === 'HIGH' ? '⚠️' : 'ℹ️';
	
	return {
		text:
		`${emoji} *AUDITORÍA ${event.level}*
		*Acción:* ${event.action}
		*Entidad:* ${event.entity}
		*ID:* ${event.entityId ?? 'N/A'}
		*Usuario:* ${event.username ?? event.userId ?? 'SYSTEM'}
		*IP:* ${event.ip ?? 'N/A'}
		*Fecha:* ${event.timestamp}`
	};
	}
	
	
	/**
	* Formatea un evento de auditoría para SIEM / Azure Sentinel
	* @private
	*/
	formatSIEM(event) 
	{
	return {
		TimeGenerated: event.timestamp,
		Level: event.level,
		Action: event.action,
		Entity: event.entity,
		EntityId: event.entityId,
		UserId: event.userId,
		Username: event.username,
		IpAddress: event.ip,
		Source: event.source,
		Service: this.prefijo,
		Schema: 'MinervaJS.AuditLogs'
	};
	}
  
  
}



module.exports = AuditLogs;

// {
//   getInstance: (prefijo, filenameBase, useColors, maxLines, writeToDisk) => {
//     if (!instance) 
// 	{ instance = new Audit_Logs(prefijo, filenameBase, useColors, maxLines, writeToDisk); }
//     return instance;
//   },
// };
