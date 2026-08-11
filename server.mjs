import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const password = process.env.HUB_PASSWORD;
const port = Number(process.env.PORT || 80);
const publicDir = resolve("dist");
const loginTemplate = await readFile(join(publicDir, "login.html"), "utf8");
const sessionToken = randomBytes(32).toString("hex");
const cookieName = "hub_session";

if (!password) {
  console.error("HUB_PASSWORD es obligatoria.");
  process.exit(1);
}

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function hash(value) {
  return createHash("sha256").update(value).digest();
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

function isAuthenticated(request) {
  return sameValue(getCookie(request, cookieName), sessionToken);
}

function redirect(response, location, cookie) {
  response.writeHead(303, {
    Location: location,
    "Cache-Control": "no-store",
    ...(cookie ? { "Set-Cookie": cookie } : {}),
  });
  response.end();
}

function sessionCookie(request) {
  const forwardedProto = request.headers["x-forwarded-proto"];
  const secure = forwardedProto === "https" ? "; Secure" : "";
  return `${cookieName}=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${secure}`;
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

function showLogin(response, hasError = false) {
  const message = hasError ? "La contraseña no es correcta." : "";
  const html = loginTemplate.replace("{{ERROR}}", message);
  response.writeHead(hasError ? 401 : 200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(html);
}

function serveFile(request, response) {
  const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relativePath = normalize(requestPath).replace(/^(\.\.(\/|\\|$))+/, "");
  let filePath = join(publicDir, relativePath);

  if (requestPath === "/" || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(publicDir, "index.html");
  }

  if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
    response.writeHead(404);
    response.end("No encontrado");
    return;
  }

  const extension = extname(filePath).toLowerCase();
  response.writeHead(200, {
    "Content-Type": mimeTypes[extension] || "application/octet-stream",
    "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=2592000, immutable",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
  });

  if (request.method === "HEAD") response.end();
  else createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;

    if (request.method === "POST" && pathname === "/login") {
      const form = new URLSearchParams(await readBody(request));
      if (sameValue(form.get("password") || "", password)) {
        redirect(response, "/", sessionCookie(request));
      } else {
        showLogin(response, true);
      }
      return;
    }

    if (request.method === "POST" && pathname === "/logout") {
      redirect(response, "/", `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
      return;
    }

    if (!isAuthenticated(request)) {
      if (request.method === "GET" && pathname === "/") showLogin(response);
      else redirect(response, "/");
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }

    serveFile(request, response);
  } catch (error) {
    console.error(error);
    response.writeHead(500);
    response.end("Error interno");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`App Hub disponible en el puerto ${port}`);
});
