# App Hub

Página privada para abrir los sitios de `camiska.lat`.

También funciona como PWA instalable en celular y escritorio. El manifiesto y los iconos son públicos, pero el service worker nunca almacena el login, el dashboard HTML, la API ni información de sesiones.

## Seguridad

- Usuario y contraseña definidos únicamente mediante variables de Docker.
- Una sesión distinta por dispositivo, válida durante un máximo de siete días.
- Registro de sesiones, accesos correctos, fallidos y bloqueados.
- Bloqueo por IP durante 15 minutos después de cinco errores consecutivos.
- Cookies `HttpOnly` y `SameSite=Strict`, cabeceras CSP, HSTS detrás de HTTPS y ejecución del contenedor como usuario sin privilegios.
- Los registros se conservan en un volumen Docker y se limitan a los 200 eventos más recientes.

## Desarrollo visual

```bash
npm install
npm run dev
```

El servidor de Vite muestra directamente el dashboard. La autenticación real se prueba con Docker porque las credenciales nunca se incluyen en el JavaScript del navegador.

## Docker

Crea un archivo `.env`:

```env
HUB_USER=camiska
HUB_PASSWORD=una-contraseña-larga-y-unica
NUBE_SECURITY_URL=https://nube.camiska.lat/api/internal/security
NUBE_SECURITY_TOKEN=el-mismo-token-configurado-en-nube
DIAMILO_SECURITY_URL=https://diamilo.camiska.lat/api/internal/security
DIAMILO_SECURITY_TOKEN=el-mismo-token-configurado-en-diamilo
```

Construye e inicia:

```bash
docker build -t app-hub:latest .

docker run -d \
  --name app-hub \
  --restart unless-stopped \
  --env-file .env \
  -v app-hub-data:/app/data \
  -p 3000:8080 \
  app-hub:latest
```

Abre `http://localhost:3000`.

En el dominio HTTPS aparecerá el botón **Instalar** cuando el navegador soporte instalación directa. En iPhone/iPad usa **Compartir → Añadir a pantalla de inicio**.

## Bloqueos

Los bloqueos se eliminan solos después de 15 minutos. Desde la Raspberry también puedes administrarlos sin entrar al sitio:

```bash
# Ver IP bloqueadas
docker exec app-hub node server.mjs --list-locks

# Desbloquear una IP
docker exec app-hub node server.mjs --unlock-ip 192.0.2.10

# Desbloquear todas
docker exec app-hub node server.mjs --unlock-all
```

## Actualizar en la Raspberry

```bash
cd /home/camiska/camiska-hub
git pull --ff-only
sudo docker build -t app-hub:latest .
sudo docker rm -f app-hub 2>/dev/null || true
sudo docker run -d \
  --name app-hub \
  --restart unless-stopped \
  --env-file .env \
  -v app-hub-data:/app/data \
  -p 3000:8080 \
  app-hub:latest
```

## Editar sitios

Los accesos están en el array `services` de `src/main.ts`.

## Mostrar sesiones de Nube

Configura `CLOUD_SECURITY_TOKEN` en Nube y usa exactamente el mismo valor como `NUBE_SECURITY_TOKEN` en el Hub. `NUBE_SECURITY_URL` debe apuntar al endpoint `/api/internal/security` de Nube. El endpoint no acepta usuarios ni contraseñas, sólo el token interno.

Para Diamilo configura `DIAMILO_SECURITY_TOKEN` en ambos contenedores y `DIAMILO_SECURITY_URL` en el Hub. Puede ser un token distinto al de Nube y es lo recomendado.
