const API = 'https://bauzagpt-backend.fly.dev';

const params = new URLSearchParams(window.location.search);
const orderId = params.get('orderId');
const token = sessionStorage.getItem('token');

document.getElementById('downloadBtn').onclick = () => {
  window.location.href = API + '/api/orders/' + orderId + '/pdf?token=' + token;
};
