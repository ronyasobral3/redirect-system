import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();

interface TokenPayload extends JwtPayload {
  userId: string;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as TokenPayload;

    if (!decoded.userId || !decoded.iat) {
      return res.status(401).json({ error: "Token Invalido" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    if (
      user.passwordChangedAt &&
      user.passwordChangedAt.getTime() / 1000 > decoded.iat
    ) {
      return res
        .status(401)
        .json({ error: "Session expirada. Por favor, faça login novamente." });
    }

    (req as any).user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
