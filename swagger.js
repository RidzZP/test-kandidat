const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Test Kandidat",
            version: "1.0.0",
            description: "API untuk manajemen kategori, produk, dan stok",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        tags: [
            {
                name: "Auth",
                description: "Authentication endpoints",
            },
            {
                name: "Kategori",
                description: "Kategori management",
            },
            {
                name: "Produk",
                description: "Produk management",
            },
            {
                name: "Stok",
                description: "Stok management",
            },
        ],
    },
    apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
