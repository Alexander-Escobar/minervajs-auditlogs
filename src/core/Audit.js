'use strict';

const Base = require('./Base');
const HandlerFactory = require('./HandlerFactory');

/**
 * @typedef {'INFO'|'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'|'SECURITY'|'COMPLIANCE'} AuditLevel
 */
const DEFAULT_AUDIT_LEVELS = 
{
	INFO: 100,
	LOW: 200,
	MEDIUM: 300,
	HIGH: 400,
	CRITICAL: 500,
	SECURITY: 600,
	COMPLIANCE: 700
};

/**
 * ES: Logger de auditoría (no descartable)
 * EN: Audit logger (non-lossy)
 */
class Audit extends Base
{
	constructor(source, options = {})
	{
		const handlers = HandlerFactory.create(options.handlers);
		const levels = {
				...DEFAULT_AUDIT_LEVELS,
				...(options.levels || {})
		};

		super(source, 
		{
			enabled: options.enabled,
			format: options.format,
			handlers: handlers,
			pipeline: options.pipeline			
		});
		
		this.levels = levels;
		this.minLevel = options.minLevel || 'INFO';
		
		if (!this.levels[this.minLevel])
		{ throw new Error(`Invalid minLevel: ${this.minLevel}`); }
	}
	
	
	/**
	* Evento de auditoría
	* ¿Qué pasó?				action / event
	* ¿Quién lo hizo?			user / actor
	* ¿Cuándo ocurrió?			timestamp (incrustado)
	* ¿Dónde ocurrió?			source / system
	* ¿Cuál fue el resultado?	outcome / context
	*/
	audit({
		level = 'INFO',
		action,
		entity,
		user,
		context = {}
	}) 
  
	{
		const message = `${action} ${entity}`;

		const meta = 
		{
			audit: true,
			action,
			entity,
			user,
			context
		};

		return this.emit(level, message, meta);
	}
  
	async emit(level, message, meta = {})
	{
		let event;
		let processed;
		const eventLevelValue = this.levels[level];
		const minLevelValue = this.levels[this.minLevel];
		
		if (!this.enabled) return;

		if (eventLevelValue === undefined) 
		{ throw new Error(`Unknown audit level: ${level}`); }

		if (minLevelValue === undefined) 
		{ throw new Error(`Invalid minLevel: ${this.minLevel}`); }

		// filtro silencioso
		if (eventLevelValue < minLevelValue) 
		{ return; }

		try 
		{ event = this._buildEvent(level, message, meta); } 
		catch 
		{ return; }

		try 
		{ processed = this.pipeline.run(event); } 
		catch 
		{ processed = event; }// ← fallback NO-LOSSY


		// 🔒 NO-LOSSY GUARANTEE
		if (!processed) 
		{ processed = event; }

		await this._dispatch(processed);
	}
}

module.exports = Audit;
