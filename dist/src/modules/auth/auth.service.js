"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
class AuthService {
    async register(name, email, password) {
        const hash = await bcrypt_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hash },
        });
        return user.id;
    }
    async login(email, password) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new Error("Credenciais inválidas");
        const valid = await bcrypt_1.default.compare(password, user.password);
        if (!valid)
            throw new Error("Credenciais inválidas");
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return { token: token, userName: user.name, email: user.email };
    }
    async validPassword(id, password) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new Error("Credenciais inválidas");
        const valid = await bcrypt_1.default.compare(password, user.password);
        if (!valid)
            throw new Error("Credenciais inválidas");
    }
    async updatePassword(userId, newPassword) {
        const hash = await bcrypt_1.default.hash(newPassword, 10);
        return prisma.user.update({
            where: { id: userId },
            data: {
                password: hash,
                passwordChangedAt: new Date(),
            },
        });
    }
    async deleteByUserId(id) {
        prisma.user.delete({
            where: { id },
        });
    }
}
exports.AuthService = AuthService;
