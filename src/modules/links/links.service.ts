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

  async update(id: string, userId: string, destination: string) {
    const result = await prisma.redirectLink.updateMany({
      where: {
        id,
        userId,
      },
      data: { destination },
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
    });
  }

  async getLinkBySlug(slug: string) {
    return prisma.redirectLink.findUnique({
      select: {
        destination: true,
        status: true,
      },
      where: { slug },
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
}
