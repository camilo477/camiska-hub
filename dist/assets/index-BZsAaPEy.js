(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))i(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const s of t.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function a(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function i(e){if(e.ep)return;e.ep=!0;const t=a(e);fetch(e.href,t)}})();const c=[{name:"Diamilo",description:"Planes, metas y watchlist",url:"https://diamilo.camiska.lat",icon:"target"},{name:"Nube",description:"Archivos y copias personales",url:"https://nube.camiska.lat/",icon:"cloud"}],l={cloud:'<path d="M17.5 19H8a6 6 0 1 1 1.2-11.9A7 7 0 0 1 22 11.8 4.5 4.5 0 0 1 17.5 19Z" />',target:'<circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" />',arrow:'<path d="M5 12h14" /><path d="m13 6 6 6-6 6" />'};function n(r,o=22){return`<svg width="${o}" height="${o}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${l[r]}</svg>`}function u(r){const o=new URL(r.url).hostname;return`
    <a class="site-card" href="${r.url}" target="_blank" rel="noreferrer">
      <span class="site-icon">${n(r.icon,26)}</span>
      <span class="site-copy">
        <strong>${r.name}</strong>
        <small>${r.description}</small>
        <span>${o}</span>
      </span>
      <span class="site-arrow">${n("arrow",20)}</span>
    </a>
  `}document.querySelector("#root").innerHTML=`
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
      ${c.map(u).join("")}
    </section>
  </main>
`;
