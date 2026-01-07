const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register user baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama_user
 *               - email
 *               - password
 *             properties:
 *               nama_user:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User berhasil didaftarkan
 *       400:
 *         description: Email sudah terdaftar
 */
router.post("/register", async (req, res) => {
    try {
        const { nama_user, email, password } = req.body;

        // Cek email sudah ada
        const [existing] = await db.query("SELECT * FROM tbl_user WHERE email = ?", [
            email,
        ]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Email sudah terdaftar" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user baru
        const [result] = await db.query(
            "INSERT INTO tbl_user (nama_user, email, password) VALUES (?, ?, ?)",
            [nama_user, email, hashedPassword]
        );

        res.status(201).json({
            message: "User berhasil didaftarkan",
            id_user: result.insertId,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: eureka@example.com
 *               password:
 *                 type: string
 *                 example: eur@2026
 *     responses:
 *       200:
 *         description: Login berhasil
 *       401:
 *         description: Email atau password salah
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cari user
        const [users] = await db.query("SELECT * FROM tbl_user WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: "Email atau password salah" });
        }

        const user = users[0];

        // Cek password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Email atau password salah" });
        }

        // Generate token
        const token = jwt.sign(
            { id_user: user.id_user, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            message: "Login berhasil",
            token,
            user: {
                id_user: user.id_user,
                nama_user: user.nama_user,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout berhasil
 */
router.post("/logout", auth, (req, res) => {
    res.json({ message: "Logout berhasil" });
});

module.exports = router;
