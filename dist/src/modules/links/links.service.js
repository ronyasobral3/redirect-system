"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinksService = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
function generateSlug(length = 7) {
    return crypto_1.default.randomBytes(length).toString("base64url").slice(0, length);
}
class LinksService {
    async create(userId, destination, title) {
        const slug = generateSlug(7);
        const link = await prisma.redirectLink.create({
            data: {
                slug,
                destination,
                title,
                userId,
            },
        });
        return link;
    }
    async update(id, userId, title, destination) {
        const result = await prisma.redirectLink.updateMany({
            where: {
                id,
                userId,
            },
            data: { title, destination },
        });
        if (result.count === 0) {
            throw new Error("Link não encontrado ou não autorizado");
        }
        return { success: true };
    }
    async list(userId) {
        return prisma.redirectLink.findMany({
            select: {
                id: true,
                slug: true,
                destination: true,
                title: true,
                status: true,
                updatedAt: true,
            },
            where: { userId },
            orderBy: { title: "asc" },
        });
    }
    async getLinkById(id, userId) {
        return prisma.redirectLink.findUnique({
            select: {
                id: true,
                slug: true,
                destination: true,
                title: true,
            },
            where: { id, userId },
        });
    }
    async getLinkBySlug(slug) {
        return prisma.redirectLink.findUnique({
            select: {
                destination: true,
                status: true,
            },
            where: { slug, status: true },
        });
    }
    async delete(id, userId) {
        await prisma.redirectLink.deleteMany({
            where: {
                id,
                userId,
            },
        });
    }
    async updateStatus(id, userId, status) {
        const result = await prisma.redirectLink.updateMany({
            where: {
                id,
                userId,
            },
            data: { status },
        });
        if (result.count === 0) {
            throw new Error("Link não encontrado ou não autorizado");
        }
        return { success: true };
    }
    async deleteAllByUserId(userId) {
        await prisma.redirectLink.deleteMany({
            where: {
                userId,
            },
        });
    }
}
exports.LinksService = LinksService;
