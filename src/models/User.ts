import { Schema, model } from "mongoose";
import { User } from "../types/database/user";
const userSchema = new Schema<User>({
  name: { type: String },
  email: { type: String },
  password: { type: String },
  sessionToken: { type: String },
  refreshToken: { type: String },
});
const User = model("User", userSchema);
export default User;
