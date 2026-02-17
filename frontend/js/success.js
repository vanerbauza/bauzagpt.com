const API = 'https://bauzagpt-backend.fly.dev';

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
