import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import express, { Request, Response } from "express";
import { typeDefs } from "./graphql/Typedef/schema.js";
import { resolvers } from "./graphql/Resolver/resolvers.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { expressMiddleware } from "@as-integrations/express5";
import { context } from "./graphql/context.js";
import { verifyToken } from "./lib/jwt.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
//wrap app in HTTP server
const httpServer = createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
  cookieParser(),
);

// setup socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});
await server.start();

/* Sockets event */
io.on("connection", (socket) => {
  console.log("User connected");
  console.log("Socket Id : ", socket.id);

  socket.on("joinRoom", (roomId: string) => {
    socket.join(roomId);
    console.log(`socket, socketId : ${socket.id} joined room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.use(
  "/graphql",
  express.json(),
  expressMiddleware(server, {
    context: async ({
      req,
      res,
    }: {
      req: Request;
      res: Response;
    }): Promise<context> => {
      const token = req.cookies.tokenCookie;
      console.log("user has token", token);
      let userId = null;
      if (token) {
        try {
          const decoded = verifyToken(token);
          console.log("verify data : ", decoded);
          userId = decoded.userId;
        } catch (error) {
          console.log("error in middleware : ", error);
        }
      }
      return { userId, req, res, io };
    },
  }),
);

httpServer.listen(4003, () => {
  console.log("Server is ready to listen at http://localhost:4003/graphql");
});
