import pkg from "bcryptjs";

class PasswordLib {
  private hash;
  private compare;
  constructor() {
    const { hash, compare } = pkg;
    this.hash = hash;
    this.compare = compare;
  }
  async encryptPassword(password: string) {
    const encryptedPassword = await this.hash(password, 10);
    return encryptedPassword;
  }

  async verifyPassword(encryptedPassword: string, normalPassword: string) {
    const password = await this.compare(encryptedPassword, normalPassword);
    return password;
  }
}

export default new PasswordLib();
