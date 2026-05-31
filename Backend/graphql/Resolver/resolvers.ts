import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { signToken } from "../../lib/jwt";
import { context, twoUserRoomId } from "../context";
// import { PubSub } from "graphql-subscriptions";

// const pubsub=new PubSub()
// const MESSAGE_SENT="MESSAGE_SENT"

export const resolvers = {
  Query: {
    currentUser: async (_parent: unknown, _args: unknown, ctx: context) => {
      if (!ctx.userId) {
        throw new Error("Not authenticated for get CurUser - login first");
      }
      const curUser = await prisma.user.findUnique({
        where: { id: ctx.userId },
      });
      console.log("user user is : ", curUser);

      if (!curUser) {
        throw new Error("User not found");
      }
      return { user: curUser };
    },
    getMessages: async (
      _parent: unknown,
      args: { receiverId: number },
      ctx: context,
    ) => {
      try {
        //send all messages
        /* return await prisma.message.findMany({
          include: { sender: true },
          orderBy: { createdAt: "asc" },
        }); */

        //send Individual messages
        console.log(
          "ctx.userid ",
          ctx.userId,
          "args.receiverId : ",
          args.receiverId,
        );

        return await prisma.message.findMany({
          where: {
            OR: [
              { senderId: Number(ctx.userId), receiverId: args.receiverId },
              { senderId: args.receiverId, receiverId: Number(ctx.userId) },
            ],
          },
          include: { sender: true, receiver: true },
          orderBy: { createdAt: "asc" },
        });
      } catch (error) {
        console.log("get message errors : ", error);
        throw new Error("Failed to fetch messages");
      }
    },
    getUsers: async (_parent: unknown, _args: unknown, ctx: context) => {
      if (!ctx.userId) {
        throw new Error("Not authenticated to get all Users - login first");
      }
      return await prisma.user.findMany({
        where: {
          id: { not: ctx.userId },
        },
      });
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
      args: { text: string; receiverId: number },
      ctx: context,
    ) => {
      if (!ctx.userId) {
        throw new Error("Not authenticated for sending messages");
      }
      const message = await prisma.message.create({
        data: {
          text: args.text,
          senderId: ctx.userId,
          receiverId: args.receiverId,
        },
        include: { sender: true },
      });
      console.log("message is: ", message);

      /*       emit or notify to all connected clients
      ctx.io.emit("newMessage", message); */

      //make room so that user can chat privately by taking the id of sender and receiver
      const roomId = twoUserRoomId<number>(ctx.userId, args.receiverId);
      ctx.io.to(roomId).emit("newRoomMessage", message);
      return { message };
    },
  },

  /*   Subscription:{
    messageSent:{
      //subscribe- client start listening
      subscribe:()=> pubsub.asyncIterableIterator([MESSAGE_SENT])
    }
  } */
};
