import { Router } from "express";
import { LinksService } from "../modules/links/links.service";
import { AuthService } from "../modules/auth/auth.service";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const linksService = new LinksService();
const authService = new AuthService();

router.get("/is-alive", (req, res) => {
  res.json({ status: "ok" });
});

// ================= AUTH =================

router.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email ou senha são obrigatórias" });
  }

  try {
    const token = await authService.login(email, password);
    return res.json({ token });
  } catch {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }
});

router.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Nome, email e senha são obrigatórias" });
  }

  const user = await authService.register(name, email, password);
  return res.json(user);
});

// ================= PUBLIC REDIRECT =================

router.get("/r/:slug", async (req, res) => {
  const { slug } = req.params;

  const link = await linksService.getLinkBySlug(slug);

  if (!link || !link.status) {
    return res.status(404).json({ error: "Não encontrado" });
  }

  return res.redirect(302, link.destination);
});

// ================= PROTECTED ROUTES =================

router.use("/api/links", authMiddleware);

router.post("/api/links", async (req, res) => {
  const { destination, title } = req.body;
  const userId = (req as any).user.id;

  if (!isValidUrl(destination)) {
    return res.status(400).json({ error: "URL inválida" });
  }
  try {
    const link = await linksService.create(userId, destination, title);

    return res.json(link);
  } catch (error) {
    console.error("Error in /api/links POST: ", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

router.get("/api/links", async (req, res) => {
  const userId = (req as any).user.id;

  const links = await linksService.list(userId);
  return res.json(links);
});

router.put("/api/links/:id", async (req, res) => {
  const { id } = req.params;
  const { destination } = req.body;
  const userId = (req as any).user.id;

  if (!destination) {
    return res.status(400).json({ error: "Destination é obrigatória" });
  }

  return await linksService.update(id, userId, destination);
});

export default router;
