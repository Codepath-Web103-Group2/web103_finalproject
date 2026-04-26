import app, { prepareApp } from "../server/app.js";

export default async function handler(request, response) {
  await prepareApp();

  if (typeof request.url === "string" && !request.url.startsWith("/api")) {
    request.url = `/api${request.url}`;
  }

  return app(request, response);
}