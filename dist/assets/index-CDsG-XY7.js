(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))e(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&e(a)}).observe(document,{childList:!0,subtree:!0});function n(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function e(i){if(i.ep)return;i.ep=!0;const r=n(i);fetch(i.href,r)}})();const m=[{name:"Diamilo",description:"Planes, metas y watchlist",url:"https://diamilo.camiska.lat",icon:"target"},{name:"Nube",description:"Archivos y copias personales",url:"https://nube.camiska.lat/",icon:"cloud"}],h={cloud:'<path d="M17.5 19H8a6 6 0 1 1 1.2-11.9A7 7 0 0 1 22 11.8 4.5 4.5 0 0 1 17.5 19Z" />',target:'<circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" />',arrow:'<path d="M5 12h14" /><path d="m13 6 6 6-6 6" />'};function u(t,s=22){return`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${h[t]}</svg>`}function f(t){const s=new URL(t.url).hostname;return`
    <a class="site-card" href="${t.url}" target="_blank" rel="noreferrer">
      <span class="site-icon">${u(t.icon,26)}</span>
      <span class="site-copy">
        <strong>${t.name}</strong>
        <small>${t.description}</small>
        <span>${s}</span>
      </span>
      <span class="site-arrow">${u("arrow",20)}</span>
    </a>
  `}function c(t){return t.replace(/[&<>'"]/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[s])}function p(t){return new Intl.DateTimeFormat("es-CO",{dateStyle:"short",timeStyle:"short"}).format(new Date(t))}const v={success:"Acceso correcto",failure:"Acceso fallido",blocked:"Intento bloqueado",logout:"Sesión cerrada",revoked:"Sesión eliminada",unlock:"Bloqueo eliminado"};async function d(){const t=document.querySelector("#security-content");try{const s=await fetch("/api/security",{credentials:"same-origin"});if(s.status===401||s.redirected){window.location.href="/";return}if(!s.ok)throw new Error("No se pudo cargar la actividad");const n=await s.json();t.innerHTML=`
      <div class="security-column">
        <h3>Sesiones activas</h3>
        <div class="session-list">
          ${n.sessions.map(e=>`
            <article class="session-item">
              <div>
                <strong>${c(e.device)}</strong>
                ${e.current?'<span class="current-badge">Este dispositivo</span>':""}
                <p>${c(e.ip)} · Último uso ${p(e.lastSeen)}</p>
              </div>
              <button class="revoke-button" type="button" data-session-id="${c(e.id)}">
                ${e.current?"Salir":"Cerrar"}
              </button>
            </article>
          `).join("")}
        </div>
      </div>

      <div class="security-column">
        <h3>Actividad reciente</h3>
        <div class="event-list">
          ${n.events.length?n.events.map(e=>`
            <article class="event-item event-${e.result}">
              <span class="event-dot" aria-hidden="true"></span>
              <div>
                <strong>${v[e.result]}</strong>
                <p>${c(e.device)} · ${c(e.ip)}</p>
                <time>${p(e.timestamp)}</time>
              </div>
            </article>
          `).join(""):'<p class="empty-state">Todavía no hay actividad.</p>'}
        </div>
      </div>
    `,t.querySelectorAll(".revoke-button").forEach(e=>{e.addEventListener("click",async()=>{var a;e.disabled=!0;const i=new URLSearchParams({id:e.dataset.sessionId||""});(await fetch("/api/sessions/revoke",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:i})).ok?((a=e.textContent)==null?void 0:a.trim())==="Salir"?window.location.href="/":await d():e.disabled=!1})})}catch{t.innerHTML='<p class="empty-state">No se pudo cargar la actividad.</p>'}}document.querySelector("#root").innerHTML=`
  <main class="app-shell">
    <header class="header">
      <div>
        <p>camiska.lat</p>
        <h1>Mis sitios</h1>
      </div>

      <div class="header-actions">
        <button class="install-button" id="install-button" type="button" hidden>Instalar</button>
        <form action="/logout" method="post">
          <button class="logout" type="submit">Salir</button>
        </form>
      </div>
    </header>

    <section class="sites" aria-label="Mis sitios">
      ${m.map(f).join("")}
    </section>

    <section class="security" aria-labelledby="security-title">
      <div class="section-title">
        <div>
          <p>Seguridad</p>
          <h2 id="security-title">Dispositivos y accesos</h2>
        </div>
        <button class="refresh-button" id="refresh-security" type="button">Actualizar</button>
      </div>
      <div class="security-content" id="security-content">
        <p class="empty-state">Cargando actividad…</p>
      </div>
    </section>
  </main>
`;document.querySelector("#refresh-security").addEventListener("click",d);d();let o=null;const l=document.querySelector("#install-button");window.addEventListener("beforeinstallprompt",t=>{t.preventDefault(),o=t,l.hidden=!1});l.addEventListener("click",async()=>{o&&(await o.prompt(),await o.userChoice,o=null,l.hidden=!0)});window.addEventListener("appinstalled",()=>{o=null,l.hidden=!0});"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js",{scope:"/"})});
