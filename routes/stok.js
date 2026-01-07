const express = require("express");
const router = express.Router();
const db = require("../config/database");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /api/stok:
 *   get:
 *     summary: Get semua stok
 *     tags: [Stok]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List stok
 */
router.get("/", auth, async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT s.*, p.nama_produk, p.kode_produk 
      FROM tbl_stok s 
      LEFT JOIN tbl_produk p ON s.id_produk = p.id_produk
    `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/stok/{id}:
 *   get:
 *     summary: Get stok by ID
 *     tags: [Stok]
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
 *         description: Detail stok
 *       404:
 *         description: Stok tidak ditemukan
 */
router.get("/:id", auth, async (req, res) => {
    try {
        const [rows] = await db.query(
            `
      SELECT s.*, p.nama_produk, p.kode_produk 
      FROM tbl_stok s 
      LEFT JOIN tbl_produk p ON s.id_produk = p.id_produk
      WHERE s.id_stok = ?
    `,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Stok tidak ditemukan" });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/stok:
 *   post:
 *     summary: Tambah stok baru
 *     tags: [Stok]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_produk
 *               - jumlah_barang
 *             properties:
 *               id_produk:
 *                 type: integer
 *               jumlah_barang:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Stok berhasil ditambahkan
 */
router.post("/", auth, async (req, res) => {
    try {
        const { id_produk, jumlah_barang } = req.body;
        const tgl_update = new Date().toISOString().split("T")[0];

        const [result] = await db.query(
            "INSERT INTO tbl_stok (id_produk, jumlah_barang, tgl_update) VALUES (?, ?, ?)",
            [id_produk, jumlah_barang, tgl_update]
        );

        res.status(201).json({
            message: "Stok berhasil ditambahkan",
            id_stok: result.insertId,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/stok/{id}:
 *   put:
 *     summary: Update stok
 *     tags: [Stok]
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
 *             properties:
 *               id_produk:
 *                 type: integer
 *               jumlah_barang:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stok berhasil diupdate
 */
router.put("/:id", auth, async (req, res) => {
    try {
        const { id_produk, jumlah_barang } = req.body;
        const tgl_update = new Date().toISOString().split("T")[0];

        const [result] = await db.query(
            "UPDATE tbl_stok SET id_produk = ?, jumlah_barang = ?, tgl_update = ? WHERE id_stok = ?",
            [id_produk, jumlah_barang, tgl_update, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Stok tidak ditemukan" });
        }

        res.json({ message: "Stok berhasil diupdate" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/stok/{id}:
 *   delete:
 *     summary: Hapus stok
 *     tags: [Stok]
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
 *         description: Stok berhasil dihapus
 */
router.delete("/:id", auth, async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM tbl_stok WHERE id_stok = ?", [
            req.params.id,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Stok tidak ditemukan" });
        }

        res.json({ message: "Stok berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
