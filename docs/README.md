📁 Estructura del proyecto

El proyecto está dividido en módulos bien definidos para que sea fácil de mantener y escalar. A grandes rasgos la estructura es:

bauzagpt/
├─ frontend/         # Sitio público (GitHub Pages)
│  ├─ index.html     # Página principal con hero y CTA
│  ├─ login.html     # Inicio de sesión con Firebase
│  ├─ pago.html      # Métodos de pago dinámicos
│  ├─ nuevo-pedido.html  # Formulario para generar pedidos OSINT
│  ├─ dashboard.html      # Panel de usuario con pedidos y descargas
│  ├─ privacidad.html y terminos.html   # Avisos legales
│  ├─ config.json    # Configuración de Firebase y URLs de la API
│  ├─ load-config.js # Carga de configuración en el navegador
│  ├─ js/            # Scripts de UI (auth, pedidos, dashboard…)
│  ├─ css/           # Tus estilos (opcional)
│  ├─ img/           # Imágenes y recursos
│  └─ CNAME, .nojekyll, sitemap.xml
│
├─ backend/
│  ├─ node/          # API y pagos en Node.js/Express
│  │    ├─ index.js  # Servidor Express con rutas (/public/orders, /client/orders…)
│  │    ├─ create-checkout-session.js
│  │    └─ stripe-webhook.js
│  └─ python/        # API OSINT en Python (opcional)
│       ├─ server.py
│       └─ requirements.txt
│
├─ workers/
│  └─ cloudflare/    # Worker para autenticación y tareas de edge
│       ├─ auth-worker.js
│       └─ wrangler.toml
│
├─ osint-tools/      # Scripts independientes de OSINT (dorking, search…)
├─ deploy.sh         # Script de despliegue (personalizable)
├─ SECURITY.md       # Políticas de seguridad
└─ README.md (este archivo)

🔧 Configuración del frontend

El archivo frontend/config.json define la configuración pública de tu proyecto. Contiene tu clave de Firebase y, lo más importante, apiBase, que indica al navegador dónde está tu servidor de API. Sigue estas recomendaciones:

Clave de Firebase: mantiene la estructura:

"firebase": {
  "apiKey": "TU_API_KEY_PUBLICA",
  "authDomain": "tu-proyecto.firebaseapp.com",
  "projectId": "tu-proyecto"
}


Estas claves son públicas y no comprometen tu seguridad si se comparten en el frontend.

apiBase: apunta a la raíz de tu backend. Hay dos escenarios:

Desarrollo local: si ejecutas el backend en tu equipo con npm start, usa "http://localhost:8080".

Producción: cuando despliegues el backend en Internet, sustituye por la URL de tu servidor. Por ejemplo:

Subdominio dedicado: "https://api.bauzagpt.com"

Ruta en el mismo dominio (si lo configuras): "https://www.bauzagpt.com/api"

Importante: GitHub Pages no ejecuta tu servidor Express. Si apuntas apiBase a https://www.bauzagpt.com/api necesitarás un proxy o un servidor que sirva las rutas /api desde tu backend real (por ejemplo, mediante Cloudflare Workers o Nginx).

Rutas de pagos: el objeto payments define los endpoints relativos que usa el frontend. No modifiques sus valores a menos que cambies las rutas en tu servidor Node.

Ejemplo de config.json válido en desarrollo:

{
  "firebase": {
    "apiKey": "AIzaSy…",
    "authDomain": "studio-6473341422-75630.firebaseapp.com",
    "projectId": "studio-6473341422-75630"
  },
  "apiBase": "http://localhost:8080",
  "payments": {
    "createOrder": "/public/orders",
    "getOrders": "/client/orders",
    "createCheckoutSession": "/api/create-checkout-session"
  }
}

🖥️ Backend Node.js

El servidor Express se encuentra en backend/node/index.js. Sigue estos pasos para probarlo:

Instala las dependencias:

cd backend/node
npm install


Asegúrate de tener instalado CORS para permitir peticiones desde tu frontend:

npm install cors


Y luego importa y configura CORS en index.js:

import cors from 'cors';
const app = express();
app.use(cors({ origin: ['http://localhost:8000', 'https://www.bauzagpt.com'] }));


Ejecuta el servidor:

npm start


Esto levantará el backend en el puerto 8080. Comprueba que funciona visitando http://localhost:8080/api/health.

Cuando estés listo para producción, despliega este directorio (backend/node) en tu proveedor favorito (Render, Railway, Fly.io…). Configura variables de entorno (PORT, claves secretas de Stripe, etc.) y actualiza apiBase en config.json con la URL pública del backend.

🐍 Backend Python (Opcional)

Si prefieres construir la API OSINT en Python, puedes usar el módulo backend/python como base:

Crea un entorno virtual: python3 -m venv .venv.

Instala dependencias: pip install -r requirements.txt.

Modifica server.py para añadir tus rutas OSINT (por ejemplo, /search o /dorking).

Despliega este servicio en un proveedor que soporte Python (Render, Railway, etc.).

⚙️ Worker de Cloudflare

El archivo workers/cloudflare/auth-worker.js puede usarse para tareas en el borde (por ejemplo, autenticación, validación o redirección). Para desplegarlo:

Instala Wrangler: npm install -g wrangler.

Configura wrangler.toml con tu account_id, el nombre del worker y el route (la URL donde se ejecutará).

Ejecuta wrangler publish para desplegarlo.

Puedes integrar este worker con tu backend para manejar autenticación antes de llegar al servidor.

🧰 OSINT Tools

Los scripts en osint-tools/ son utilidades de dorking, búsqueda y validación de enlaces. No están acoplados al sitio web; ejecútalos desde la terminal cuando necesites generar reportes manuales. Por ejemplo:

cd osint-tools/dorking
python dork_runner.py --query "correo@example.com" --output salida.zip


Luego sube el ZIP o PDF resultante desde tu panel de administración para que el usuario lo descargue.

🚀 Despliegue paso a paso

Prepara tu repositorio GitHub: Clona bauzagpt.com, copia estos archivos dentro y crea las ramas que necesites (main o gh-pages para el frontend).

Frontend: Publica el contenido de frontend/ en GitHub Pages o cualquier servidor estático. Configura el dominio en el archivo CNAME si usas uno personalizado.

Backend: Despliega backend/node en tu proveedor y apunta tu dominio o subdominio API hacia allí. No olvides activar CORS y HTTPS.

Configura DNS: En Cloudflare o tu proveedor de DNS, crea registros A/CNAME para tu dominio (p. ej., www.bauzagpt.com para el frontend y api.bauzagpt.com para el backend). Añade registros TXT para verificación y seguridad (SPF, DMARC, DKIM).

Actualiza config.json: Cambia apiBase a tu URL final y sube el archivo a GitHub.

Prueba: Crea un pedido, revisa el dashboard y asegúrate de que las descargas funcionen. Ajusta cualquier detalle de UI o estilo.

🛡️ Buenas prácticas

Nunca subas tus claves secretas (Stripe, Firebase privada, claves de API) al repositorio. Usa variables de entorno (.env) o configuraciones en tu servicio de despliegue.

Personaliza la apariencia: edita CSS y agrega imágenes en frontend/img/ para que tu marca destaque.

Documenta cada script OSINT: agrega un README dentro de osint-tools/ que explique cómo usar cada módulo.

Realiza commits frecuentes y usa ramas para nuevas características. Esto facilita revisiones y rollbacks.
