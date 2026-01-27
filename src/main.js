import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup,
         RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

const cfg = {
  apiKey:     import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:  import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId:      import.meta.env.VITE_FIREBASE_APP_ID
}
const app  = initializeApp(cfg)
const auth = getAuth(app)

// --- LOGIN GOOGLE ---
const provider = new GoogleAuthProvider()
window.bauzaLoginGoogle = async () => {
  const { user } = await signInWithPopup(auth, provider)
  const token = await user.getIdToken()
  localStorage.setItem('bauza_token', token)
  localStorage.setItem('bauza_user', JSON.stringify({
    uid:user.uid, email:user.email, name:user.displayName, photo:user.photoURL
  }))
  window.location.href = './cuenta_ok.html?paid=1'
}

// --- BUSCADOR MULTI-MOTOR ---
function openIf(checked, url){ if(checked) window.open(url, '_blank', 'noopener') }
window.bauzaSearch = () => {
  const qEl = document.getElementById('q'); const q = qEl.value?.trim()
  if(!q){ alert('Escribe una consulta'); qEl?.focus(); return }
  const g = document.getElementById('eng_google').checked
  const b = document.getElementById('eng_bing').checked
  const d = document.getElementById('eng_ddg').checked
  const enc = encodeURIComponent(q)
  openIf(g, https://www.google.com/search?q=)
  openIf(b, https://www.bing.com/search?q=)
  openIf(d, https://duckduckgo.com/?q=)
}
document.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && document.activeElement?.id==='q') window.bauzaSearch() })

// --- (Opcional) Teléfono si luego lo activas ---
let recaptcha
window.bauzaSendCode = async (e) => {
  e.preventDefault()
  const phone = document.querySelector('#phoneInput')?.value
  if (!phone) return alert('Pon un número con +52...')
  if (!recaptcha) recaptcha = new RecaptchaVerifier(auth,'recaptcha-container',{ size:'invisible' })
  window.confirmationResult = await signInWithPhoneNumber(auth, phone, recaptcha)
  alert('Código SMS enviado')
}
