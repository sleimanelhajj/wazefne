import { Request, Response, NextFunction } from "express";

// Placeholder – will contain JWT verification logic
const authenticate = (_req: Request, _res: Response, next: NextFunction): void => {
  // TODO: implement JWT auth
  next();
};

export default authenticate;
