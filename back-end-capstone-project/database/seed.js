require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper untuk memastikan format ukuran (sizes) selalu berupa Array
const parseSizes = (sizes) => {
  if (Array.isArray(sizes)) return sizes;
  if (typeof sizes === 'string') {
    return sizes.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('Memulai proses seeding database...');
    await client.query('BEGIN');

    // 1. Seed Tabel Products
    const productsPath = path.join(__dirname, 'data', 'products.json');
    if (fs.existsSync(productsPath)) {
      const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
      const productQuery = `
        INSERT INTO products (
          id, name, category, price, material, motif, color,
          sizes, care_instructions, description, image_url, is_dummy
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          price = EXCLUDED.price,
          material = EXCLUDED.material,
          motif = EXCLUDED.motif,
          color = EXCLUDED.color,
          sizes = EXCLUDED.sizes,
          care_instructions = EXCLUDED.care_instructions,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url,
          is_dummy = EXCLUDED.is_dummy,
          updated_at = CURRENT_TIMESTAMP;
      `;

      for (const item of products) {
        await client.query(productQuery, [
          item.id,
          item.name,
          item.category,
          Number(item.price) || 0,
          item.material || null,
          item.motif || null,
          item.color || null,
          parseSizes(item.sizes),
          item.care_instructions || null,
          item.description || null,
          item.image_url || null,
          Boolean(item.is_dummy),
        ]);
      }
      console.log(`Berhasil seed ${products.length} data produk.`);
    }

    const faqsPath = path.join(__dirname, 'data', 'faqs.json');
    if (fs.existsSync(faqsPath)) {
      const faqs = JSON.parse(fs.readFileSync(faqsPath, 'utf8'));
      const faqQuery = `
        INSERT INTO faqs (id, category, question, answer, is_dummy)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          category = EXCLUDED.category,
          question = EXCLUDED.question,
          answer = EXCLUDED.answer,
          is_dummy = EXCLUDED.is_dummy;
      `;

      for (const faq of faqs) {
        await client.query(faqQuery, [
          faq.id,
          faq.category || null,
          faq.question,
          faq.answer,
          Boolean(faq.is_dummy),
        ]);
      }
      console.log(`Berhasil seed ${faqs.length} data FAQ.`);
    }

    
    const recsPath = path.join(__dirname, 'data', 'recommendations.json');
    if (fs.existsSync(recsPath)) {
      const recs = JSON.parse(fs.readFileSync(recsPath, 'utf8'));
      const recQuery = `
        INSERT INTO product_recommendations (product_id, recommended_product_id, similarity_score)
        VALUES ($1, $2, $3)
        ON CONFLICT (product_id, recommended_product_id) DO UPDATE SET
          similarity_score = EXCLUDED.similarity_score;
      `;

      for (const rec of recs) {
        await client.query(recQuery, [
          rec.product_id,
          rec.recommended_product_id,
          rec.similarity_score || null,
        ]);
      }
      console.log(`Berhasil seed ${recs.length} relasi rekomendasi.`);
    }

    await client.query('COMMIT');
    console.log('Seeding selesai tanpa error.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding gagal, perubahan dibatalkan (ROLLBACK):', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();