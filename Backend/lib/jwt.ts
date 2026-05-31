import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET is not defined in env file");
}

export const signToken = (userId: number): string => {
  return jwt.sign({ userId }, SECRET, { expiresIn: "7d" });
};


export const verifyToken=(token:string):{userId:number}=>{
    return jwt.verify(token,SECRET) as {userId:number}
}