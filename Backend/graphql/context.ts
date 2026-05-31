import { Request, Response } from "express";
import {Server} from 'socket.io'

export type context = {
  userId: number | null
  req:Request
  res:Response
  io:Server
};

