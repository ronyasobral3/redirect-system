"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const links_service_1 = require("../modules/links/links.service");
const auth_service_1 = require("../modules/auth/auth.service");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const linksService = new links_service_1.LinksService();
const authService = new auth_service_1.AuthService();
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
        const result = await authService.login(email, password);
        return res.json(result);
    }
    catch {
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
router.post("/api/auth/update/password", async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    try {
        await authService.validPassword(userId, currentPassword);
        await authService.updatePassword(userId, newPassword);
        return res.status(200);
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
});
router.delete("/api/auth/user", async (req, res) => {
    const userId = req.user.id;
    await linksService.deleteAllByUserId(userId);
    await authService.deleteByUserId(userId);
    return res.status(200);
});
// ================= PUBLIC REDIRECT =================
router.get("/r/:slug", async (req, res) => {
    const { slug } = req.params;
    const link = await linksService.getLinkBySlug(slug);
    if (!link) {
        return res
            .status(404)
            .json({ error: "Não encontrado", errorCode: "NOT_FOUND" });
    }
    return res.status(200).json({ location: link.destination });
});
// ================= PROTECTED ROUTES =================
router.use("/api/links", auth_middleware_1.authMiddleware);
router.post("/api/links", async (req, res) => {
    const { destination, title } = req.body;
    const userId = req.user.id;
    if (!isValidUrl(destination)) {
        return res.status(400).json({ error: "URL inválida" });
    }
    try {
        const link = await linksService.create(userId, destination, title);
        return res.json(link);
    }
    catch (error) {
        console.error("Error in /api/links POST: ", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
router.get("/api/links", async (req, res) => {
    const userId = req.user.id;
    const links = await linksService.list(userId);
    return res.json(links);
});
router.get("/api/links/:id", async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const links = await linksService.getLinkById(id, userId);
    return res.json(links);
});
router.put("/api/links/:id", async (req, res) => {
    const { id } = req.params;
    const { title, destination } = req.body;
    const userId = req.user.id;
    if (!destination) {
        return res.status(400).json({ error: "Destination é obrigatória" });
    }
    return await linksService.update(id, userId, title, destination);
});
router.delete("/api/links/:id", async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    await linksService.delete(id, userId);
    return res.json({ success: true });
});
router.post("/api/links/inactive/:id", async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;
    const userId = req.user.id;
    await linksService.updateStatus(id, userId, isActive);
    return res.json({ success: true });
});
exports.default = router;
