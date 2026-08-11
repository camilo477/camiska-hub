import "./styles.css";

type IconName = "cloud" | "target" | "arrow";

type Session = {
  id: string;
  current: boolean;
  device: string;
  ip: string;
  createdAt: number;
  lastSeen: number;
};

type SecurityEvent = {
  id: string;
  result: "success" | "failure" | "blocked" | "logout" | "revoked" | "unlock";
  ip: string;
  device: string;
  timestamp: number;
  detail?: string;
};

type SecurityData = {
  sessions: Session[];
  events: SecurityEvent[];
};

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Service = {
  name: string;
  description: string;
  url: string;
  icon: IconName;
};

// Agrega o edita aquí los accesos que quieras mostrar.
const services: Service[] = [
  {
    name: "Diamilo",
    description: "Planes, metas y watchlist",
    url: "https://diamilo.camiska.lat",
    icon: "target",
  },
  {
    name: "Nube",
    description: "Archivos y copias personales",
    url: "https://nube.camiska.lat/",
    icon: "cloud",
  },
];

const icons: Record<IconName, string> = {
  cloud:
    '<path d="M17.5 19H8a6 6 0 1 1 1.2-11.9A7 7 0 0 1 22 11.8 4.5 4.5 0 0 1 17.5 19Z" />',
  target:
    '<circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" />',
  arrow: '<path d="M5 12h14" /><path d="m13 6 6 6-6 6" />',
};

function icon(name: IconName, size = 22) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
}

function serviceCard(service: Service) {
  const hostname = new URL(service.url).hostname;

  return `
    <a class="site-card" href="${service.url}" target="_blank" rel="noreferrer">
      <span class="site-icon">${icon(service.icon, 26)}</span>
      <span class="site-copy">
        <strong>${service.name}</strong>
        <small>${service.description}</small>
        <span>${hostname}</span>
      </span>
      <span class="site-arrow">${icon("arrow", 20)}</span>
    </a>
  `;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character]!);
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

const eventLabels: Record<SecurityEvent["result"], string> = {
  success: "Acceso correcto",
  failure: "Acceso fallido",
  blocked: "Intento bloqueado",
  logout: "Sesión cerrada",
  revoked: "Sesión eliminada",
  unlock: "Bloqueo eliminado",
};

async function loadSecurity() {
  const container = document.querySelector<HTMLDivElement>("#security-content")!;

  try {
    const response = await fetch("/api/security", { credentials: "same-origin" });
    if (response.status === 401 || response.redirected) {
      window.location.href = "/";
      return;
    }
    if (!response.ok) throw new Error("No se pudo cargar la actividad");

    const data = await response.json() as SecurityData;
    container.innerHTML = `
      <div class="security-column">
        <h3>Sesiones activas</h3>
        <div class="session-list">
          ${data.sessions.map((session) => `
            <article class="session-item">
              <div>
                <strong>${escapeHtml(session.device)}</strong>
                ${session.current ? '<span class="current-badge">Este dispositivo</span>' : ""}
                <p>${escapeHtml(session.ip)} · Último uso ${formatDate(session.lastSeen)}</p>
              </div>
              <button class="revoke-button" type="button" data-session-id="${escapeHtml(session.id)}">
                ${session.current ? "Salir" : "Cerrar"}
              </button>
            </article>
          `).join("")}
        </div>
      </div>

      <div class="security-column">
        <h3>Actividad reciente</h3>
        <div class="event-list">
          ${data.events.length ? data.events.map((event) => `
            <article class="event-item event-${event.result}">
              <span class="event-dot" aria-hidden="true"></span>
              <div>
                <strong>${eventLabels[event.result]}</strong>
                <p>${escapeHtml(event.device)} · ${escapeHtml(event.ip)}</p>
                <time>${formatDate(event.timestamp)}</time>
              </div>
            </article>
          `).join("") : '<p class="empty-state">Todavía no hay actividad.</p>'}
        </div>
      </div>
    `;

    container.querySelectorAll<HTMLButtonElement>(".revoke-button").forEach((button) => {
      button.addEventListener("click", async () => {
        button.disabled = true;
        const body = new URLSearchParams({ id: button.dataset.sessionId || "" });
        const revokeResponse = await fetch("/api/sessions/revoke", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });

        if (revokeResponse.ok) {
          if (button.textContent?.trim() === "Salir") window.location.href = "/";
          else await loadSecurity();
        } else {
          button.disabled = false;
        }
      });
    });
  } catch {
    container.innerHTML = '<p class="empty-state">No se pudo cargar la actividad.</p>';
  }
}

document.querySelector<HTMLDivElement>("#root")!.innerHTML = `
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
      ${services.map(serviceCard).join("")}
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
`;

document.querySelector<HTMLButtonElement>("#refresh-security")!.addEventListener("click", loadSecurity);
void loadSecurity();

let installPrompt: InstallPromptEvent | null = null;
const installButton = document.querySelector<HTMLButtonElement>("#install-button")!;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event as InstallPromptEvent;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!installPrompt) return;
  await installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installButton.hidden = true;
});

window.addEventListener("appinstalled", () => {
  installPrompt = null;
  installButton.hidden = true;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js", { scope: "/" });
  });
}
