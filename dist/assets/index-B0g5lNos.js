(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&o(n)}).observe(document,{childList:!0,subtree:!0});function s(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(t){if(t.ep)return;t.ep=!0;const r=s(t);fetch(t.href,r)}})();const u="camiska",h="camiska",c="camiska-hub-authenticated",v=[{name:"Diamilo",description:"App personal para planes, metas y watchlist.",url:"https://diamilo.camiska.lat",status:"public",icon:"target"},{name:"Portafolio",description:"Perfil profesional, proyectos y contacto.",status:"soon",icon:"briefcase"},{name:"Nube",description:"Nube personal para archivos y backups.",url:"https://nube.camiska.lat/",status:"public",icon:"cloud"},{name:"Status",description:"Estado de servicios, Raspberry y túneles.",status:"soon",icon:"activity"},{name:"Admin",description:"Acceso interno a herramientas privadas.",status:"private",icon:"lock"}],m={public:"Público",private:"Privado",soon:"Próximamente"},b={public:"status-public",private:"status-private",soon:"status-soon"},d=[{label:"Internet",icon:"globe"},{label:"Cloudflare",icon:"shield"},{label:"Tunnel",icon:"network"},{label:"Raspberry Pi",icon:"server"},{label:"Docker Apps",icon:"container"}],f={activity:'<path d="M22 12h-4l-3 8L9 4l-3 8H2" />',"arrow-right":'<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />',briefcase:'<path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" /><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 12h18" />',cloud:'<path d="M17.5 19H8a6 6 0 1 1 1.2-11.9A7 7 0 0 1 22 11.8 4.5 4.5 0 0 1 17.5 19Z" />',"cloud-cog":'<path d="M11 19H8a6 6 0 1 1 1.2-11.9A7 7 0 0 1 22 11.8" /><circle cx="17" cy="17" r="2" /><path d="M17 13v1" /><path d="M17 20v1" /><path d="m14.2 14.2.7.7" /><path d="m19.1 19.1.7.7" /><path d="M13 17h1" /><path d="M20 17h1" />',container:'<rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 5v14" /><path d="M11 5v14" /><path d="M15 5v14" />',"external-link":'<path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />',globe:'<circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 0 20" /><path d="M12 2a15.3 15.3 0 0 0 0 20" />',"hard-drive":'<path d="M22 12H2" /><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z" /><circle cx="6" cy="16" r="1" /><circle cx="10" cy="16" r="1" />',lock:'<rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />',network:'<rect x="16" y="16" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="9" y="2" width="6" height="6" rx="1" /><path d="M12 8v4" /><path d="M5 16v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />',server:'<rect x="3" y="4" width="18" height="8" rx="2" /><rect x="3" y="12" width="18" height="8" rx="2" /><path d="M7 8h.01" /><path d="M7 16h.01" />',shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-5" />',sparkles:'<path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8Z" /><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9Z" /><path d="m5 15 .9 2.1L8 18l-2.1.9L5 21l-.9-2.1L2 18l2.1-.9Z" />',target:'<circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />'};function i(e,a=20,s=""){return`
    <svg${s?` class="${s}"`:""} width="${a}" height="${a}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      ${f[e]}
    </svg>
  `}function g(e){const a=e.status==="private",o=!!e.url&&e.status==="public"?`<a class="service-link" href="${e.url}" target="_blank" rel="noreferrer">Abrir ${i("external-link",16)}</a>`:`<button class="service-link disabled" disabled>${a?"Bloqueado":"Próximamente"} ${i(a?"lock":"sparkles",16)}</button>`;return`
    <article class="service-card ${a?"is-locked":""}">
      <div class="service-topline">
        <div class="service-icon" aria-hidden="true">
          ${i(e.icon,22)}
        </div>
        <span class="status-pill ${b[e.status]}">${m[e.status]}</span>
      </div>

      <div>
        <h3>${e.name}</h3>
        <p>${e.description}</p>
      </div>

      ${o}
    </article>
  `}function y(){return d.map((e,a)=>{const s=a<d.length-1?i("arrow-right",22,"infra-arrow"):"";return`
        <div class="infra-node">
          ${i(e.icon,24)}
          <strong>${e.label}</strong>
        </div>
        ${s}
      `}).join("")}function l(e=""){document.querySelector("#root").innerHTML=`
    <main class="login-shell">
      <section class="login-panel" aria-label="Login Camiska Lab">
        <div class="login-brand">
          <div class="service-icon login-brand-icon">
            ${i("lock",24)}
          </div>
          <div>
            <span>camiska.lat</span>
            <h1>Camiska Lab</h1>
          </div>
        </div>

        <form class="login-form" id="login-form">
          <label for="username">Usuario</label>
          <input id="username" name="username" type="text" autocomplete="username" placeholder="camiska" required />

          <label for="password">Clave</label>
          <input id="password" name="password" type="password" autocomplete="current-password" placeholder="Clave de acceso" required />

          <button class="primary-action login-submit" type="submit">
            Entrar
            ${i("arrow-right",18)}
          </button>

          <p class="login-error" id="login-error" role="alert">${e}</p>
        </form>
      </section>
    </main>
  `,document.querySelector("#login-form").addEventListener("submit",a=>{a.preventDefault();const s=new FormData(a.currentTarget),o=String(s.get("username")??""),t=String(s.get("password")??"");if(o===u&&t===h){sessionStorage.setItem(c,"true"),p();return}l("Usuario o clave incorrectos.")})}function p(){document.querySelector("#root").innerHTML=`
  <main>
    <nav class="topbar" aria-label="Navegación principal">
      <a href="#" class="topbar-brand">Camiska Lab</a>
      <button class="logout-button" id="logout-button" type="button">
        Salir
        ${i("lock",16)}
      </button>
    </nav>

    <section class="hero">
      <div class="hero-content">
        <div class="eyebrow">
          ${i("hard-drive",16)}
          camiska.lat
        </div>
        <h1>Camiska Lab</h1>
        <p>Apps personales, experimentos y servicios self-hosted desde mi Raspberry Pi.</p>
        <div class="hero-actions">
          <a class="primary-action" href="#servicios">
            Ver servicios
            ${i("arrow-right",18)}
          </a>
          <a class="secondary-action" href="#portafolio">Portafolio</a>
        </div>
      </div>

      <div class="hero-panel" aria-label="Resumen de infraestructura">
        <div class="panel-header">
          ${i("cloud-cog",20)}
          <span>Homelab Online</span>
        </div>
        <dl class="metrics">
          <div>
            <dt>Apps</dt>
            <dd>5</dd>
          </div>
          <div>
            <dt>Gateway</dt>
            <dd>Cloudflare</dd>
          </div>
          <div>
            <dt>Host</dt>
            <dd>Raspberry Pi 4</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="section" id="servicios">
      <div class="section-heading">
        <span>Servicios</span>
        <h2>Accesos principales</h2>
      </div>
      <div class="services-grid">
        ${v.map(g).join("")}
      </div>
    </section>

    <section class="section" id="infraestructura">
      <div class="section-heading">
        <span>Infraestructura</span>
        <h2>Ruta de acceso</h2>
      </div>
      <div class="infra-flow">
        ${y()}
      </div>
    </section>

    <footer>
      <span>Built with Raspberry Pi, Docker and Cloudflare Tunnel.</span>
      <strong>camiska.lat</strong>
    </footer>
  </main>
`,document.querySelector("#logout-button").addEventListener("click",()=>{sessionStorage.removeItem(c),l()})}sessionStorage.getItem(c)==="true"?p():l();
