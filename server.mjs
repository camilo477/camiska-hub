import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const username = process.env.HUB_USER;
const password = process.env.HUB_PASSWORD;
const port = Number(process.env.PORT || 80);
const publicDir = resolve("dist");
const dataDir = resolve(process.env.HUB_DATA_DIR || "data");
const stateFile = join(dataDir, "security.json");
const cookieName = "hub_session";
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;
const attemptWindowMs = 15 * 60 * 1000;
const lockDurationMs = 15 * 60 * 1000;
const maxAttempts = 5;
const maxEvents = 200;
const nubeSecurityUrl = process.env.NUBE_SECURITY_URL || "";
const nubeSecurityToken = process.env.NUBE_SECURITY_TOKEN || "";
const diamiloSecurityUrl = process.env.DIAMILO_SECURITY_URL || "";
const diamiloSecurityToken = process.env.DIAMILO_SECURITY_TOKEN || "";

mkdirSync(dataDir, { recursive: true });

function emptyState() {
  return { sessions: [], attempts: {}, events: [] };
}

function readState() {
  try {
    const state = JSON.parse(readFileSync(stateFile, "utf8"));
    return {
      sessions: Array.isArray(state.sessions) ? state.sessions : [],
      attempts: state.attempts && typeof state.attempts === "object" ? state.attempts : {},
      events: Array.isArray(state.events) ? state.events : [],
    };
  } catch {
    return emptyState();
  }
}

function writeState(state) {
  const temporaryFile = `${stateFile}.${process.pid}.tmp`;
  writeFileSync(temporaryFile, JSON.stringify(state, null, 2), { mode: 0o600 });
  renameSync(temporaryFile, stateFile);
}

function cleanState(state, now = Date.now()) {
  state.sessions = state.sessions.filter((session) => session.expiresAt > now);

  for (const [ip, attempt] of Object.entries(state.attempts)) {
    const lockExpired = attempt.lockUntil && attempt.lockUntil <= now;
    const windowExpired = now - attempt.lastAttempt > attemptWindowMs;
    if (lockExpired || (!attempt.lockUntil && windowExpired)) delete state.attempts[ip];
  }

  state.events = state.events.slice(-maxEvents);
  return state;
}

function addEvent(state, event) {
  state.events.push({ id: randomUUID(), timestamp: Date.now(), ...event });
  state.events = state.events.slice(-maxEvents);
}

function runCommand() {
  const command = process.argv[2];
  if (!command) return false;

  const state = cleanState(readState());

  if (command === "--unlock-all") {
    state.attempts = {};
    addEvent(state, { result: "unlock", ip: "local", device: "Raspberry Pi" });
    writeState(state);
    console.log("Todos los bloqueos fueron eliminados.");
    return true;
  }

  if (command === "--unlock-ip") {
    const ip = process.argv[3];
    if (!ip) {
      console.error("Uso: node server.mjs --unlock-ip <IP>");
      process.exitCode = 1;
      return true;
    }
    delete state.attempts[ip];
    addEvent(state, { result: "unlock", ip, device: "Raspberry Pi" });
    writeState(state);
    console.log(`Bloqueo eliminado para ${ip}.`);
    return true;
  }

  if (command === "--list-locks") {
    const locks = Object.entries(state.attempts)
      .filter(([, attempt]) => attempt.lockUntil > Date.now())
      .map(([ip, attempt]) => ({ ip, hasta: new Date(attempt.lockUntil).toISOString() }));
    console.table(locks);
    return true;
  }

  console.error(`Comando desconocido: ${command}`);
  process.exitCode = 1;
  return true;
}

if (runCommand()) process.exit();

if (!username || !password) {
  console.error("HUB_USER y HUB_PASSWORD son obligatorias.");
  process.exit(1);
}

const loginTemplate = await readFile(join(publicDir, "login.html"), "utf8");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function hash(value) {
  return createHash("sha256").update(value).digest();
}

function hashHex(value) {
  return hash(value).toString("hex");
}

function sameValue(left, right) {
  return timingSafeEqual(hash(left), hash(right));
}

function getCookie(request, name) {
  const cookies = request.headers.cookie?.split(";") ?? [];

  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }

  return "";
}

function clientIp(request) {
  const cloudflareIp = request.headers["cf-connecting-ip"];
  const forwardedIp = request.headers["x-forwarded-for"];
  const value = cloudflareIp || forwardedIp || request.socket.remoteAddress || "desconocida";
  return String(Array.isArray(value) ? value[0] : value).split(",")[0].trim().slice(0, 64);
}

function deviceName(userAgent = "") {
  let browser = "Navegador";
  let system = "Dispositivo";

  if (/Edg\//i.test(userAgent)) browser = "Edge";
  else if (/Firefox\//i.test(userAgent)) browser = "Firefox";
  else if (/CriOS\//i.test(userAgent)) browser = "Chrome";
  else if (/Chrome\//i.test(userAgent)) browser = "Chrome";
  else if (/Safari\//i.test(userAgent)) browser = "Safari";

  if (/iPhone/i.test(userAgent)) system = "iPhone";
  else if (/iPad/i.test(userAgent)) system = "iPad";
  else if (/Android/i.test(userAgent)) system = "Android";
  else if (/Windows/i.test(userAgent)) system = "Windows";
  else if (/Macintosh|Mac OS X/i.test(userAgent)) system = "Mac";
  else if (/Linux/i.test(userAgent)) system = "Linux";

  return `${browser} · ${system}`;
}

function authenticate(request, updateActivity = true) {
  const token = getCookie(request, cookieName);
  if (!token) return null;

  const now = Date.now();
  const state = cleanState(readState(), now);
  const tokenHash = hashHex(token);
  const session = state.sessions.find((item) => sameValue(item.tokenHash, tokenHash));

  if (!session) {
    writeState(state);
    return null;
  }

  if (updateActivity && now - session.lastSeen > 60_000) {
    session.lastSeen = now;
    session.ip = clientIp(request);
    writeState(state);
  }

  return { state, session };
}

function securityHeaders(request) {
  const isHttps = request.headers["x-forwarded-proto"] === "https";
  return {
    "Content-Security-Policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    ...(isHttps ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains" } : {}),
  };
}

function send(response, status, body, headers = {}) {
  response.writeHead(status, headers);
  response.end(body);
}

function redirect(request, response, location, cookie) {
  response.writeHead(303, {
    ...securityHeaders(request),
    Location: location,
    "Cache-Control": "no-store",
    ...(cookie ? { "Set-Cookie": cookie } : {}),
  });
  response.end();
}

function sessionCookie(request, token) {
  const secure = request.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
  return `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${secure}`;
}

function expiredCookie(request) {
  const secure = request.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
  return `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

async function readBody(request) {
  const chunks = [];
  let length = 0;

  for await (const chunk of request) {
    length += chunk.length;
    if (length > 8192) throw new Error("Formulario demasiado grande");
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

function showLogin(request, response, message = "", status = 200) {
  const html = loginTemplate.replace("{{ERROR}}", message);
  send(response, status, html, {
    ...securityHeaders(request),
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
}

function serveFile(request, response) {
  const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relativePath = normalize(requestPath).replace(/^(\.\.(\/|\\|$))+/, "");
  let filePath = join(publicDir, relativePath);

  if (requestPath === "/" || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(publicDir, "index.html");
  }

  if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
    send(response, 404, "No encontrado", securityHeaders(request));
    return;
  }

  const extension = extname(filePath).toLowerCase();
  const noCache = extension === ".html" || requestPath === "/sw.js" || requestPath === "/manifest.webmanifest";
  response.writeHead(200, {
    ...securityHeaders(request),
    "Content-Type": mimeTypes[extension] || "application/octet-stream",
    "Cache-Control": noCache ? "no-cache" : "public, max-age=2592000, immutable",
  });

  if (request.method === "HEAD") response.end();
  else createReadStream(filePath).pipe(response);
}

function sameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  const protocol = request.headers["x-forwarded-proto"] || "http";
  const host = request.headers["x-forwarded-host"] || request.headers.host;
  return origin === `${protocol}://${host}`;
}

function json(request, response, status, value) {
  send(response, status, status === 204 ? "" : JSON.stringify(value), {
    ...securityHeaders(request),
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
}

async function fetchExternalSecurity(url, token, source) {
  if (!url || !token) return { sessions: [], events: [] };

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) throw new Error(`Nube respondió ${response.status}`);
    const data = await response.json();
    return {
      sessions: Array.isArray(data.sessions)
        ? data.sessions.map((session) => ({
            ...session,
            id: `${source.toLowerCase()}:${session.id}`,
            current: false,
            source,
          }))
        : [],
      events: Array.isArray(data.events)
        ? data.events.map((event) => ({ ...event, id: `${source.toLowerCase()}:${event.id}`, source }))
        : [],
    };
  } catch (error) {
    console.error(`No se pudo consultar la seguridad de ${source}:`, error.message);
    return { sessions: [], events: [] };
  }
}

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const ip = clientIp(request);
    const device = deviceName(request.headers["user-agent"]);

    if (request.method === "POST" && pathname === "/login") {
      const form = new URLSearchParams(await readBody(request));
      const now = Date.now();
      const state = cleanState(readState(), now);
      const attempt = state.attempts[ip];

      if (attempt?.lockUntil > now) {
        const minutes = Math.max(1, Math.ceil((attempt.lockUntil - now) / 60_000));
        showLogin(request, response, `Acceso bloqueado. Intenta de nuevo en ${minutes} min.`, 429);
        return;
      }

      const validUser = sameValue((form.get("username") || "").slice(0, 128), username);
      const validPassword = sameValue((form.get("password") || "").slice(0, 512), password);

      if (!validUser || !validPassword) {
        const previous = state.attempts[ip];
        const failures = previous && now - previous.lastAttempt <= attemptWindowMs
          ? previous.failures + 1
          : 1;
        const lockUntil = failures >= maxAttempts ? now + lockDurationMs : 0;
        state.attempts[ip] = { failures, lastAttempt: now, lockUntil };
        addEvent(state, { result: lockUntil ? "blocked" : "failure", ip, device });
        writeState(state);

        await new Promise((resolveDelay) => setTimeout(resolveDelay, 400));
        const message = lockUntil
          ? "Demasiados intentos. Acceso bloqueado durante 15 minutos."
          : "Usuario o contraseña incorrectos.";
        showLogin(request, response, message, lockUntil ? 429 : 401);
        return;
      }

      delete state.attempts[ip];
      const token = randomBytes(32).toString("hex");
      state.sessions.push({
        id: randomUUID(),
        tokenHash: hashHex(token),
        createdAt: now,
        lastSeen: now,
        expiresAt: now + sessionDurationMs,
        ip,
        device,
      });
      addEvent(state, { result: "success", ip, device });
      writeState(state);
      redirect(request, response, "/", sessionCookie(request, token));
      return;
    }

    if (request.method === "POST" && pathname === "/logout") {
      const auth = authenticate(request, false);
      if (auth) {
        auth.state.sessions = auth.state.sessions.filter((item) => item.id !== auth.session.id);
        addEvent(auth.state, { result: "logout", ip, device });
        writeState(auth.state);
      }
      redirect(request, response, "/", expiredCookie(request));
      return;
    }

    const publicPwaFile = pathname === "/manifest.webmanifest"
      || pathname === "/sw.js"
      || pathname.startsWith("/icons/");
    if ((request.method === "GET" || request.method === "HEAD") && publicPwaFile) {
      serveFile(request, response);
      return;
    }

    const auth = authenticate(request);
    if (!auth) {
      if (request.method === "GET" && pathname === "/") showLogin(request, response);
      else redirect(request, response, "/", expiredCookie(request));
      return;
    }

    if (request.method === "GET" && pathname === "/api/security") {
      const [nube, diamilo] = await Promise.all([
        fetchExternalSecurity(nubeSecurityUrl, nubeSecurityToken, "Nube"),
        fetchExternalSecurity(diamiloSecurityUrl, diamiloSecurityToken, "Diamilo"),
      ]);
      const hubSessions = auth.state.sessions.map((session) => ({
        id: session.id,
        current: session.id === auth.session.id,
        device: session.device,
        ip: session.ip,
        createdAt: session.createdAt,
        lastSeen: session.lastSeen,
        source: "Hub",
      }));
      const hubEvents = auth.state.events
        .slice(-30)
        .map((event) => ({ ...event, source: "Hub" }));
      json(request, response, 200, {
        sessions: [...hubSessions, ...nube.sessions, ...diamilo.sessions]
          .sort((left, right) => right.lastSeen - left.lastSeen),
        events: [...hubEvents, ...nube.events, ...diamilo.events]
          .sort((left, right) => right.timestamp - left.timestamp)
          .slice(0, 30),
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/sessions/revoke") {
      if (!sameOrigin(request)) {
        json(request, response, 403, { error: "Origen no permitido" });
        return;
      }
      const form = new URLSearchParams(await readBody(request));
      const targetId = form.get("id") || "";
      const target = auth.state.sessions.find((session) => session.id === targetId);
      if (!target) {
        json(request, response, 404, { error: "Sesión no encontrada" });
        return;
      }
      auth.state.sessions = auth.state.sessions.filter((session) => session.id !== targetId);
      addEvent(auth.state, { result: "revoked", ip, device, detail: target.device });
      writeState(auth.state);
      json(request, response, 204, null);
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      send(response, 405, "", { ...securityHeaders(request), Allow: "GET, HEAD" });
      return;
    }

    serveFile(request, response);
  } catch (error) {
    console.error(error);
    send(response, 500, "Error interno", { "Cache-Control": "no-store" });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`App Hub disponible en el puerto ${port}`);
});
