import React from "react";
import { renderToString } from "react-dom/server";
import {
  StaticRouterProvider,
  createStaticHandler,
  createStaticRouter,
} from "react-router-dom/server";
import { routes } from "./app/root";

function isHydrationRequest(request: Request) {
  const url = new URL(request.url);
  return url.pathname === "/hydrate.js";
}

function hydrateResponse() {
  return new Response(Bun.file("./public/build/hydrate.js"), {
    headers: { "Content-Type": "application/javascript" },
  });
}

function isWebSocketRequest(request: Request) {
  const url = new URL(request.url);
  return url.pathname === "/ws.js";
}

function webSockerResponse() {
  return new Response(Bun.file("./public/build/ws.js"), {
    headers: { "Content-Type": "application/javascript" },
  });
}

function isStyleRequest(request: Request) {
  const url = new URL(request.url);
  return url.pathname === "/tailwind.css";
}

function styleResponse() {
  return new Response(Bun.file("./public/build/tailwind.css"), {
    headers: { "Content-Type": "text/css" },
  });
}

function isFaviconRequest(request: Request) {
  const url = new URL(request.url);
  return url.pathname === "/favicon.ico";
}

function faviconResponse() {
  return new Response(Bun.file("./public/build/favicon.ico"), {
    headers: { "Content-Type": "image/favicon" },
  });
}

function logRequest(request: Request, response: Response, ms: number) {
  console.log(
    `${request.method} ${request.url.toString()} ${response.status} ${ms} ms`,
  );
}

function isInitRequest(request: Request) {
  const url = new URL(request.url);
  return url.pathname === "/";
}

async function initResponse(request: Request) {
  const { query, dataRoutes } = createStaticHandler(routes);
  const context = await query(request);

  if (context instanceof Response) {
    return context;
  }

  const router = createStaticRouter(dataRoutes, context);
  const html = renderToString(
    <React.StrictMode>
      <StaticRouterProvider router={router} context={context} />
    </React.StrictMode>,
  );

  return new Response("<!DOCTYPE html>" + html, {
    headers: { "Content-Type": "text/html" },
  });
}

async function requestHandler(
  request: Request,
  handler: () => Response | Promise<Response | undefined> | undefined,
) {
  const start = Date.now();
  try {
    let response = await handler();
    if (response == null) {
      response = new Response(null, { status: 404 });
    }
    logRequest(request, response, Date.now() - start);
    return response;
  } catch (error) {
    console.log(error);
    const response = new Response(null, { status: 500 });
    logRequest(request, response, Date.now() - start);
    return response;
  }
}

export async function setupServer() {
  await Promise.all([
    Bun.build({
      entrypoints: ["./app/hydrate.tsx"],
      target: "browser",
      outdir: "./public/build",
    }),
    Bun.build({
      entrypoints: ["./app/ws.ts"],
      target: "browser",
      outdir: "./public/build",
    }),
  ]);

  await Bun.spawn([
    "bunx",
    "tailwindcss",
    "-i",
    "./app/tailwind.css",
    "-o",
    "./public/build/tailwind.css",
  ]).exited;

  return Bun.serve({
    async fetch(request, server) {
      if (server.upgrade(request)) {
        return;
      }

      return requestHandler(request, async () => {
        if (isInitRequest(request)) {
          return initResponse(request);
        }

        if (isHydrationRequest(request)) {
          return hydrateResponse();
        }

        if (isWebSocketRequest(request)) {
          return webSockerResponse();
        }

        if (isStyleRequest(request)) {
          return styleResponse();
        }

        if (isFaviconRequest(request)) {
          return faviconResponse();
        }

        return initResponse(request);
      });
    },
    websocket: {
      message() {},
      open() {},
      close() {},
      drain() {},
    },
  });
}
