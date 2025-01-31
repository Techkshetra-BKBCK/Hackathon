import User from "../models/User";
import { User as IUser } from "../types/database/user";
import { CrudRepository } from "./crudrepository";

class UserRepository extends CrudRepository<IUser, string> {
  constructor() {
    super(User);
  }
}

export default new UserRepository();
