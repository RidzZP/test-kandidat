const express = require("express");
const router = express.Router();
const db = require("../config/database");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /api/kategori:
 *   get:
 *     summary: Get semua kategori
 *     tags: [Kategori]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List kategori
 */
router.get("/", auth, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM tbl_kategori");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/kategori/{id}:
 *   get:
 *     summary: Get kategori by ID
 *     tags: [Kategori]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail kategori
 *       404:
 *         description: Kategori tidak ditemukan
 */
router.get("/:id", auth, async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM tbl_kategori WHERE id_kategori = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Kategori tidak ditemukan" });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/kategori:
 *   post:
 *     summary: Tambah kategori baru
 *     tags: [Kategori]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama_kategori
 *             properties:
 *               nama_kategori:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kategori berhasil ditambahkan
 */
router.post("/", auth, async (req, res) => {
    try {
        const { nama_kategori } = req.body;
        const [result] = await db.query(
            "INSERT INTO tbl_kategori (nama_kategori) VALUES (?)",
            [nama_kategori]
        );
        res.status(201).json({
            message: "Kategori berhasil ditambahkan",
            id_kategori: result.insertId,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/kategori/{id}:
 *   put:
 *     summary: Update kategori
 *     tags: [Kategori]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama_kategori
 *             properties:
 *               nama_kategori:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kategori berhasil diupdate
 */
router.put("/:id", auth, async (req, res) => {
    try {
        const { nama_kategori } = req.body;
        const [result] = await db.query(
            "UPDATE tbl_kategori SET nama_kategori = ? WHERE id_kategori = ?",
            [nama_kategori, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Kategori tidak ditemukan" });
        }

        res.json({ message: "Kategori berhasil diupdate" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/kategori/{id}:
 *   delete:
 *     summary: Hapus kategori
 *     tags: [Kategori]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kategori berhasil dihapus
 */
router.delete("/:id", auth, async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM tbl_kategori WHERE id_kategori = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Kategori tidak ditemukan" });
        }

        res.json({ message: "Kategori berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
