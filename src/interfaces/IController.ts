import { Request, Response } from "express";
export interface IController {
  [key: string]: (arg0: Request, arg1: Response) => {};
}
