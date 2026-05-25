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
  Lightweight **logging and auditing framework for Node.js**
</p>

<p align="center">

  <img src="https://img.shields.io/npm/v/@minervajs/auditlogs">
  <img src="https://img.shields.io/npm/l/@minervajs/auditlogs">
  <img src="https://img.shields.io/node/v/@minervajs/auditlogs">
  <img src="https://img.shields.io/npm/dm/@minervajs/auditlogs">

</p>

### 📦 @minervajs/auditlogs

Lightweight **logging and auditing framework for Node.js**, built for  
**observability, diagnostics, and compliance-ready audit trails**.

Part of the **MinervaJS ecosystem**, designed for **enterprise, security, and SOC-oriented environments**.

---

✨ Features

🔹 Technical Logger (Logger)
🔒 Non-lossy Audit Logger (Audit)
🧩 Extensible handler system
🔄 Line-based file rotation
🎨 Optional ANSI color output
🏗 Event processing pipeline
🛡 Never breaks your application
📦 Zero external dependencies


This module unifies the following into a single unit:

* Advanced technical logger (console + files)
* Structured auditing
* Automatic file rotation
* Customizable formatting (JSON / TOON / PLOON)
* Multiple instances
* Webhook integration
* Slack compatibility
* SIEM/Azure Sentinel integration
* Automatic alerts (incident response)

---

## 📦 installation

```bash
npm install @minervajs/auditlogs
```

During installation, you can use sample files that are located in https://github.com/Alexander-Escobar/MinervaJS.Example

---

## 🧠 Conceptos fundamentales

### Technical Logger

The technical logger is designed for **developers and operators**, providing a customizable way to log messages to the console with level-based colors and optional file persistence with line-based rotation.
It is commonly used for:

- Debugging
- Diagnostics
- Technical tracing

Features:

- Log levels: (info, debug, warn, error)
- Optional colored output
- Optional disk persistence
- Automatic line-based file rotation
- Multiple concurrent instances

---

### Audit Logger

The audit logger is designed for **security, compliance, and traceability**.

Unlike the technical logger:

- It is **structured (JSON)**
- Uses impact levels
- Can be sent to external systems
- Supports **automated reactions**

---

🚀 Quick Start
Technical Logger
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
The first parameter is the **prefix**, used to identify the source of the log. Replace ‘app’ with a descriptive prefix for your application or module to identify the source. The default is ‘AuditLogs’ if omitted.
### Technical Log Levels

* `info`: (information) General information
* `warn`: (warning) Warnings
* `error`: Errors
* `debug`: Details for development and debugging

Messages for each level will be displayed in the console in a distinctive color (if the `useColors` option is enabled)
* `useColors` (optional): A boolean that specifies whether colors should be used in the console output. The default is `true`.  


---

Audit Logger (Non-Lossy)
```js
'use strict';

const { Audit } = require('@minervajs/auditlogs');

const audit = new Audit('auth', {
  minLevel: 'HIGH',
  handlers: [
    { type: 'console' }
  ]
});

audit.audit({
  level: 'HIGH',
  action: 'LOGIN',
  entity: 'User',
  user: 'john.doe',
  username: 'admin',
  ip: '10.0.0.5',
  source: 'API',
  context: { reason: 'Admin forced delete' }
});
```

Common fields:

* level
* action
* entity
* entityId
* userId / username
* ip
* source
* timestamp (automático)


🧠 Architecture Overview
Core Components
Component	Responsibility
Base	Builds events, executes pipeline, dispatches handlers
Logger	Technical logging
Audit	Structured audit logging (non-lossy)
HandlerFactory	Dynamic handler resolution
EventPipeline	Event transformation chain


## 🧩 Handlers

Handlers define where logs are sent.
```js
Console Handler
{
  type: 'console',
  useColors: true,
  stderrOnError: true,
  format: '[%currentline%] [%timestamp%] [%source%] [%level%] %message%'
}
```

Supported tokens:

* `%color.begin%` / `%color.end%`
* `%timestamp%`
* `%level%`
* `%source%`
* `%message%`
* `%currentline%` 

* format (optional): Allows users to define their own format for log lines. This could include the order of elements (timestamp, prefix, level, message), the inclusion of additional information (such as the filename and the line where the log was generated), or more structured formats (such as JSON). The default format is ‘[%timestamp%] [%prefix%]%colorbegin% [%level%] %message% %colorend%’  
    * %color.begin% / %color.end%, indicates the start and end of color usage, respectively (Only displayed in the console) 
	* %timestamp%, marker for date and time  
    * %level%, level marker  
    * %source%, marker for including the application or module identifier  
    * %message%, marker for the message content  
    * %currentline%, the current line number in the log file / sequence number in the console

Example of JSON|TOON|PLOON format:

```js
format: '%color.begin%{hora:"%timestamp%", nivel:"%level%", prefijo:"%source%"}%color.end% {msg:"%message%"}'
format: '%color.begin%hora:"%timestamp%", nivel:"%level%", prefijo:"%source%"%color.end%, msg:"%message%"'
format: '1:%currentline%|"%timestamp%"|"%level%"|"%source%"|"%message%"'
```
---
#### Console output
![Consola Audit Logs](https://raw.githubusercontent.com/Alexander-Escobar/MinervaJS.Audit-Logs/refs/heads/main/images/CapturaAuditLogs.PNG)

---

File Handler
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
Features

Line-based rotation

Sequential numbering

Automatic directory creation

Custom filename format

Supported filename tokens:

%timestamp%

%sequential%



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
The handler receives the full event object.



## 🔁 Event Pipeline

Allows transformation or filtering of events before dispatch.
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
If a step returns null, the event is discarded.

## Pipeline Implementation
A pipeline can:

✅ Transform

return Object.assign({}, event, { message: 'x' });

✅ Enrich

return Object.assign({}, event, {
  meta: Object.assign({}, event.meta, { userId: 123 })
});

✅ Filter

if (event.level === 'DEBUG') return null; // evento descartado

---

🔒 Audit Levels

Default audit levels:

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

## 📂 File Writing and Rotation

Config:

```js
const audit = new AuditLogs('MiServicio', {
  handlers: [
    { type: 'console', useColors: true },
    { type: 'file', baseFileName: 'myapp.log', maxLines: 5000
    }
  ]
});
```

### File Rotation
* baseFileName (optional): A string that defines the base name of the log file. Rotated files will be named by adding a numerical suffix (e.g., `app.log`, `app-1.log`, `app-2.log`, etc.). The default is `app.log`.  
* maxLines (optional): A number specifying the maximum number of lines a log file can reach before it rotates and a new one is created. The default is 10,000; small values are not recommended as they could consume significant disk resources in production environments.

Notes:

* In each instance, the first few lines indicate the configuration with which ‘MinervaJS Audit Logs’ starts and are also part of the maxLines quota.
* Upon reaching the maxLines file rotation quota, a line will be added to the end of the file indicating its end. By default, each file will have maxLines + 1.

#### La generacion de archivos
![Archivos Generados por Audit Logs](https://raw.githubusercontent.com/Alexander-Escobar/MinervaJS.Audit-Logs/refs/heads/main/images/CapturaAuditLogsfiles.PNG)

Line Numbering (Console)
This is a session counter
It resets when the process is restarted
It can be reset by controlled overflow
It is not designed for persistence or auditing



---

## 🔒 Global filter: minAuditLevel

Allows you to specify the level at which the audit is **logged**.

```js
audit: {
  minAuditLevel: 'HIGH'
}
```

Events below the configured threshold are silently ignored.

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

**Design Note**  
The core of `@minervajs/auditlogs` remains lightweight and focused.  
Enterprise, SOC, and advanced integration capabilities are provided as **optional modules**, preserving simplicity and scalability.
