'use strict';

/**
 * ES: Pipeline de procesamiento de eventos
 * EN: Event processing pipeline
 */
class EventPipeline 
{
  constructor(steps = []) 
  {
    this.steps = Array.isArray(steps) ? steps : [];
  }

  /**
   * Ejecuta el pipeline
   * @param {object} event
   * @returns {object|null}
   */
  run(event) 
  {
    let current = event;

    for (const step of this.steps) 
	{
      if (typeof step !== 'function') continue;

      try 
	  {
        current = step(current);
        if (current === null) return null;
      } 
	  catch 
	  {
        return null; // nunca romper logger/audit
      }
    }

    return current;
  }

  /**
   * Agrega un paso al pipeline
   */
  use(step) 
  {
    if (typeof step === 'function') 
	{
      this.steps.push(step);
    }
  }
}

module.exports = EventPipeline;
