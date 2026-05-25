<p align="right">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/🇪🇸-Español-red" alt="Español">
  </a>
  <a href="./README.en.md">
    <img src="https://img.shields.io/badge/🇺🇸-English-blue" alt="English">
  </a>
</p>

<h1 align="center">
  MinervaJS AuditLogs
</h1>

<p align="center">
  Framework ligero de **Registro y Auditoría para Node.js**
</p>

<p align="center">

  <img src="https://img.shields.io/npm/v/@minervajs/auditlogs">
  <img src="https://img.shields.io/npm/l/@minervajs/auditlogs">
  <img src="https://img.shields.io/node/v/@minervajs/auditlogs">
  <img src="https://img.shields.io/npm/dm/@minervajs/auditlogs">

</p>

### 📦 @minervajs/auditlogs

Framework ligero de **Registro y Auditoría para Node.js**, diseñado para  
**observabilidad, diagnóstico y auditoría lista para cumplimiento (compliance)**.

Parte del ecosistema **MinervaJS**, orientado a entornos **empresariales, de seguridad y SOC**.

---

✨ Características

🔹 Logger técnico (Logger)  
🔒 Auditoría sin pérdida (Audit)  
🧩 Sistema extensible de handlers  
🔄 Rotación de archivos basada en líneas  
🎨 Colores ANSI opcionales  
🏗 Pipeline de procesamiento de eventos  
🛡 Nunca rompe tu aplicación  
📦 Cero dependencias externas  


Este módulo unifica en una sola pieza:

* Logger técnico avanzado (consola + archivos)
* Auditoría estructurada
* Rotación automática de archivos
* Formateo personalizable (JSON / TOON / PLOON)
* Múltiples Instancias
* Integración con Webhooks
* Compatibilidad con **Slack**
* Integración con **SIEM / Azure Sentinel**
* **Alertas automáticas** (respuesta a incidentes)

---

## 📦 Instalación

```bash
npm install @minervajs/auditlogs
```

En la instalacion, puedes hacer uso de archivos muestra que estan en https://github.com/Alexander-Escobar/MinervaJS.Example

---

## 🧠 Conceptos fundamentales

### Logger técnico

El logger técnico está orientado a **desarrolladores y operadores** y proporcionar una forma personalizada de registrar mensajes en la consola con colores por nivel y opcionalmente guardarlos en archivos de log rotativos basados en el número de líneas y se utiliza para:
* Depuración
* Diagnóstico
* Seguimiento técnico de la aplicación

Características:

* Registro de logs con niveles (info, debug, warn, error).
* Colores opcionales en la consola para diferenciar niveles.
* Escritura opcional a disco
* Rotación automática de archivos basada en el número de líneas.
* Múltiples instancias simultáneas

---

### Auditoría

La auditoría está orientada a **seguridad, cumplimiento y trazabilidad**.

A diferencia del logger técnico:

* Es **estructurada** (JSON)
* Tiene niveles de impacto
* Puede enviarse a sistemas externos
* Permite **reacción automática**

---

🚀 Inicio rápido
Registro técnico
```js
'use strict';

const { Logger } = require('@minervajs/auditlogs');

const logger = new Logger('app', {
  handlers: [{ type: 'console' }]
});

logger.info('Application started');
logger.warn('Memory usage high');
logger.error('Unhandled exception');
logger.debug('Debug details');
```
El primer parámetro es el **prefijo**, usado para identificar la fuente del log, Reemplaza 'app' con un prefijo descriptivo para tu aplicación o módulo para identificar la fuente. Por defecto es 'AuditLogs' si se omitiera.
### Niveles de log técnico

* `info`: (information) Información general
* `warn`: (warning) Advertencias
* `error`: Errores
* `debug`: Detalles para desarrollo y la depuración

Los mensajes de cada nivel se mostrarán en la consola con un color distintivo (si la opción useColors está habilitada) 
* useColors (opcional): Un boolean que indica si se deben usar colores en la salida de la consola. Por defecto es true.  


---

Registrador de Auditoria (sin pérdida)
```js
'use strict';

const { Audit } = require('@minervajs/auditlogs');

const audit = new Audit('auth', {
  minLevel: 'HIGH',
  handlers: [{ type: 'console' }]
});

audit.audit({
  level: 'HIGH',
  action: 'LOGIN',
  entity: 'User',
  user: 'john.doe',
  username: 'admin',
  ip: '10.0.0.5',
  source: 'API'
  context: { reason: 'Admin forced delete' }
});
```

Campos comunes:

* level
* action
* entity
* entityId
* userId / username
* ip
* source
* timestamp (automático)


🧠 Descripción general de la arquitectura
Componentes		principales
Componente 		Responsabilidad 
Base 			Crea eventos, ejecuta pipeline, envía controladores
Registrador 	Registro técnico 
Auditoría 		Registro de auditoría estructurado (sin pérdidas)
HandlerFactory 	Resolución dinámica de controladores 
EventPipeline 	Cadena de transformación de eventos


🧩 Manipuladores

Los controladores definen dónde van los registros.
* Console
* File
* Database
* Custom

```js
Console Handler
{
  type: 'console',
  useColors: true,
  stderrOnError: true,
  format: '[%currentline%] [%timestamp%] [%source%] [%level%] %message%'
}
```

Tokens admitidos::

* `%color.begin%` / `%color.end%`
* `%timestamp%`
* `%level%`
* `%source%`
* `%message%`
* `%currentline%` 

* format (opcional): Permitir a los usuarios definir su propio formato para las líneas de log. Esto podría incluir el orden de los elementos (timestamp, prefijo, nivel, mensaje), la inclusión de información adicional (como el nombre del archivo y la línea donde se generó el log), o formatos más estructurados (como JSON). El formato por defecto es '[%timestamp%] [%prefix%]%colorbegin% [%level%] %message% %colorend%'  
    * %color.begin% / %color.end%, indica inicio y fin de uso de color respectivamente (Solo se visualiza en consola) 
	* %timestamp%, marcador para fecha y hora  
	* %level%, marcador de nivel  
	* %source%, marcador para la inclusión de uso de identificador de Aplicativo o modulo  
	* %message%, marcador para el contenido del Mensaje  
	* %currentline%, El número de línea actual en el archivo de log / Numero de secuencia en consola

Ejemplo formato tipo JSON|TOON|PLOON:

```js
format: '%color.begin%{hora:"%timestamp%", nivel:"%level%", prefijo:"%source%"}%color.end% {msg:"%message%"}'
format: '%color.begin%hora:"%timestamp%", nivel:"%level%", prefijo:"%source%"%color.end%, msg:"%message%"'
format: '1:%currentline%|"%timestamp%"|"%level%"|"%source%"|"%message%"'
```
---
#### Salida en consola
![Consola Audit Logs](https://raw.githubusercontent.com/Alexander-Escobar/MinervaJS.Audit-Logs/refs/heads/main/images/CapturaAuditLogs.PNG)

---

Manejador de Archivos
Los controladores definen dónde van los registros.
* Console
* File
* Database
* Custom
```js
{
  type: 'file',
  source: 'app',
  maxLines: 10000,
  fileNameFormat: './logs/app-%timestamp%-%sequential%.log',
  format: '[%currentline%] [%timestamp%] [%level%] [%source%] %message%'
}
```
Características

Rotación basada en líneas

Numeración secuencial

Creación automática de directorios

Formato de nombre de archivo personalizado

Tokens de nombre de archivo admitidos:

%marca de tiempo%

%secuencial%



Features

Line-based rotation

Sequential numbering

Automatic directory creation

Custom file name format

Supported filename tokens:

%timestamp%

%sequential%



Database Handler
```js
{
  type: 'db',
  executor: async (event) => {
    await db.insert(event);
  }
}
```
El controlador recibe el objeto de evento completo.




🔁 Canal o tuberia de Eventos

Puede transformar o filtrar eventos antes del envío:
```js
const logger = new Logger('app', {
  handlers: [{ type: 'console' }],
  pipeline: [
    (event) => {
      event.meta.requestId = 'ABC123';
      return event;
    },
    (event) => {
      if (event.level === 'DEBUG') return null;
      return event;
    }
  ]
});
```
Si un paso devuelve nulo, el evento se descarta.

## implementación de pipeline
Un pipeline puede:

✅ Transformar

return Object.assign({}, event, { message: 'x' });

✅ Enriquecer

return Object.assign({}, event, {
  meta: Object.assign({}, event.meta, { userId: 123 })
});

✅ Filtrar

if (event.level === 'DEBUG') return null; // evento descartado

---

🔒 Niveles de auditoría

Niveles de auditoría predeterminados:

Level	Value
INFO	100
LOW	200
MEDIUM	300
HIGH	400
CRITICAL	500
SECURITY	600
COMPLIANCE	700

You may override:
```js
new Audit('system', {
  levels: {
    INFO: 10,
    CRITICAL: 999
  }
});
```


---

## 📂 Escritura a disco y rotación de archivos

Configuración:

```js
const audit = new AuditLogs('MiServicio', {
  handlers: [
    { type: 'console', useColors: true },
    { type: 'file', baseFileName: 'myapp.log', maxLines: 5000
    }
  ]
});
```

### Rotación de Archivos
* baseFileName (opcional): Un string que define el nombre base del archivo de log. Los archivos rotados se nombrarán añadiendo un sufijo numérico (ej., `app.log`, `app-1.log`, `app-2.log`, etc). Por defecto es app.log.  
* maxLines (opcional): Un number que especifica el número máximo de líneas que un archivo de log puede alcanzar antes de que se rote y se cree uno nuevo. Por defecto es 10000, no se recomienda cantidades pequeñas lo cual podria consumir mucho recurso en disco en entornos productivos.

Notas:

* En cada Instancia, los primeras Lineas, indicaran la Configuración con que inicia 'MinervaJS Audit Logs' y son tambien parte de la cuota de maxLines.
* El llegar a la cuota de rotación de archivo maxLines, se adicionara una linea al final del archivo indicando fin del mismo. por defecto cada archivo tendria maxLines + 1.

#### La generacion de archivos
![Archivos Generados por Audit Logs](https://raw.githubusercontent.com/Alexander-Escobar/MinervaJS.Audit-Logs/refs/heads/main/images/CapturaAuditLogsfiles.PNG)

Numeración de línea (Consola)
Es un contador de sesión
Se reinicia al reiniciar el proceso
Puede reiniciarse por overflow controlado
No está diseñada para persistencia ni auditoría



---

## 🔒 Filtro global: minAuditLevel

Permite definir desde qué nivel se **registra** la auditoría.

```js
audit: {
  minAuditLevel: 'HIGH'
}
```

Eventos por debajo del nivel configurado se ignoran silenciosamente.

---
🧩 Custom Handlers

You can register new handlers dynamically:

const HandlerFactory = require('@minervajs/auditlogs/core/HandlerFactory');

class SlackHandler {
  async handle(event) {
    await sendToSlack(event.message);
  }
}

HandlerFactory.register('slack', SlackHandler);

Then use:

{
  type: 'slack'
}
📄 Event Structure

Every event has:

{
  timestamp: 'ISO 8601',
  level: 'INFO',
  source: 'app',
  message: 'Message text',
  meta: {}
}

Audit events include:

meta: {
  audit: true,
  action,
  entity,
  user,
  context
}



---

## 📄 Licencia

BSD-2-Clause

---
## Roadmap

### v2.1 – Enterprise logging
- Rotación por tamaño y fecha
- Compresión de logs históricos
- Políticas de retención configurables

---

### v2.2 – Formatting & output control
- Formatter personalizado por usuario
- Modo **JSON-only** configurable
- Hooks de formateo (`beforeFormat`, `afterFormat`)
- Soporte de formatos adicionales (`toon`, `ploon`)

---

### v2.3 – SOC granularity
- Control fino por nivel de auditoría
- Activación selectiva por nivel:
  - consola
  - archivo
  - webhook
  - alertas
- Configuración declarativa orientada a SOC

---

### v2.4 – Internal buffer / queue
- Buffer interno en memoria
- Cola asíncrona de eventos
- Flush configurable
- Tolerancia a fallos de red

---

### v2.5 – Database persistence (optional)
- Persistencia en base de datos vía `@minervajs/helmet`
- Integración desacoplada del core

---

### v3.0 – Optional integrations (plugins)
- `@minervajs/auditlogs-slack`  
  Integración nativa con Slack

- `@minervajs/auditlogs-siem`  
  Integración SIEM / Azure Sentinel

- Integraciones completamente desacopladas del core

---

**Nota de diseño**  
El core de `@minervajs/auditlogs` se mantiene liviano y enfocado.  
Las capacidades enterprise, SOC y de integración avanzada se entregan como **módulos opcionales**, preservando simplicidad y escalabilidad.
