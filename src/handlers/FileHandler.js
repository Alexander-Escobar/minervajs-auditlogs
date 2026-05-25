'use strict';

const fs = require('fs');
const path = require('path');

/**
 * FileHandler
 *
 * Handler de escritura en archivo con:
 * - Contador de líneas por archivo
 * - Rotación automática
 * - Formato configurable de línea
 * - Formato configurable de nombre de archivo
 * - Contador secuencial por instancia
 */
class FileHandler 
{
	/**
	* @param {Object} options
	* @param {number} [options.maxLines=10000] Máx. líneas por archivo
	* @param {Function} [options.format] Función de formato de línea: (event) => string
	* @param {string} [options.fileNameFormat] Formato de nombre de archivo con marcadores:
	*        %timestamp%, %sequential% (ruta completa opcional incluida)
	*/
	constructor(options = {}) 
	{
		this.source = options.source || 'app';
		this.fileNameFormat = options.fileNameFormat|| `${this.source}-%timestamp%-%sequential%.log`;
		this.maxLines = Number(options.maxLines) || 10000;

		// Formato: si es string, convertir a función que reemplace marcadores
		this.format = typeof options.format === 'function'
			? options.format
			: typeof options.format === 'string'
				? (event) => options.format
					.replace(/%currentline%/g, event.currentline)
					.replace(/%timestamp%/g, event.timestamp)
					.replace(/%source%/g, event.source)
					.replace(/%level%/g, event.level)
					.replace(/%message%/g, event.message)
				: this.defaultFormat;

		// Contadores
		this.currentLines = 0;
		this.sequential = 1;
		this.rotating = false;
		this.stream = null;

		// Crear primer archivo
		this._createNewFile();
	}

	/**
	* Formato por defecto de línea
	*/
	defaultFormat(event) 
	{ return `[${event.currentline}] [${event.timestamp}] [${event.level}] [${event.source}] ${event.message}`;	}


	/**
	* Maneja un evento
	* @param {Object} event
	*/
	async handle(event) 
	{
		while (this.rotating) 
		{ await new Promise(res => setImmediate(res)); }

		try 
		{
			if (this.currentLines >= this.maxLines) 
			{ await this._rotate(); }
	
			if (!this.stream) return;
	
			// ===== Línea real del archivo =====
			const currentLine = this.currentLines + 1;
	
			const enrichedEvent = 
			{
				...event,
				currentline: String(currentLine).padStart(6, '0')
			};
		
			const line = this.format(enrichedEvent) + '\n';
			this.stream.write(line);
			this.currentLines++;
		} 
		catch (_) 
		{ } // No romper logger
	}

	/**
	* Rotación segura del archivo
	* @private
	*/
	async _rotate() 
	{
		if (this.rotating) return;
		this.rotating = true;

		return new Promise(resolve => 
		{
			if (this.stream) 
			{
				this.stream.end(() => 
				{
					this.sequential++;
					this._createNewFile();
					this.rotating = false;
					resolve();
				});
			} 
			else 
			{
				this.sequential++;
				this._createNewFile();
				this.rotating = false;
				resolve();
			}
		});
	}

	/**
	* Crea un nuevo archivo según fileNameFormat
	* @private
	*/
	_createNewFile() 
	{
		try 
		{
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const sequentialStr = String(this.sequential).padStart(6, '0');

			let filePath = this.fileNameFormat
				.replace(/%timestamp%/g, timestamp)
				.replace(/%sequential%/g, sequentialStr);

			// Determinar directorio
			let dir = path.dirname(filePath);
	  
			// Si no hay ruta explícita, usar cwd
			if (!path.isAbsolute(dir)) 
			{
				dir = process.cwd();
				filePath = path.resolve(dir, path.basename(filePath));
			}

			this._ensureDirectory(dir);

			this.stream = fs.createWriteStream(filePath, { flags: 'a' });
			this.currentLines = 0;
		} 
		catch (err) 
		{
			this.stream = null;
			console.error('[FileHandler] Error creando archivo:', err.message);
		}
	}

	/**
	* Asegura que el directorio exista
	* @private
	*/
	_ensureDirectory(dir) 
	{
		try 
		{ fs.mkdirSync(dir, { recursive: true }); } 
		catch (err) 
		{ console.error('[FileHandler] Error creando directorio:', err.message); }
	}
}

module.exports = FileHandler;
