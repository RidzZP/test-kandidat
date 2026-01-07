const express = require("express");
const router = express.Router();
const db = require("../config/database");
const auth = require("../middleware/auth");
const upload = require("../config/multer");

// Helper function untuk generate foto URL
const generateFotoUrl = (req, fotoFilename) => {
    if (!fotoFilename) return null;
    return `${req.protocol}://${req.get("host")}/uploads/${fotoFilename}`;
};

/**
 * @swagger
 * /api/produk:
 *   get:
 *     summary: Get semua produk
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List produk dengan URL foto
 */
router.get("/", auth, async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT p.*, k.nama_kategori 
      FROM tbl_produk p 
      LEFT JOIN tbl_kategori k ON p.id_kategori = k.id_kategori
    `);

        // Tambahkan URL foto untuk setiap produk
        const produkWithUrl = rows.map((produk) => ({
            ...produk,
            foto_url: generateFotoUrl(req, produk.foto_produk),
        }));

        res.json(produkWithUrl);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/produk/{id}:
 *   get:
 *     summary: Get produk by ID
 *     tags: [Produk]
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
 *         description: Detail produk dengan URL foto
 *       404:
 *         description: Produk tidak ditemukan
 */
router.get("/:id", auth, async (req, res) => {
    try {
        const [rows] = await db.query(
            `
      SELECT p.*, k.nama_kategori 
      FROM tbl_produk p 
      LEFT JOIN tbl_kategori k ON p.id_kategori = k.id_kategori
      WHERE p.id_produk = ?
    `,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }

        const produk = rows[0];
        produk.foto_url = generateFotoUrl(req, produk.foto_produk);

        res.json(produk);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/produk:
 *   post:
 *     summary: Tambah produk baru dengan upload foto
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - id_kategori
 *               - nama_produk
 *               - kode_produk
 *               - foto_produk
 *             properties:
 *               id_kategori:
 *                 type: integer
 *                 description: ID kategori produk
 *               nama_produk:
 *                 type: string
 *                 description: Nama produk
 *               kode_produk:
 *                 type: string
 *                 description: Kode produk
 *               foto_produk:
 *                 type: string
 *                 format: binary
 *                 description: File foto produk (jpeg, jpg, png, gif)
 *     responses:
 *       201:
 *         description: Produk berhasil ditambahkan
 *       400:
 *         description: Bad request
 */
router.post("/", auth, upload.single("foto_produk"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Foto produk wajib diupload" });
        }

        const { id_kategori, nama_produk, kode_produk } = req.body;
        const foto_produk = req.file.filename;
        const tgl_register = new Date().toISOString().split("T")[0];

        const [result] = await db.query(
            "INSERT INTO tbl_produk (id_kategori, nama_produk, kode_produk, foto_produk, tgl_register) VALUES (?, ?, ?, ?, ?)",
            [id_kategori, nama_produk, kode_produk, foto_produk, tgl_register]
        );

        res.status(201).json({
            message: "Produk berhasil ditambahkan",
            id_produk: result.insertId,
            foto_url: generateFotoUrl(req, foto_produk),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/produk/{id}:
 *   put:
 *     summary: Update produk (dengan/tanpa foto baru)
 *     tags: [Produk]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               id_kategori:
 *                 type: integer
 *                 description: ID kategori produk
 *               nama_produk:
 *                 type: string
 *                 description: Nama produk
 *               kode_produk:
 *                 type: string
 *                 description: Kode produk
 *               foto_produk:
 *                 type: string
 *                 format: binary
 *                 description: File foto produk baru (opsional)
 *     responses:
 *       200:
 *         description: Produk berhasil diupdate
 *       404:
 *         description: Produk tidak ditemukan
 */
router.put("/:id", auth, upload.single("foto_produk"), async (req, res) => {
    try {
        const { id_kategori, nama_produk, kode_produk } = req.body;

        let query;
        let params;

        if (req.file) {
            // Update dengan foto baru
            const foto_produk = req.file.filename;
            query =
                "UPDATE tbl_produk SET id_kategori = ?, nama_produk = ?, kode_produk = ?, foto_produk = ? WHERE id_produk = ?";
            params = [id_kategori, nama_produk, kode_produk, foto_produk, req.params.id];
        } else {
            // Update tanpa foto
            query =
                "UPDATE tbl_produk SET id_kategori = ?, nama_produk = ?, kode_produk = ? WHERE id_produk = ?";
            params = [id_kategori, nama_produk, kode_produk, req.params.id];
        }

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }

        res.json({
            message: "Produk berhasil diupdate",
            foto_url: req.file ? generateFotoUrl(req, req.file.filename) : null,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/produk/{id}:
 *   delete:
 *     summary: Hapus produk
 *     tags: [Produk]
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
 *         description: Produk berhasil dihapus
 *       404:
 *         description: Produk tidak ditemukan
 */
router.delete("/:id", auth, async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM tbl_produk WHERE id_produk = ?", [
            req.params.id,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }

        res.json({ message: "Produk berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
