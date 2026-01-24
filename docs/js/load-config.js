/**
 * load-config.js
 * Carga ./config.json al iniciar y guarda en window.__CONFIG
 * Uso: <script src="/load-config.js" defer></script>
 */
(function(){
  window.__CONFIG = window.__CONFIG || {};
  function startAppSafe(){
    try {
      if (typeof startApp === 'function') { startApp(); return; }
      if (typeof initApp === 'function') { initApp(); return; }
      // Si tu app espera otro nombre, puedes llamarlo aquí.
    } catch(e){ console.warn("startApp falló:", e); }
  }

  fetch('./config.json', { cache: 'no-store' })
    .then(function(res){ return res.ok ? res.json() : {}; })
    .then(function(cfg){
      window.__CONFIG = cfg || {};
      startAppSafe();
    })
    .catch(function(err){
      console.warn("No se cargó config.json:", err);
      startAppSafe();
    });
})();
