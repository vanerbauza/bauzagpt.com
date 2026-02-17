import { getToken } from './auth.js';

const API = 'https://bauzagpt-backend.fly.dev';

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
