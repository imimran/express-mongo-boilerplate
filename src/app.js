import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import session from "express-session";
// import connectRedis from "connect-redis";
import RedisStore from "connect-redis";
import cors from "cors";
import { getClientIp } from "@supercharge/request-ip";
import path from "path";
import "dotenv/config.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import api from "./routes/index.js";
import logger from "./libs/logger.js";
import redis from "./libs/redis.js";
import C from "./constants.js";

// const RedisStore = connectRedis(session);
const sessionMiddleware = session({
  store: new RedisStore({
    client: redis,
    prefix: C.redisSessionPrefix,
  }),
  name: "sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next);
});

io.on("connection", (socket) => {
  logger.info(`A User Connected: ${socket.id}`);
  // add socket id to user session
  const { session } = socket.request;
  if (session.socketids && Array.isArray(session.socketids)) {
    session.socketids.push(socket.id);
  } else {
    session.socketids = [socket.id];
  }
  session.save();
  // remove socket id from user session
  socket.on("disconnect", () => {
    logger.info(`A User Disconnected: ${socket.id}`);
    session.socketids = session.socketids.reduce((connectedSocketIds, sid) => {
      if (io.of("/").sockets.has(sid)) {
        connectedSocketIds.push(sid);
      }
      return connectedSocketIds;
    }, []);
    session.save();
  });
});
app.use(express.static("files"));

app.set("trust proxy", true);
app.use(morgan("dev"));
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(sessionMiddleware);
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

app.use((req, res, next) => {
  console.log("\n");
  req.ip = getClientIp(req);
  req.io = io;
  const { socketids } = req.session;
  if (socketids && socketids.length > 0) {
    req.clientSocket = socketids.reduce((connectedSockets, sid) => {
      if (io.of("/").sockets.has(sid)) {
        connectedSockets.push(io.of("/").sockets.get(sid));
      }
      return connectedSockets;
    }, []);
  }
  // res.locals.send = (message, data) => res.json({ message: message || undefined, data });
  res.locals.send = (message, data) =>
    res.json({
      status: 200,
      data: { success: true, message: message || undefined, data },
    });
  return next();
});

app.get("/", (_, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/files", express.static("files"));

app.use("/api/v1", api);

app.use(notFound);
app.use(errorHandler);

export default server;
