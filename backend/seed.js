/**
 * Pharmacy Seed Data Script
 * Populates the database with test/demo data for development.
 *
 * Run with: node seed.js
 */

const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'pharmacy_app',
  password: '12345678',
  database: 'pharmacy',
});

// ─── CHANGE THE DEMO PASSWORD HERE ───
const DEMO_PASSWORD = 'password123';
// ─────────────────────────────────────

const SALT_ROUNDS = 12;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log(`Executed query in ${duration}ms: ${text.substring(0, 60)}...`);
  return res;
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🌱 Starting seed...\n');

    // ── 1. USERS ──────────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

    const userResult = await client.query(
      `INSERT INTO users (email, password, "firstName", "lastName", role, "isEmailVerified", "isTotpEnabled", "createdAt", "updatedAt")
       VALUES
          ($1, $2, 'Admin', 'User', 'admin', true, false, NOW(), NOW()),
          ($3, $2, 'Jane', 'Employee', 'employee', true, false, NOW(), NOW()),
          ($4, $2, 'Customer', 'One', 'customer', true, false, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET
          password = EXCLUDED.password,
          "firstName" = EXCLUDED."firstName",
          "lastName" = EXCLUDED."lastName",
          role = EXCLUDED.role,
          "isEmailVerified" = EXCLUDED."isEmailVerified",
          "isTotpEnabled" = EXCLUDED."isTotpEnabled",
          "updatedAt" = NOW()
       RETURNING id, email, role`,
      ['admin@pharmacy.com', hashedPassword, 'employee@pharmacy.com', 'customer@pharmacy.com']
    );

    const users = userResult.rows;
    const adminUser = users.find((u) => u.role === 'admin');
    const employeeUser = users.find((u) => u.role === 'employee');
    const customerUser = users.find((u) => u.role === 'customer');

    console.log(`✅ Created ${users.length} users`);

    // ── 2. CATEGORIES ─────────────────────────────────────────────────────
    const categoryResult = await client.query(
      `INSERT INTO categories (name, description, "createdAt", "updatedAt")
       VALUES
          ('Pain Relief', 'Analgesics and pain management medications', NOW(), NOW()),
          ('Antibiotics', 'Antibacterial and antimicrobial medications', NOW(), NOW()),
          ('Vitamins & Supplements', 'Dietary supplements and vitamins', NOW(), NOW()),
          ('Cold & Flu', 'Cold, flu, and respiratory relief', NOW(), NOW()),
          ('First Aid', 'Wound care and first aid supplies', NOW(), NOW()),
          ('Skin Care', 'Dermatological and skin care products', NOW(), NOW()),
          ('Digestive Health', 'Antacids and digestive aids', NOW(), NOW()),
          ('Pediatrics', 'Children''s medications and care', NOW(), NOW())
       ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          "updatedAt" = NOW()
       RETURNING id, name`
    );

    const categories = categoryResult.rows;
    const catByName = {};
    categories.forEach((c) => { catByName[c.name] = c.id; });

    console.log(`✅ Created ${categories.length} categories`);

    // ── 3. SUPPLIERS ──────────────────────────────────────────────────────
    const supplierResult = await client.query(
      `INSERT INTO suppliers (name, "contactName", email, phone, address, "createdAt", "updatedAt")
       VALUES
          ('MediSupply Co.', 'Robert Chen', 'robert@medisupply.com', '555-0101', '123 Industrial Blvd, Suite 100', NOW(), NOW()),
          ('PharmaDirect', 'Sarah Williams', 'sarah@pharmadirect.com', '555-0102', '456 Wholesale Ave, Unit 5', NOW(), NOW()),
          ('HealthCare Distributors', 'Michael Torres', 'michael@healthcaredist.com', '555-0103', '789 Distribution Center Rd', NOW(), NOW()),
          ('Wellness Wholesale', 'Emily Davis', 'emily@wellnesswholesale.com', '555-0104', '321 Wellness Way', NOW(), NOW())
       ON CONFLICT (name) DO UPDATE SET
          "contactName" = EXCLUDED."contactName",
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          address = EXCLUDED.address,
          "updatedAt" = NOW()
       RETURNING id, name`
    );

    const suppliers = supplierResult.rows;
    const supByName = {};
    suppliers.forEach((s) => { supByName[s.name] = s.id; });

    console.log(`✅ Created ${suppliers.length} suppliers`);

    // ── 4. PRODUCTS ───────────────────────────────────────────────────────
    const products = [
      { sku: 'IBU-200-001', name: 'Ibuprofen 200mg Tablets', barcode: '8901234567890', description: 'Pain relief and anti-inflammatory tablets', unit: 'tablet', salePrice: 8.99, category: 'Pain Relief', doesNotExpire: false },
      { sku: 'ACM-500-002', name: 'Acetaminophen 500mg Caplets', barcode: '8901234567891', description: 'Fever reducer and pain reliever', unit: 'caplet', salePrice: 6.50, category: 'Pain Relief', doesNotExpire: false },
      { sku: 'AMX-250-003', name: 'Amoxicillin 250mg Capsules', barcode: '8901234567892', description: 'Antibiotic for bacterial infections', unit: 'capsule', salePrice: 15.75, category: 'Antibiotics', doesNotExpire: false },
      { sku: 'VITC-500-004', name: 'Vitamin C 500mg Chewable', barcode: '8901234567893', description: 'Immune support supplement', unit: 'tablet', salePrice: 12.00, category: 'Vitamins & Supplements', doesNotExpire: true },
      { sku: 'CFR-001-005', name: 'Cold & Flu Relief Syrup', barcode: '8901234567894', description: 'Multi-symptom cold and flu relief', unit: 'bottle', salePrice: 9.99, category: 'Cold & Flu', doesNotExpire: false },
      { sku: 'BND-001-006', name: 'Adhesive Bandages Assorted', barcode: '8901234567895', description: 'Sterile adhesive bandages various sizes', unit: 'box', salePrice: 4.50, category: 'First Aid', doesNotExpire: true },
      { sku: 'ANT-001-007', name: 'Antacid Chewable Tablets', barcode: '8901234567896', description: 'Fast-acting heartburn relief', unit: 'tablet', salePrice: 5.75, category: 'Digestive Health', doesNotExpire: false },
      { sku: 'CPD-100-008', name: "Children's Pain Relief 100mg", barcode: '8901234567897', description: 'Pediatric pain and fever relief', unit: 'ml', salePrice: 7.25, category: 'Pediatrics', doesNotExpire: false },
      { sku: 'ALV-001-009', name: 'Aloe Vera Gel', barcode: '8901234567898', description: 'Soothing aloe vera skin gel', unit: 'tube', salePrice: 6.99, category: 'Skin Care', doesNotExpire: false },
      { sku: 'MVI-001-010', name: 'Multivitamin Daily', barcode: '8901234567899', description: 'Complete daily multivitamin', unit: 'tablet', salePrice: 14.50, category: 'Vitamins & Supplements', doesNotExpire: true },
    ];

    const productIds = [];
    for (const p of products) {
      const res = await client.query(
        `INSERT INTO products (sku, name, barcode, description, unit, "salePrice", "isActive", "doesNotExpire", "categoryId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8, NOW(), NOW())
         ON CONFLICT (sku) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            "salePrice" = EXCLUDED."salePrice",
            "categoryId" = EXCLUDED."categoryId",
            "updatedAt" = NOW()
         RETURNING id`,
        [p.sku, p.name, p.barcode, p.description, p.unit, p.salePrice, p.doesNotExpire, catByName[p.category]]
      );
      productIds.push({ id: res.rows[0].id, ...p });
    }

    console.log(`✅ Created ${productIds.length} products`);

    // ── 5. BATCHES ────────────────────────────────────────────────────────
    const now = new Date();
    const addDays = (date, days) => {
      const d = new Date(date);
      d.setDate(d.getDate() + days);
      return d;
    };

    const batches = [
      { productSku: 'IBU-200-001', batchNumber: 'IBU200-2025-001', expiry: addDays(now, 180), receivedQty: 500, onHand: 480, unitCost: 3.50, supplier: 'MediSupply Co.' },
      { productSku: 'IBU-200-001', batchNumber: 'IBU200-2025-002', expiry: addDays(now, 300), receivedQty: 300, onHand: 300, unitCost: 3.60, supplier: 'PharmaDirect' },
      { productSku: 'ACM-500-002', batchNumber: 'ACM500-2025-001', expiry: addDays(now, 200), receivedQty: 400, onHand: 385, unitCost: 2.80, supplier: 'MediSupply Co.' },
      { productSku: 'AMX-250-003', batchNumber: 'AMX250-2025-001', expiry: addDays(now, 90), receivedQty: 150, onHand: 145, unitCost: 8.20, supplier: 'HealthCare Distributors' },
      { productSku: 'AMX-250-003', batchNumber: 'AMX250-2025-002', expiry: addDays(now, 45), receivedQty: 80, onHand: 75, unitCost: 8.10, supplier: 'Wellness Wholesale' },
      { productSku: 'VITC-500-004', batchNumber: 'VITC500-2025-001', expiry: addDays(now, 500), receivedQty: 250, onHand: 250, unitCost: 5.00, supplier: 'PharmaDirect' },
      { productSku: 'CFR-001-005', batchNumber: 'CFR001-2025-001', expiry: addDays(now, 120), receivedQty: 120, onHand: 110, unitCost: 4.50, supplier: 'MediSupply Co.' },
      { productSku: 'BND-001-006', batchNumber: 'BND001-2025-001', expiry: addDays(now, 700), receivedQty: 200, onHand: 195, unitCost: 2.00, supplier: 'HealthCare Distributors' },
      { productSku: 'ANT-001-007', batchNumber: 'ANT001-2025-001', expiry: addDays(now, 400), receivedQty: 180, onHand: 170, unitCost: 2.50, supplier: 'Wellness Wholesale' },
      { productSku: 'CPD-100-008', batchNumber: 'CPD100-2025-001', expiry: addDays(now, 150), receivedQty: 90, onHand: 85, unitCost: 3.20, supplier: 'PharmaDirect' },
      { productSku: 'ALV-001-009', batchNumber: 'ALV001-2025-001', expiry: addDays(now, 550), receivedQty: 100, onHand: 98, unitCost: 3.50, supplier: 'MediSupply Co.' },
      { productSku: 'MVI-001-010', batchNumber: 'MVI001-2025-001', expiry: addDays(now, 600), receivedQty: 160, onHand: 160, unitCost: 6.00, supplier: 'PharmaDirect' },
    ];

    const batchIds = [];
    for (const b of batches) {
      const product = productIds.find((p) => p.sku === b.productSku);
      const supplier = suppliers.find((s) => s.name === b.supplier);
      const res = await client.query(
        `INSERT INTO batches ("productId", "supplierId", "batchNumber", "expiryDate", "receivedQuantity", "quantityOnHand", "quantityReserved", "unitCost", "receivedAt", notes, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8, 'Seed batch', NOW(), NOW())
         ON CONFLICT ("productId", "batchNumber", "expiryDate") DO UPDATE SET
            "quantityOnHand" = EXCLUDED."quantityOnHand",
            "updatedAt" = NOW()
         RETURNING id`,
        [product.id, supplier.id, b.batchNumber, b.expiry, b.receivedQty, b.onHand, b.unitCost, now]
      );
      batchIds.push({ id: res.rows[0].id, ...b, productId: product.id });
    }

    console.log(`✅ Created ${batchIds.length} batches`);

    // ── 6. PURCHASES ──────────────────────────────────────────────────────
    const purchases = [
      { supplier: 'MediSupply Co.', invoiceNumber: 'INV-2025-001', receivedBy: adminUser.id, notes: 'Quarterly restock order', items: [
        { productSku: 'IBU-200-001', batchNumber: 'IBU200-2025-001', quantity: 500, unitCost: 3.50 },
        { productSku: 'ACM-500-002', batchNumber: 'ACM500-2025-001', quantity: 400, unitCost: 2.80 },
        { productSku: 'BND-001-006', batchNumber: 'BND001-2025-001', quantity: 200, unitCost: 2.00 },
      ]},
      { supplier: 'PharmaDirect', invoiceNumber: 'INV-2025-002', receivedBy: employeeUser.id, notes: 'Monthly medication order', items: [
        { productSku: 'AMX-250-003', batchNumber: 'AMX250-2025-001', quantity: 150, unitCost: 8.20 },
        { productSku: 'VITC-500-004', batchNumber: 'VITC500-2025-001', quantity: 250, unitCost: 5.00 },
        { productSku: 'CPD-100-008', batchNumber: 'CPD100-2025-001', quantity: 90, unitCost: 3.20 },
      ]},
      { supplier: 'HealthCare Distributors', invoiceNumber: 'INV-2025-003', receivedBy: adminUser.id, notes: 'Antibiotic and first aid supplies', items: [
        { productSku: 'AMX-250-003', batchNumber: 'AMX250-2025-002', quantity: 80, unitCost: 8.10 },
        { productSku: 'CFR-001-005', batchNumber: 'CFR001-2025-001', quantity: 120, unitCost: 4.50 },
      ]},
      { supplier: 'Wellness Wholesale', invoiceNumber: 'INV-2025-004', receivedBy: employeeUser.id, notes: 'Digestive and skin care', items: [
        { productSku: 'ANT-001-007', batchNumber: 'ANT001-2025-001', quantity: 180, unitCost: 2.50 },
        { productSku: 'ALV-001-009', batchNumber: 'ALV001-2025-001', quantity: 100, unitCost: 3.50 },
        { productSku: 'MVI-001-010', batchNumber: 'MVI001-2025-001', quantity: 160, unitCost: 6.00 },
      ]},
    ];

    const purchaseIds = [];
    for (const p of purchases) {
      const supplier = suppliers.find((s) => s.name === p.supplier);
      const totalCost = p.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

      const purchaseRes = await client.query(
        `INSERT INTO purchases ("supplierId", "receivedById", "invoiceNumber", notes, "receivedAt", "totalCost", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id`,
        [supplier.id, p.receivedBy, p.invoiceNumber, p.notes, now, totalCost]
      );
      const purchaseId = purchaseRes.rows[0].id;
      purchaseIds.push(purchaseId);

      for (const item of p.items) {
        const product = productIds.find((pr) => pr.sku === item.productSku);
        const batch = batchIds.find((b) => b.batchNumber === item.batchNumber);
        const lineTotal = item.quantity * item.unitCost;

        await client.query(
          `INSERT INTO purchase_items ("purchaseId", "productId", "batchId", quantity, "unitCost", "lineTotal", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [purchaseId, product.id, batch.id, item.quantity, item.unitCost, lineTotal]
        );

        await client.query(
          `INSERT INTO stock_movements ("movementType", "referenceType", "productId", "batchId", "purchaseId", "purchaseItemId", quantity, "unitCost", "occurredAt", note, "createdAt")
           VALUES ('stock_in', 'purchase', $1, $2, $3, $4, $5, $6, $7, 'Purchase receipt', NOW())`,
          [product.id, batch.id, purchaseId, undefined, item.quantity, item.unitCost, now]
        );
      }
    }

    console.log(`✅ Created ${purchaseIds.length} purchases with items`);

    // ── 7. SALES ──────────────────────────────────────────────────────────
    const sales = [
      { soldBy: employeeUser.id, notes: 'Customer purchase - cash', items: [
        { productSku: 'IBU-200-001', quantity: 2, unitPrice: 8.99 },
        { productSku: 'VITC-500-004', quantity: 1, unitPrice: 12.00 },
      ]},
      { soldBy: employeeUser.id, notes: 'Customer purchase - card', items: [
        { productSku: 'ACM-500-002', quantity: 3, unitPrice: 6.50 },
        { productSku: 'BND-001-006', quantity: 1, unitPrice: 4.50 },
      ]},
      { soldBy: adminUser.id, notes: 'Pharmacy sale - insurance', items: [
        { productSku: 'AMX-250-003', quantity: 10, unitPrice: 15.75 },
        { productSku: 'ANT-001-007', quantity: 2, unitPrice: 5.75 },
      ]},
    ];

    const saleIds = [];
    for (const s of sales) {
      const totalAmount = s.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

      const saleRes = await client.query(
        `INSERT INTO sales ("soldById", notes, "soldAt", "totalAmount", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id`,
        [s.soldBy, s.notes, now, totalAmount]
      );
      const saleId = saleRes.rows[0].id;
      saleIds.push(saleId);

      for (const item of s.items) {
        const product = productIds.find((pr) => pr.sku === item.productSku);
        const lineTotal = item.quantity * item.unitPrice;

        const availableBatch = batchIds.find((b) => b.productId === product.id && b.onHand >= item.quantity);
        if (!availableBatch) {
          console.warn(`⚠️  No batch with enough stock for ${product.name}, skipping sale item`);
          continue;
        }

        const saleItemRes = await client.query(
          `INSERT INTO sale_items ("saleId", "productId", quantity, "unitPrice", "lineTotal", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           RETURNING id`,
          [saleId, product.id, item.quantity, item.unitPrice, lineTotal]
        );
        const saleItemId = saleItemRes.rows[0].id;

        await client.query(
          `INSERT INTO sale_item_allocations ("saleItemId", "batchId", quantity, "unitCost", "createdAt")
           VALUES ($1, $2, $3, $4, NOW())`,
          [saleItemId, availableBatch.id, item.quantity, availableBatch.unitCost]
        );

        await client.query(
          `UPDATE batches SET "quantityOnHand" = "quantityOnHand" - $1 WHERE id = $2`,
          [item.quantity, availableBatch.id]
        );

        await client.query(
          `INSERT INTO stock_movements ("movementType", "referenceType", "productId", "batchId", "saleId", "saleItemId", quantity, "unitPrice", "occurredAt", note, "createdAt")
           VALUES ('stock_out', 'sale', $1, $2, $3, $4, $5, $6, $7, 'Sale fulfillment', NOW())`,
          [product.id, availableBatch.id, saleId, saleItemId, item.quantity, item.unitPrice, now]
        );
      }
    }

    console.log(`✅ Created ${saleIds.length} sales with items`);

    // ── 8. SALE RETURNS ───────────────────────────────────────────────────
    const returns = [
      { saleId: saleIds[0], processedBy: employeeUser.id, reason: 'Customer returned unopened item', items: [
        { productSku: 'VITC-500-004', quantity: 1, unitPrice: 12.00 },
      ]},
    ];

    const returnIds = [];
    for (const r of returns) {
      const totalRefund = r.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

      const returnRes = await client.query(
        `INSERT INTO sale_returns ("saleId", "processedById", reason, "returnedAt", "totalRefund", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id`,
        [r.saleId, r.processedBy, r.reason, now, totalRefund]
      );
      const returnId = returnRes.rows[0].id;
      returnIds.push(returnId);

      for (const item of r.items) {
        const product = productIds.find((pr) => pr.sku === item.productSku);
        const lineTotal = item.quantity * item.unitPrice;

        const saleItem = await client.query(
          `SELECT si.* FROM sale_items si WHERE si."saleId" = $1 AND si."productId" = $2 LIMIT 1`,
          [r.saleId, product.id]
        );

        if (saleItem.rows.length > 0) {
          await client.query(
            `INSERT INTO return_items ("returnId", "saleItemId", "productId", quantity, "unitPrice", "lineTotal", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [returnId, saleItem.rows[0].id, product.id, item.quantity, item.unitPrice, lineTotal]
          );

          const availableBatch = batchIds.find((b) => b.productId === product.id);
          if (availableBatch) {
            await client.query(
              `UPDATE batches SET "quantityOnHand" = "quantityOnHand" + $1 WHERE id = $2`,
              [item.quantity, availableBatch.id]
            );

            await client.query(
              `INSERT INTO stock_movements ("movementType", "referenceType", "productId", "batchId", "returnId", quantity, "unitPrice", "occurredAt", note, "createdAt")
               VALUES ('stock_in', 'return', $1, $2, $3, $4, $5, $6, 'Return restock', NOW())`,
              [product.id, availableBatch.id, returnId, item.quantity, item.unitPrice, now]
            );
          }
        }
      }
    }

    console.log(`✅ Created ${returnIds.length} sale returns`);

    await client.query('COMMIT');

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📋 Test accounts:');
    console.log(`   Admin:    admin@pharmacy.com    / ${DEMO_PASSWORD}`);
    console.log(`   Employee: employee@pharmacy.com / ${DEMO_PASSWORD}`);
    console.log(`   Customer: customer@pharmacy.com / ${DEMO_PASSWORD}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('❌ Seed script failed:', err);
  process.exit(1);
});
