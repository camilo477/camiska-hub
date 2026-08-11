import "./styles.css";

type IconName = "cloud" | "target" | "arrow";

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

document.querySelector<HTMLDivElement>("#root")!.innerHTML = `
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
      ${services.map(serviceCard).join("")}
    </section>
  </main>
`;
