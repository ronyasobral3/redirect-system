import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
const prisma = new PrismaClient();

function generateSlug(length = 7) {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

export class LinksService {
  async create(userId: string, destination: string, title?: string) {
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

  async update(id: string, userId: string, title: string, destination: string) {
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

  async list(userId: string) {
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

  async getLinkById(id: string, userId: string) {
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

  async getLinkBySlug(slug: string) {
    return prisma.redirectLink.findUnique({
      select: {
        destination: true,
        status: true,
      },
      where: { slug, status: true },
    });
  }

  async delete(id: string, userId: string) {
    await prisma.redirectLink.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }

  async updateStatus(id: string, userId: string, status: boolean) {
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

  async deleteAllByUserId(userId: string) {
    await prisma.redirectLink.deleteMany({
      where: {
        userId,
      },
    });
  }
}
