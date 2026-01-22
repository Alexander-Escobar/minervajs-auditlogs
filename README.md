# @minervajs/auditlogs

Módulo de **auditoría y logging técnico** para el ecosistema **MinervaJS**, diseñado para entornos profesionales, empresariales y orientados a **seguridad (SOC)**.

Este módulo unifica en una sola pieza:

* Logger técnico avanzado (consola + archivos)
* Auditoría estructurada
* Rotación automática de archivos
* Formateo personalizable
* Integración con Webhooks
* Compatibilidad con **Slack**
* Integración con **SIEM / Azure Sentinel**
* **Alertas automáticas** (respuesta a incidentes)

---

## 📦 Instalación

```bash
npm install @minervajs/auditlogs
```

En la instalacion, puedes hacer uso del archivo muestra que esta en \node_modules\minervajs-auditlogs\example\index.js

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

## 🚦 Niveles de auditoría

| Nivel    | Descripción                   | Significado   | Ejemplos                 |
| -------- | ----------------------------- | ------------- | ------------------------ |
| LOW      | Eventos informativos          | Seguimiento   | Consultas, listados      |
| MEDIUM   | Eventos relevantes            | Cambio normal | CREATE / UPDATE          |
| HIGH     | Eventos sensibles             | Riesgo        | DELETE, cambios críticos |
| CRITICAL | Eventos críticos de seguridad | Seguridad     | Login admin, permisos    |

Estos niveles permiten filtrar, alertar y reaccionar de forma controlada.

---

## ⚙️ Inicialización básica

```js
const AuditLogs = require('@minervajs/auditlogs');

const audit = new AuditLogs('MiAplicacion', {
  audit: {
    minAuditLevel: 'HIGH'
  }
});
```

El primer parámetro es el **prefijo**, usado para identificar la fuente del log, Reemplaza 'MiAplicacion' con un prefijo descriptivo para tu aplicación o módulo para identificar la fuente. Por defecto es 'AuditLogs' si se omitiera.

---
## Parámetros de Configuración.

El método permite configurar el 'MinervaJS Audit Logs' en su primera llamada. Las llamadas posteriores devolverán la misma instancia con la configuración inicial.

## 📝 Uso del logger técnico

```js
audit.info('Aplicación iniciada');
audit.debug('Configuración cargada');
audit.warn('Uso elevado de memoria');
audit.error('Error de conexión a base de datos');
```

### Niveles de log técnico

* `info`: (information) Información general
* `debug`: Detalles para desarrollo y la depuración
* `warn`: (warning) Advertencias
* `error`: Errores

Los mensajes de cada nivel se mostrarán en la consola con un color distintivo (si la opción useColors está habilitada) 
* useColors (opcional): Un boolean que indica si se deben usar colores en la salida de la consola. Por defecto es true.  
---

## 📂 Escritura a disco y rotación de archivos

Configuración:

```js
const audit = new AuditLogs('MiServicio', {
  filenameBase: 'app.log',
  writeToDisk: true,
  maxLines: 5000,
  useColors: true
});
```

### Rotación de Archivos
* filenameBase (opcional): Un string que define el nombre base del archivo de log. Los archivos rotados se nombrarán añadiendo un sufijo numérico (ej., `app.log`, `app-1.log`, `app-2.log`, etc). Por defecto es app.log.  
* maxLines (opcional): Un number que especifica el número máximo de líneas que un archivo de log puede alcanzar antes de que se rote y se cree uno nuevo. Por defecto es 10000, la cantidad minima es 100 si se ha habilitado el banderin debuger=true permite que esta cantidad sea menor a 100.
* writeToDisk (opcional): Un boolean que controla si los logs deben escribirse en el archivo. Si es true, se escribirán; si es false, se omitirá la escritura a disco. Por defecto es false. 
* debuger (opcional): un banderin que habilita opciones para depuración, como el poder definir maxLines con menos de 100 lineas.

Notas:

* En cada Instancia, los primeras Lineas, indicaran la Configuración con que inicia 'MinervaJS Audit Logs' y son tambien parte de la cuota de maxLines.
* El llegar a la cuota de rotación de archivo maxLines, se adicionara una linea al final del archivo indicando fin del mismo. por defecto cada archivo tendria maxLines + 1.

#### La generacion de archivos
![Archivos Generados por Audit Logs](https://raw.githubusercontent.com/Alexander-Escobar/MinervaJS.Audit-Logs/refs/heads/main/images/CapturaAuditLogsfiles.PNG)


---

## 🎨 Formato personalizable

Puedes definir tu propio formato:

```js
format: '%colorbegin%[%timestamp%] [%level%] [%prefix%]%colorend% %message%'
```

Marcadores disponibles:

* `%colorbegin%` / `%colorend%`
* `%timestamp%`
* `%level%`
* `%prefix%`
* `%message%`
* `%currentline%` (solo en archivo)

* format (opcional): Permitir a los usuarios definir su propio formato para las líneas de log. Esto podría incluir el orden de los elementos (timestamp, prefijo, nivel, mensaje), la inclusión de información adicional (como el nombre del archivo y la línea donde se generó el log), o formatos más estructurados (como JSON). El formato por defecto es '[%timestamp%] [%prefix%]%colorbegin% [%level%] %message% %colorend%'  
    * %colorbegin% / %colorend%, indica inicio y fin de uso de color respectivamente  
	* %timestamp%, marcador para fecha y hora  
	* %level%, marcador de nivel  
	* %prefix%, marcador para la inclusión de uso de identificador de Aplicativo o modulo  
	* %message%, marcador para el contenido del Mensaje  
	* %currentline%, El número de línea actual en el archivo de log (Solo se visualiza en archivo)

Ejemplo formato tipo JSON:

```js
format: '%colorbegin%{hora:"%timestamp%", nivel:"%level%", prefijo:"%prefix%"}%colorend% {msg:"%message%"}'
```

#### Salida en consola
![Consola Audit Logs](https://raw.githubusercontent.com/Alexander-Escobar/MinervaJS.Audit-Logs/refs/heads/main/images/CapturaAuditLogs.PNG)

---

## 🔍 Auditoría estructurada

```js
audit.audit({
  level: 'CRITICAL',
  action: 'DELETE',
  entity: 'USERS',
  entityId: 15,
  userId: 1,
  username: 'admin',
  ip: '10.0.0.5',
  source: 'API'
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

## 🌐 Webhook

Permite enviar eventos de auditoría a sistemas externos.

```js
audit: {
  webhook: {
    enabled: true,
    url: 'https://endpoint.example.com',
    format: 'siem',
    levels: ['HIGH', 'CRITICAL'],
    timeout: 5000
  }
}
```

---

## 💬 Slack

Compatible mediante Webhook nativo de Slack.

```js
audit: {
  webhook: {
    enabled: true,
    url: 'https://hooks.slack.com/services/XXX',
    format: 'slack',
    levels: ['CRITICAL']
  }
}
```

Los mensajes están optimizados para consumo humano.

---

## 🧩 SIEM / Azure Sentinel

Formato JSON compatible con SIEM y especialmente **Azure Sentinel**.

Características:

* Campos planos
* Timestamp normalizado
* Compatible con KQL

Ejemplo:

```kql
MinervaJS_AuditLogs_CL
| where Level == "CRITICAL"
```

---

## 🚨 Alertas automáticas (SOC)

Permite ejecutar acciones automáticas cuando ocurren eventos críticos.

```js
const blockUserAlert = async (event) => {
  if (event.action === 'DELETE' && event.entity === 'USERS') {
    console.log(`Usuario ${event.userId} bloqueado automáticamente`);
  }
};

const audit = new AuditLogs('MiApp', {
  audit: {
    alerts: {
      enabled: true,
      levels: ['CRITICAL'],
      handlers: [blockUserAlert]
    }
  }
});
```

Las alertas:

* Son opcionales
* No bloquean el flujo
* No lanzan excepciones

---

## 🛡️ SOC Ready

Este módulo está preparado para integrarse con un **Security Operations Center (SOC)**:

* Genera eventos estructurados
* Permite correlación
* Soporta respuesta automática

---

## 🧪 Pruebas

Pendiente de implementación con Jest.

---

## 📄 Licencia

BSD-2-Clause
