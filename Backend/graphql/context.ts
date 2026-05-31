import { Request, Response } from "express";
import { Server } from "socket.io";

export type context = {
  userId: number | null;
  req: Request;
  res: Response;
  io: Server;
};

export const twoUserRoomId = <T>(senderId: T, receiverId: T) => {
  return [senderId, receiverId].sort().join("-");
};
