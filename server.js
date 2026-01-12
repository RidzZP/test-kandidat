const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (untuk akses foto produk)
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/kategori", require("./routes/kategori"));
app.use("/api/produk", require("./routes/produk"));
app.use("/api/stok", require("./routes/stok"));

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "API Kandidat Test",
        documentation: "/api-docs",
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    // Handle multer errors
    if (err.message.includes("gambar")) {
        return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: "Terjadi kesalahan server" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Dokumentasi API: http://localhost:${PORT}/api-docs`);
});
