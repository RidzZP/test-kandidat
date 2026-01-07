# API Test Kandidat

API sederhana untuk manajemen kategori, produk, dan stok dengan autentikasi JWT.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Buat database MySQL dengan nama `test_kandidat` dan jalankan SQL berikut:

```sql
CREATE TABLE tbl_user (
    id_user INT(11) NOT NULL AUTO_INCREMENT,
    nama_user VARCHAR(200) NOT NULL,
    PRIMARY KEY (id_user)
) ENGINE=InnoDB;

CREATE TABLE tbl_kategori (
    id_kategori INT(11) NOT NULL AUTO_INCREMENT,
    nama_kategori VARCHAR(200) NOT NULL,
    PRIMARY KEY (id_kategori)
) ENGINE=InnoDB;

CREATE TABLE tbl_produk (
    id_produk INT(11) NOT NULL AUTO_INCREMENT,
    id_kategori INT(11) NOT NULL,
    nama_produk VARCHAR(200) NOT NULL,
    kode_produk VARCHAR(50) NOT NULL,
    foto_produk VARCHAR(50) NOT NULL,
    tgl_register DATE NOT NULL,
    PRIMARY KEY (id_produk),
    CONSTRAINT fk_produk_kategori
        FOREIGN KEY (id_kategori)
        REFERENCES tbl_kategori (id_kategori)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE tbl_stok (
    id_stok INT(11) NOT NULL AUTO_INCREMENT,
    id_produk INT(11) NOT NULL,
    jumlah_barang INT(11) NOT NULL,
    tgl_update DATE NOT NULL,
    PRIMARY KEY (id_stok),
    CONSTRAINT fk_stok_produk
        FOREIGN KEY (id_produk)
        REFERENCES tbl_produk (id_produk)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

ALTER TABLE tbl_user
ADD COLUMN email VARCHAR(150) NOT NULL AFTER nama_user,
ADD COLUMN password VARCHAR(255) NOT NULL AFTER email,
ADD COLUMN status TINYINT(1) NOT NULL DEFAULT 1 AFTER password,
ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
ADD UNIQUE KEY uq_user_email (email);
```

### 3. Konfigurasi Environment

File `.env` sudah dibuat dengan konfigurasi default:

```
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=test_kandidat
```

### 4. Jalankan Server

```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## Dokumentasi API

Swagger documentation tersedia di: `http://localhost:3000/api-docs`

## Endpoints

### Authentication

-   `POST /api/auth/register` - Register user baru
-   `POST /api/auth/login` - Login user
-   `POST /api/auth/logout` - Logout user (require token)

### Kategori

-   `GET /api/kategori` - Get semua kategori
-   `GET /api/kategori/:id` - Get kategori by ID
-   `POST /api/kategori` - Tambah kategori baru
-   `PUT /api/kategori/:id` - Update kategori
-   `DELETE /api/kategori/:id` - Hapus kategori

### Produk

-   `GET /api/produk` - Get semua produk
-   `GET /api/produk/:id` - Get produk by ID
-   `POST /api/produk` - Tambah produk baru
-   `PUT /api/produk/:id` - Update produk
-   `DELETE /api/produk/:id` - Hapus produk

### Stok

-   `GET /api/stok` - Get semua stok
-   `GET /api/stok/:id` - Get stok by ID
-   `POST /api/stok` - Tambah stok baru
-   `PUT /api/stok/:id` - Update stok
-   `DELETE /api/stok/:id` - Hapus stok

## Cara Penggunaan

### 1. Register User

```bash
POST /api/auth/register
{
  "nama_user": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login

```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response akan berisi token JWT yang harus digunakan untuk endpoint lainnya.

### 3. Mengakses Endpoint Lain

Gunakan token yang didapat dari login di header Authorization:

```
Authorization: Bearer <your_token_here>
```

## Struktur Project

```
test-kandidat/
├── config/
│   └── database.js          # Konfigurasi database
├── middleware/
│   └── auth.js              # Middleware autentikasi JWT
├── routes/
│   ├── auth.js              # Routes autentikasi
│   ├── kategori.js          # Routes kategori
│   ├── produk.js            # Routes produk
│   └── stok.js              # Routes stok
├── .env                     # Environment variables
├── server.js                # Main application file
├── swagger.js               # Swagger configuration
└── package.json             # Dependencies
```
