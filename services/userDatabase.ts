// Simple User Database Service using localStorage

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: number;
}

class UserDatabase {
  private storageKey = 'users_db';
  private users: User[] = [];

  constructor() {
    this.loadUsers();
  }

  private loadUsers() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.users = JSON.parse(stored);
      } catch (e) {
        this.users = [];
      }
    }
  }

  private saveUsers() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.users));
  }

  emailExists(email: string): boolean {
    return this.users.some(u => u.email.toLowerCase() === email.toLowerCase());
  }

  registerUser(email: string, name: string, password: string): User {
    if (this.emailExists(email)) {
      throw new Error('Email đã được đăng ký');
    }

    if (password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }

    if (name.trim().length < 2) {
      throw new Error('Tên phải có ít nhất 2 ký tự');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      name: name.trim(),
      password: password,
      createdAt: Date.now(),
    };

    this.users.push(newUser);
    this.saveUsers();
    return newUser;
  }

  loginUser(email: string, password: string): User {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('Email không tồn tại');
    }

    if (user.password !== password) {
      throw new Error('Mật khẩu không chính xác');
    }

    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getAllUsers(): User[] {
    return this.users;
  }
}

export default new UserDatabase();
