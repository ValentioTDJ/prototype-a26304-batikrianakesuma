CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,       -- mis. Kebaya, Dress, Kemeja, Kain
    price INTEGER NOT NULL CHECK (price >= 0),
    material VARCHAR(150),                -- Bahan (mis. Sutra, Katun Primisima)
    motif VARCHAR(150),                   -- Motif batik
    color VARCHAR(100),                   -- Warna dominan
    sizes TEXT[] DEFAULT '{}',            -- Array ukuran, mis. ARRAY['S', 'M', 'L', 'XL']
    care_instructions TEXT,               -- Cara perawatan produk
    description TEXT,
    image_url TEXT,                       -- URL aset gambar dari Cloudinary
    is_dummy BOOLEAN DEFAULT FALSE,       -- Penanda data sintetis/dummy sesuai mitigasi risiko
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_name ON products(LOWER(name));


-- 2. Tabel Rekomendasi Produk Serupa (Diisi dari hasil olahan tim DS)
CREATE TABLE product_recommendations (
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    recommended_product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    similarity_score NUMERIC(5, 4),      
    PRIMARY KEY (product_id, recommended_product_id),
    CHECK (product_id <> recommended_product_id)
);

CREATE TABLE faqs (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(100),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_dummy BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);