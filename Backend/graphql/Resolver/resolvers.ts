import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { signToken } from "../../lib/jwt";
import { context } from "../context";
// import { PubSub } from "graphql-subscriptions";

// const pubsub=new PubSub()
// const MESSAGE_SENT="MESSAGE_SENT"

export const resolvers = {
  Query: {
    currentUser: (_parent: unknown, _args: unknown, ctx: context) => {
      if (!ctx.userId) {
        throw new Error("Not authenticated for get CurUser - login first");
      }
      const curUser = prisma.user.findUnique({
        where: { id: ctx.userId },
      });
      if (!curUser) {
        throw new Error("User not found");
      }
      console.log("curent user ");
      return {
        user: curUser,
        success: true,
        alert: "current user getSuccessfully",
      };
    },
    getMessages: async (_parent: unknown, _args: unknown, ctx: context) => {
      try {
        return await prisma.message.findMany({
          include: { sender: true },
          orderBy: { createdAt: "asc" },
        });
      } catch (error) {
        console.log("get message errors : ", error);
        throw new Error("Failed to fetch messages");
      }
    },
  },
  Mutation: {
    signUp: async (
      _parent: unknown,
      args: { username: string; email: string; password: string },
      ctx: context,
    ) => {
      try {
        if (!args.username || !args.email || !args.password) {
          throw new Error(
            "All fields (firstName,lastName,email,password) are required",
          );
        }

        const existingUserEmail = await prisma.user.findUnique({
          where: { email: args.email.toLowerCase().trim() },
        });
        if (existingUserEmail) {
          throw new Error("Account with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(args.password, 12);
        console.log("hashPassword : ", hashedPassword);

        const user = await prisma.user.create({
          data: {
            username: args.username,
            email: args.email,
            password: hashedPassword,
          },
        });
        console.log("user is : ", user);

        const token = signToken(user.id);

        console.log("sigup token for authentication : ", token);

        ctx.res.cookie("tokenCookie", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
          maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        const { password, ...safeUser } = user;

        return {
          user: safeUser,
          success: true,
          alert: "user register successfully",
        };
      } catch (error) {
        console.error("error in Signup mutation ===> ", error);
        throw error; //graphql sends to the client
      }
    },
    logIn: async (
      _parent: unknown,
      args: { email: string; password: string },
      ctx: context,
    ) => {
      try {
        if (!args.email || !args.password) {
          throw new Error("Email and Password are required ");
        }

        const user = await prisma.user.findUnique({
          where: { email: args.email.toLowerCase().trim() },
        });

        if (!user) {
          throw new Error("Invalid credentials, not found");
        }
        const passwordMatches = await bcrypt.compare(
          args.password,
          user.password,
        );

        if (!passwordMatches) {
          throw new Error("Invalid credentials");
        }

        const token = signToken(user.id);

        ctx.res.cookie("tokenCookie", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
          maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        const { password, ...safeUser } = user;

        console.log("login succesfully");
        return {
          user: safeUser,
          success: true,
          alert: "Login successfully",
        };
      } catch (error) {
        console.log("error in login mutation ===> ", error);
      }
    },
    logOut: async (_parent: unknown, _args: unknown, ctx: context) => {
      if (!ctx.userId) {
        throw new Error("Not authenticated for Logout");
      }
      ctx.res.clearCookie("tokenCookie", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
      console.log("log out successfully ");
      return true;
    },

    sendMessage: async (
      _parent: unknown,
      args: { text: string },
      ctx: context,
    ) => {
      if (!ctx.userId) {
        throw new Error("Not authenticated for sending messages");
      }
      const message = await prisma.message.create({
        data: {
          text: args.text,
          senderId: ctx.userId,
        },
        include: { sender: true },
      });
      console.log("message is: ", message);

      // publish: now notify all subscribers means publish event to the client
      // pubsub.publish(MESSAGE_SENT,{messageSent:message})

      //emit or notify to all connected clients
      ctx.io.emit("newMessage", message);

      return { message, alert: "message sent successfylly" };
    },
  },

  /*   Subscription:{
    messageSent:{
      //subscribe- client start listening
      subscribe:()=> pubsub.asyncIterableIterator([MESSAGE_SENT])
    }
  } */
};
