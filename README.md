# App Hub

Una página privada y sencilla para abrir los sitios de `camiska.lat`.

## Desarrollo visual

```bash
npm install
npm run dev
```

El servidor de Vite muestra directamente el dashboard. El login real se prueba con Docker, porque la contraseña se valida en el servidor y nunca se incluye en el JavaScript del navegador.

## Docker

Construye la imagen:

```bash
docker build -t app-hub .
```

Inicia el contenedor con una única contraseña:

```bash
docker run -d \
  --name app-hub \
  -p 3000:80 \
  -e HUB_PASSWORD='cambia-esta-clave' \
  --restart unless-stopped \
  app-hub
```

Abre `http://localhost:3000`. La sesión dura siete días como máximo y se elimina al pulsar **Salir**. También se invalida cada vez que reinicia el contenedor.

`HUB_PASSWORD` es obligatoria. Ya no hay usuario, contraseña fija en el frontend ni un segundo cuadro de autenticación.

## Editar sitios

Los accesos están en el array `services` de `src/main.ts`:

```ts
const services = [
  {
    name: "Diamilo",
    description: "Planes, metas y watchlist",
    url: "https://diamilo.camiska.lat",
    icon: "target",
  },
];
```
