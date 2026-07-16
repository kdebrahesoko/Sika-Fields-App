import express, { type Express } from "express";
import cors, { type CorsOptions } from "cors";
import path from "node:path";
import fs from "node:fs";
import { clerkMiddleware } from "@clerk/express";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";

// Dockerfile.prod sets WORKDIR /app and runs `node artifacts/api-server/dist/index.cjs`
// from there, so process.cwd() is /app and the built frontend lands at /app/public.
const publicDir = path.resolve(process.cwd(), "public");
const publicIndexHtml = path.join(publicDir, "index.html");

const app: Express = express();

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

const parseAllowedOrigins = (raw: string | undefined): string[] =>
  (raw ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);

if (process.env.REPLIT_DEV_DOMAIN) {
  allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
}

const corsOptions: CorsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware());

app.use("/api", router);

if (fs.existsSync(publicIndexHtml)) {
  app.use(express.static(publicDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(publicIndexHtml);
  });
}

export default app;
