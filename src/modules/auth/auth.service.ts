import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export class AuthService {
  async register(name: string, email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hash },
    });

    return user.id;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new Error("Credenciais inválidas");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Credenciais inválidas");

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
    );

    return { token: token, userName: user.name, email: user.email };
  }

  async validPassword(id: string, password: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) throw new Error("Credenciais inválidas");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Credenciais inválidas");
  }

  async updatePassword(userId: string, newPassword: string) {
    const hash = await bcrypt.hash(newPassword, 10);

    return prisma.user.update({
      where: { id: userId },
      data: {
        password: hash,
        passwordChangedAt: new Date(),
      },
    });
  }

  async deleteByUserId(id: string) {
    prisma.user.delete({
      where: { id },
    });
  }
}
