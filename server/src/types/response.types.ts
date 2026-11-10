import type { HttpStatusCode } from "../constants/statusCodes.js";

export interface ServiceResponse<T = undefined> {
  statusCode: HttpStatusCode;
  message: string;
  data?: T;
}
