'use strict';

/**
 * ConsoleHandler
 *
 * Responsabilidades:
 * - Formatear eventos para consola
 * - Aplicar colores por nivel (opcional)
 * - Escribir a stdout / stderr
 * - Mantener contador de líneas
 * - Permitir reset del contador
 *
 */

class ConsoleHandler 
{
  /**
   * @param {Object} options
   * @param {boolean} [options.useColors=true]
   * @param {string}  [options.format]
   * @param {boolean} [options.stderrOnError=true]
   */
  constructor(options = {}) 
  {
    this.type = 'console';
    this.useColors = options.useColors !== false;
    this.format = options.format ?? '[%currentline%] %color.begin%[%timestamp%] [%source%] [%level%]%color.end% %message%';
    this.stderrOnError = options.stderrOnError !== false;
    this._lineCount = 0;
	
	// ======= Mensajes iniciales =======
	this._start();
  }

  /**
   * Maneja el evento
   * @param {Object} event
   */
  handle(event) 
  {
    try 
	{
      const line = this._format(event);
      this._write(event.level, line);
      this._lineCount++;
    } 
	catch 
	{
      // nunca romper el flujo
    }
  }

  /**
   * Formatea el evento para salida en consola
   * @private
   */
  _format(event) 
  {
	const currentLine = String(this._lineCount + 1).padStart(6, '0');
	
    let output = this.format
		.replace(/%currentline%/g,currentLine)
		.replace(/%timestamp%/g, event.timestamp)
		.replace(/%source%/g, event.source)
		.replace(/%level%/g, event.level)
		.replace(/%message%/g, event.message);

    if (this.useColors)
	{ output = this._applyColors(event.level, output); }

    return output;
  }

  /**
   * Aplica colores ANSI según nivel
   * @private
   */
  _applyColors(level, text) 
  {
    const RESET = '\x1b[0m';
	
	if (!this.useColors) 
    {
      return text
        .replace(/%color\.begin%/g, '')
        .replace(/%color\.end%/g, '');
    }
	
    const COLORS = 
	{
		// Logger
		DEBUG: '\x1b[36m',    	// cyan
		INFO: '\x1b[32m',     	// green	-- Logger y Audit
		WARN: '\x1b[33m',     	// yellow
		ERROR: '\x1b[31m',    	// red
		START: '\x1b[90m',		// gray

		// Audit
		LOW: '\x1b[32m',        // green
		MEDIUM: '\x1b[33m',     // yellow
		HIGH: '\x1b[35m',       // magenta
		CRITICAL: '\x1b[31m',   // red
		SECURITY: '\x1b[41m',   // red background
		COMPLIANCE: '\x1b[34m'  // blue
    };

    const color = COLORS[level] || '';
	
	return text
      .replace(/%color\.begin%/g, color)
      .replace(/%color\.end%/g, RESET);
	
  }

  /**
   * Escribe en stdout o stderr
   * @private
   */
  _write(level, line) 
  {
    if (this.stderrOnError && level === 'ERROR') 
	{ process.stderr.write(line + '\n'); } 
	else 
	{ process.stdout.write(line + '\n'); }
  }

  /**
   * Resetea el contador de líneas
   */
  resetLineCounter() 
  { this._lineCount = 0; }

  /**
   * Devuelve el número de líneas escritas
   */
  getLineCount()
  { return this._lineCount; }
  
  
	/**
	* Emite eventos de inicio del handler
	*/
	_start()
	{
	  try 
	  {
		const timestamp = new Date().toISOString();

		this.handle({
		  timestamp,
		  source: 'ConsoleHandler',
		  level: 'START',
		  message: `Prefijo:       ${this.source ?? '(no definido)'}`
		});

		this.handle({
		  timestamp,
		  source: 'ConsoleHandler',
		  level: 'START',
		  message: `Uso de Color:  ${this.useColors}`
		});
	  } 
	  catch (_) 
	  { } // fallar en silencio (consistente con Base)
	}

}

module.exports = ConsoleHandler;
