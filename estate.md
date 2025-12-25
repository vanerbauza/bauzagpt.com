# BAUZAGPT — ESTADO DEL PROYECTO (STATE)

Última actualización: 25 de diciembre de 2025  
Proyecto: bauzagpt.com  
Estado general: EN CONSTRUCCIÓN (arquitectura, flujo y marco legal definidos)

---

## 1. Propósito del proyecto

BauzaGPT es una plataforma de análisis OSINT (Open Source Intelligence) que genera reportes a partir de información pública disponible en Internet.

El servicio:
- analiza objetivos proporcionados por el usuario
- ejecuta procesos automatizados reales
- consume APIs y recursos reales
- entrega reportes verificables (PDF / ZIP)

**Principio rector**  
> BauzaGPT NO simula análisis ni entrega resultados falsos.  
> La ausencia de resultados también constituye un resultado.

---

## 2. Decisión arquitectónica central (NO negociable)

**El reporte debe entregarse al usuario SÍ O SÍ**, independientemente de:

- que el usuario cierre el navegador
- que se pierda la conexión
- que el análisis tarde minutos u horas
- que el resultado sea negativo o vacío

Esta decisión descarta un modelo request/response clásico y obliga a:

- jobs asíncronos
- procesos desacoplados
- persistencia de estado
- ejecución independiente del frontend

Toda la arquitectura del sistema se construye alrededor de esta decisión.

---

## 3. Arquitectura general

### 3.1 Frontend (bauzagpt.com)

Rol:
- Punto de entrada del usuario
- Autenticación con Google
- Creación de búsquedas
- Creación de órdenes
- Visualización de estado
- Descarga de reportes

El frontend:
- NO ejecuta análisis
- NO genera resultados
- NO depende del tiempo del backend
- NO simula resultados ni progreso falso

El spinner/modal existe para comunicar:
> “Tu solicitud fue aceptada. El sistema continúa trabajando aunque cierres la página.”

---

### 3.2 Backend Node.js + Express (orquestador)

Rol:
- API principal del sistema
- Gestión de usuarios
- Creación de órdenes / jobs
- Gestión de estados
- Validación de pagos
- Orquestación de análisis
- Entrega de reportes

Responsabilidades clave:
- generar `orderId / jobId`
- registrar estados (`created`, `pending_payment`, `paid`, `processing`, `ready`, `failed`)
- lanzar el motor de análisis
- garantizar la entrega del reporte

Node **NO ejecuta OSINT pesado**.  
Node coordina.

Estado actual:
- Backend real funcional
- MongoDB conectado
- API operativa (8080 en desarrollo)

---

### 3.3 Motor de análisis (Python – motor fuerte)

Rol:
- Ejecutar procesos OSINT reales
- Consumir APIs externas
- Puede tardar lo que sea necesario
- Procesar el objetivo (username, email, dominio, etc.)
- Generar reportes (PDF / ZIP)
- Guardar evidencia
- Reportar finalización al backend

El motor:
- es independiente del navegador
- es independiente del frontend
- ejecuta incluso si el usuario se va

---

## 4. Flujo del usuario (end-to-end)

Este es el flujo obligatorio y real del sistema.

### 4.1 Registro / inicio de sesión
- El usuario se autentica con Google
- Se crea o recupera su cuenta
- Se asigna un `userId`

No existen análisis pagos sin usuario autenticado.

---

### 4.2 Creación de búsqueda
- El usuario ingresa un objetivo:
  - username
  - email
  - dominio
  - teléfono (si aplica)
- Selecciona tipo de reporte:
  - básico
  - pro

Aquí **NO se ejecuta análisis**.

---

### 4.3 Creación de orden
- El backend:
  - crea un `orderId`
  - asocia la orden al usuario
  - guarda objetivo, plan y estado inicial

Estados iniciales:
- `created`
- `pending_payment`

---

### 4.4 Pago
- El usuario realiza el pago (manual hoy, automatizado en el futuro)
- El usuario sube comprobante o el sistema valida el pago

Aún **NO hay análisis**.

---

### 4.5 Confirmación de pago
- El backend marca la orden como:
  - `paid`

👉 En este momento se dispara el análisis  
👉 El sistema asume la obligación de entrega

---

### 4.6 Ejecución del análisis (asíncrono)
- Node orquesta
- El motor Python ejecuta OSINT real
- El proceso puede tardar minutos u horas
- El usuario NO necesita permanecer conectado

Estados:
- `processing`
- `ready`
- `failed`

---

### 4.7 Generación del reporte
- Se genera:
  - PDF
  - ZIP (según el plan)
- El archivo se guarda en almacenamiento persistente
- Se vincula a la orden

---

### 4.8 Entrega del reporte
- El usuario puede:
  - descargar el archivo desde su panel
  - usar un enlace/token
  - recibir notificación

El reporte existe **aunque el usuario no esté presente**.

---

## 5. Consumo de recursos (fundamental)

El análisis consume recursos reales, independientemente del resultado:

- OpenAI (clasificación, redacción, síntesis)
- Google CSE (consultas, dorks)
- APIs OSINT externas
- MongoDB (lecturas, escrituras, estados)
- Firebase (auth, sesiones, DB, hosting)
- CPU, RAM, disco, red
- Tiempo de ejecución Node / Python

**El costo está en la ejecución, no en el resultado.**

---

## 6. Política de reembolsos

- **NO hay reembolso una vez iniciado el análisis (`processing`).**
- El análisis se considera iniciado cuando el sistema dispara el job.

No hay reembolso cuando:
- el objetivo es inválido
- no se encuentran resultados
- el objetivo contiene errores de escritura
- el usuario cambia de opinión
- el usuario cierra la página
- el reporte contiene “sin hallazgos”

La ausencia de resultados **también es un resultado OSINT**.

Solo hay reembolso si:
- el sistema no entrega ningún reporte
- ocurre un fallo técnico atribuible a BauzaGPT
- el job termina en estado `failed` sin entregables

---

## 7. Marco legal básico

- El servicio se basa exclusivamente en información pública
- No se accede a bases privadas ni se hackea nada
- No se garantiza exactitud absoluta
- Los reportes son informativos
- El usuario es responsable del uso de la información

BauzaGPT no se hace responsable por decisiones tomadas con base en los reportes.

---

## 8. Lo que NO se hace (a propósito)

- No se simulan análisis
- No se entregan resultados falsos
- No se promete “encontrar información”
- No se fuerza un MVP engañoso
- No se acopla frontend al backend

---

## 9. Estado actual del proyecto

✔ Arquitectura definida  
✔ Flujo de usuario completo definido  
✔ Backend real funcionando  
✔ Entrega garantizada definida  
✔ Marco legal coherente  

⏳ Contrato Node ↔ Python pendiente  
⏳ OSINT real por ampliar  
⏳ Frontend aún sin conexión real al backend  

---

## 10. Próximo paso REAL

Definir el **contrato Node ↔ Motor de análisis**, incluyendo:

- cómo Node invoca el motor
- parámetros de entrada
- manejo de errores
- confirmación de finalización
- ubicación del reporte

**No avanzar frontend antes de cerrar este contrato.**

---

## 11. Regla de continuidad

Este archivo es el **ancla del proyecto**.

Antes de:
- cambiar arquitectura
- agregar features
- tocar frontend, pagos o legal

Leer este STATE.

---

Fin del documento.
