const { MongoClient, ObjectId } = require('mongodb');

const URI =
  'mongodb+srv://dangtienhungdev:Htm%4023624@jewelry-shop.v2r4ocu.mongodb.net/?retryWrites=true&w=majority&appName=jewelry-shop';

async function debugCanReview() {
  const client = new MongoClient(URI);

  try {
    await client.connect();
    const db = client.db('jewelry-shop');

    const customerId = '68600a80e6d86dea6c333965';
    const productId = '68568fe74132ecb6b851fb75';

    console.log('=== Debug CanReview Logic ===');
    console.log('Customer ID:', customerId);
    console.log('Product ID:', productId);

    // Test different query variations
    console.log('\n--- Test 1: String IDs ---');
    const order1 = await db.collection('orders').findOne({
      customerId: customerId,
      status: 'success',
      'orderDetails.productId': productId,
    });
    console.log('Order found (string IDs):', !!order1);

    console.log('\n--- Test 2: ObjectId conversion ---');
    const order2 = await db.collection('orders').findOne({
      customerId: new ObjectId(customerId),
      status: 'success',
      'orderDetails.productId': new ObjectId(productId),
    });
    console.log('Order found (ObjectId):', !!order2);

    console.log('\n--- Test 3: Check customer orders ---');
    const customerOrders = await db
      .collection('orders')
      .find({
        customerId: customerId,
      })
      .toArray();

    console.log('Total customer orders:', customerOrders.length);
    customerOrders.forEach((order, i) => {
      console.log(`Order ${i + 1}:`, {
        _id: order._id.toString(),
        status: order.status,
        productIds: order.orderDetails?.map((d) => d.productId) || [],
      });
    });

    console.log('\n--- Test 4: Check specific success order ---');
    const successOrder = await db.collection('orders').findOne({
      customerId: customerId,
      status: 'success',
    });

    if (successOrder) {
      console.log('Success order found:', successOrder._id.toString());
      console.log(
        'Products in order:',
        successOrder.orderDetails?.map((d) => d.productId) || [],
      );

      const hasProduct = successOrder.orderDetails?.some(
        (d) =>
          d.productId === productId || d.productId.toString() === productId,
      );
      console.log('Contains target product:', hasProduct);
    }

    console.log('\n--- Test 5: Check reviews ---');
    const reviews = await db
      .collection('reviews')
      .find({
        customerId: customerId,
      })
      .toArray();
    console.log('Existing reviews:', reviews.length);

    // Final logic
    console.log('\n--- Final Test ---');
    const finalOrder =
      successOrder &&
      successOrder.orderDetails?.some(
        (d) => d.productId.toString() === productId,
      );
    const hasReview = reviews.some((r) => r.productId.toString() === productId);

    console.log('Has qualifying order:', !!finalOrder);
    console.log('Has existing review:', hasReview);
    console.log('Can review:', !!finalOrder && !hasReview);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

debugCanReview().catch(console.error);
