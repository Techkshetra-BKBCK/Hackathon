export interface CustomJWTPayload {
  userId: string;
  expires: number;
  [key: string]: any;
}
