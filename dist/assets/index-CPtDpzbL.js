(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))e(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&e(a)}).observe(document,{childList:!0,subtree:!0});function o(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function e(t){if(t.ep)return;t.ep=!0;const r=o(t);fetch(t.href,r)}})();const u=[{name:"Diamilo",description:"Planes, metas y watchlist",url:"https://diamilo.camiska.lat",icon:"target"},{name:"Nube",description:"Archivos y copias personales",url:"https://nube.camiska.lat/",icon:"cloud"}],p={cloud:'<path d="M17.5 19H8a6 6 0 1 1 1.2-11.9A7 7 0 0 1 22 11.8 4.5 4.5 0 0 1 17.5 19Z" />',target:'<circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" />',arrow:'<path d="M5 12h14" /><path d="m13 6 6 6-6 6" />'};function l(s,i=22){return`<svg width="${i}" height="${i}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p[s]}</svg>`}function m(s){const i=new URL(s.url).hostname;return`
    <a class="site-card" href="${s.url}" target="_blank" rel="noreferrer">
      <span class="site-icon">${l(s.icon,26)}</span>
      <span class="site-copy">
        <strong>${s.name}</strong>
        <small>${s.description}</small>
        <span>${i}</span>
      </span>
      <span class="site-arrow">${l("arrow",20)}</span>
    </a>
  `}function n(s){return s.replace(/[&<>'"]/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[i])}function d(s){return new Intl.DateTimeFormat("es-CO",{dateStyle:"short",timeStyle:"short"}).format(new Date(s))}const h={success:"Acceso correcto",failure:"Acceso fallido",blocked:"Intento bloqueado",logout:"Sesión cerrada",revoked:"Sesión eliminada",unlock:"Bloqueo eliminado"};async function c(){const s=document.querySelector("#security-content");try{const i=await fetch("/api/security",{credentials:"same-origin"});if(i.status===401||i.redirected){window.location.href="/";return}if(!i.ok)throw new Error("No se pudo cargar la actividad");const o=await i.json();s.innerHTML=`
      <div class="security-column">
        <h3>Sesiones activas</h3>
        <div class="session-list">
          ${o.sessions.map(e=>`
            <article class="session-item">
              <div>
                <strong>${n(e.device)}</strong>
                ${e.current?'<span class="current-badge">Este dispositivo</span>':""}
                <p>${n(e.ip)} · Último uso ${d(e.lastSeen)}</p>
              </div>
              <button class="revoke-button" type="button" data-session-id="${n(e.id)}">
                ${e.current?"Salir":"Cerrar"}
              </button>
            </article>
          `).join("")}
        </div>
      </div>

      <div class="security-column">
        <h3>Actividad reciente</h3>
        <div class="event-list">
          ${o.events.length?o.events.map(e=>`
            <article class="event-item event-${e.result}">
              <span class="event-dot" aria-hidden="true"></span>
              <div>
                <strong>${h[e.result]}</strong>
                <p>${n(e.device)} · ${n(e.ip)}</p>
                <time>${d(e.timestamp)}</time>
              </div>
            </article>
          `).join(""):'<p class="empty-state">Todavía no hay actividad.</p>'}
        </div>
      </div>
    `,s.querySelectorAll(".revoke-button").forEach(e=>{e.addEventListener("click",async()=>{var a;e.disabled=!0;const t=new URLSearchParams({id:e.dataset.sessionId||""});(await fetch("/api/sessions/revoke",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:t})).ok?((a=e.textContent)==null?void 0:a.trim())==="Salir"?window.location.href="/":await c():e.disabled=!1})})}catch{s.innerHTML='<p class="empty-state">No se pudo cargar la actividad.</p>'}}document.querySelector("#root").innerHTML=`
  <main class="app-shell">
    <header class="header">
      <div>
        <p>camiska.lat</p>
        <h1>Mis sitios</h1>
      </div>

      <form action="/logout" method="post">
        <button class="logout" type="submit">Salir</button>
      </form>
    </header>

    <section class="sites" aria-label="Mis sitios">
      ${u.map(m).join("")}
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
`;document.querySelector("#refresh-security").addEventListener("click",c);c();
