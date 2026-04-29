# Camiska Lab

Hub personal para `camiska.lat`, pensado para correr como app estática en Docker y servirse con nginx en el puerto 80 del contenedor.

## Desarrollo local

```bash
npm install
npm run dev
```

El login visual de desarrollo usa:

```text
usuario: camiska
clave: camiska
```

Este login está dentro del frontend y sirve para probar la experiencia. La protección real en producción la hace nginx con `HUB_USER` y `HUB_PASSWORD`.

## Build

```bash
npm run build
```

## Docker

El contenedor usa nginx y Basic Auth. Construye la imagen:

```bash
docker build -t app-hub .
```

Ejecuta el contenedor definiendo usuario y contraseña:

```bash
docker run -d \
  --name app-hub \
  -p 3000:80 \
  -e HUB_USER=camiska \
  -e HUB_PASSWORD='cambia-esta-clave' \
  --restart unless-stopped \
  app-hub
```

Cloudflare Tunnel:

```text
camiska.lat -> http://localhost:3000
```

## Comandos solicitados

```bash
npm install
npm run dev
npm run build
docker build -t app-hub .
docker run -d --name app-hub -p 3000:80 --restart unless-stopped app-hub
```

Nota: el comando `docker run` solicitado no define credenciales y el contenedor se detendrá a propósito. Para login seguro usa el comando con `HUB_USER` y `HUB_PASSWORD` de la sección Docker.

## Editar login visual

Para cambiar el usuario y clave del login visual local, edita estas constantes en `src/main.ts`:

```ts
const LOGIN_USER = "camiska";
const LOGIN_PASSWORD = "camiska";
```

## Editar servicios

Los servicios están definidos en `src/main.ts` dentro del array `services`:

```ts
const services = [
  {
    name: "Diamilo",
    description: "App personal para planes, metas y watchlist.",
    url: "https://diamilo.camiska.lat",
    status: "public",
    icon: "target",
  },
];
```

Estados disponibles:

- `public`
- `private`
- `soon`

Iconos disponibles:

- `target`
- `briefcase`
- `cloud`
- `activity`
- `lock`
