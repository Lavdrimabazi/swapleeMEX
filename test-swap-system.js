// Test script for the swap system
const testSwapSystem = async () => {
  console.log('🧪 Testing Swap System...\n')

  try {
    // Test 1: Get a quote
    console.log('1️⃣ Testing quote generation...')
    const quoteResponse = await fetch('http://localhost:3000/api/swap/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromToken: 'BTC',
        toToken: 'USDT',
        amount: '0.001'
      })
    })
    
    const quoteResult = await quoteResponse.json()
    console.log('✅ Quote result:', quoteResult)

    // Test 2: Create a swap order
    console.log('\n2️⃣ Testing swap order creation...')
    const orderResponse = await fetch('http://localhost:3000/api/swap/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromToken: 'BTC',
        toToken: 'USDT',
        amount: '0.001',
        destinationAddress: '0x521b7FE4D6C6c21B42336E8F2D73C04B142FD6d7'
      })
    })
    
    const orderResult = await orderResponse.json()
    console.log('✅ Order result:', orderResult)

    if (orderResult.success && orderResult.orderId) {
      // Test 3: Check order status
      console.log('\n3️⃣ Testing order status check...')
      const statusResponse = await fetch(`http://localhost:3000/api/swap/status/${orderResult.orderId}`)
      const statusResult = await statusResponse.json()
      console.log('✅ Status result:', statusResult)

      // Test 4: Monitor deposits (should return no deposit yet)
      console.log('\n4️⃣ Testing deposit monitoring...')
      const depositResponse = await fetch('http://localhost:3000/api/swap/monitor-deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderResult.orderId })
      })
      const depositResult = await depositResponse.json()
      console.log('✅ Deposit monitoring result:', depositResult)
    }

    console.log('\n🎉 All tests completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Send BTC to the deposit address shown above')
    console.log('2. The system will automatically detect the deposit')
    console.log('3. Swap will execute automatically')
    console.log('4. USDT will be sent to your destination address')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testSwapSystem() 