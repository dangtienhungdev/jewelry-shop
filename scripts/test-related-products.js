#!/usr/bin/env node

/**
 * Script để test API sản phẩm liên quan
 * Usage: node scripts/test-related-products.js [productId] [limit]
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testRelatedProducts(productId, limit = 8) {
  console.log('🧪 Testing Related Products API...\n');

  const url = `${BASE_URL}/products/${productId}/related${limit ? `?limit=${limit}` : ''}`;
  console.log(`📡 Request URL: ${url}`);
  console.log(`📋 Product ID: ${productId}`);
  console.log(`📊 Limit: ${limit}\n`);

  try {
    const response = await makeRequest(url);

    console.log(`✅ Status: ${response.status}`);

    if (response.status === 200) {
      const { success, message, data } = response.data;

      console.log(`📝 Message: ${message}`);
      console.log(`📦 Total items: ${data.total}`);
      console.log(`🔢 Limit: ${data.limit}`);
      console.log(`⏰ Timestamp: ${data.timestamp}\n`);

      if (data.items && data.items.length > 0) {
        console.log('📋 Related Products:');
        data.items.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.productName}`);
          console.log(
            `     💰 Price: ${product.effectivePrice.toLocaleString('vi-VN')}đ`,
          );
          console.log(
            `     📂 Category: ${product.category?.categoryName || 'N/A'}`,
          );
          console.log(`     📊 Views: ${product.views}`);
          console.log(`     📦 Stock: ${product.stockQuantity}`);
          console.log('');
        });
      } else {
        console.log('❌ No related products found');
      }
    } else {
      console.log('❌ Error Response:');
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

async function runTests() {
  const productId = process.argv[2];
  const limit = process.argv[3] ? parseInt(process.argv[3]) : 8;

  if (!productId) {
    console.log('❌ Please provide a product ID');
    console.log(
      'Usage: node scripts/test-related-products.js <productId> [limit]',
    );
    console.log(
      'Example: node scripts/test-related-products.js 60d5f484e1a2f5001f647abc 6',
    );
    process.exit(1);
  }

  // Test valid request
  await testRelatedProducts(productId, limit);

  console.log('\n' + '='.repeat(50) + '\n');

  // Test invalid ID
  console.log('🧪 Testing with invalid ID...\n');
  await testRelatedProducts('invalid-id', 4);

  console.log('\n' + '='.repeat(50) + '\n');

  // Test non-existent ID
  console.log('🧪 Testing with non-existent ID...\n');
  await testRelatedProducts('507f1f77bcf86cd799439011', 4);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testRelatedProducts };
