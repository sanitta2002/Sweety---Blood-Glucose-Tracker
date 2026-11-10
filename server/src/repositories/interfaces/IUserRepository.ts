export interface User {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<UserWithPassword | null>;
  findById(id: string): Promise<User | null>;
  create(user: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<User>;
}
