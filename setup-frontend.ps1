# ============================================
#  BauzaGPT Frontend Auto-Setup (AUTO BACKEND)
# ============================================

# Leer backend.url
if (Test-Path "backend.url") {
    $backendUrl = (Get-Content "backend.url").Trim()
} else {
    Write-Host "ERROR: No se encontró backend.url" -ForegroundColor Red
    Write-Host "Crea un archivo llamado backend.url con la URL del backend."
    exit
}

Write-Host "Backend detectado: $backendUrl" -ForegroundColor Green
Write-Host "Creando frontend..." -ForegroundColor Cyan

# Crear carpetas
New-Item -ItemType Directory -Force -Path "frontend" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/js" | Out-Null

# index.html
@"
<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <title>BauzaGPT OSINT</title>
</head>
<body>

  <h1>BauzaGPT OSINT</h1>

  <input id='target' placeholder='Usuario, email, teléfono…'>
  <button id='startBtn'>Buscar</button>

  <script src='https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js'></script>
  <script src='https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js'></script>

  <script src='js/auth.js'></script>
  <script src='js/index.js'></script>
</body>
</html>
"@ | Set-Content "frontend/index.html"

# auth.js
@"
export async function getToken() {
  const user = firebase.auth().currentUser;
  if (!user) throw new Error('not_authenticated');
  return await user.getIdToken();
}
"@ | Set-Content "frontend/js/auth.js"

# index.js
@"
import { getToken } from './auth.js';

const API = '$backendUrl';

document.getElementById('startBtn').onclick = async () => {
  const target = document.getElementById('target').value.trim();
  if (!target) { alert('Ingresa un target'); return; }

  const token = await getToken();

  const res = await fetch(API + '/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ target })
  });

  const data = await res.json();
  sessionStorage.setItem('orderId', data.orderId);
  window.location.href = data.checkoutUrl;
};
"@ | Set-Content "frontend/js/index.js"

# success.html
@"
<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <title>Procesando OSINT…</title>
</head>
<body>

  <h1>Procesando tu informe OSINT…</h1>
  <p id='status'>Esperando resultados…</p>

  <script src='js/success.js'></script>
</body>
</html>
"@ | Set-Content "frontend/success.html"

# success.js
@"
const API = '$backendUrl';

const orderId = sessionStorage.getItem('orderId');
const token = sessionStorage.getItem('token');

async function getJobId() {
  const res = await fetch(API + '/api/orders/' + orderId + '/job', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  sessionStorage.setItem('jobId', data.jobId);
  return data.jobId;
}

async function checkJob() {
  const jobId = sessionStorage.getItem('jobId') || await getJobId();

  const res = await fetch(API + '/search/' + jobId, {
    headers: { 'Authorization': 'Bearer ' + token }
  });

  const data = await res.json();
  document.getElementById('status').textContent = 'Estado: ' + data.status;

  if (data.status === 'ready') {
    window.location.href = 'download.html?orderId=' + orderId;
  }
}

setInterval(checkJob, 3000);
"@ | Set-Content "frontend/js/success.js"

# download.html
@"
<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <title>Descargar Informe</title>
</head>
<body>

  <h1>Tu informe OSINT está listo</h1>
  <button id='downloadBtn'>Descargar PDF</button>

  <script src='js/download.js'></script>
</body>
</html>
"@ | Set-Content "frontend/download.html"

# download.js
@"
const API = '$backendUrl';

const params = new URLSearchParams(window.location.search);
const orderId = params.get('orderId');
const token = sessionStorage.getItem('token');

document.getElementById('downloadBtn').onclick = () => {
  window.location.href = API + '/api/orders/' + orderId + '/pdf?token=' + token;
};
"@ | Set-Content "frontend/js/download.js"

Write-Host "Frontend generado correctamente." -ForegroundColor Green