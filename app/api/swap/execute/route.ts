import { NextRequest, NextResponse } from 'next/server'
import { serverMexcService } from '@/lib/server/mexc-service'

export async function POST(request: NextRequest) {
  try {
    const { fromToken, toToken, amount, destinationAddress } = await request.json()

    if (!fromToken || !toToken || !amount || !destinationAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Validate destination address format based on token
    if (!isValidAddress(destinationAddress, toToken)) {
      return NextResponse.json(
        { error: `Invalid ${toToken} destination address format` },
        { status: 400 }
      )
    }

    console.log('Creating swap order:', { fromToken, toToken, amount, destinationAddress })

    // Create the swap order (this generates deposit address and stores order)
    const order = await serverMexcService.createSwapOrder(fromToken, toToken, amount, destinationAddress)

    console.log('Swap order created:', order.orderId)

    // Return the order details for the frontend
    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      depositAddress: order.depositAddress,
      destinationAddress: order.destinationAddress,
      fromAmount: order.fromAmount,
      toAmount: order.toAmount,
      status: order.status,
      expiresAt: order.expiresAt
    })

  } catch (error) {
    console.error('Swap order creation error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create swap order',
        success: false 
      },
      { status: 500 }
    )
  }
}

// Basic address validation
function isValidAddress(address: string, token: string): boolean {
  if (!address || address.trim().length === 0) {
    return false
  }

  switch (token) {
    case 'BTC':
      // Bitcoin address validation (basic)
      return /^(bc1|[13])[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)
    case 'ETH':
    case 'USDT':
    case 'USDC':
    case 'LINK':
    case 'UNI':
      // Ethereum address validation
      return /^0x[a-fA-F0-9]{40}$/.test(address)
    case 'SOL':
      // Solana address validation (basic)
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
    case 'BNB':
      // BSC address validation (same as ETH)
      return /^0x[a-fA-F0-9]{40}$/.test(address)
    case 'ADA':
      // Cardano address validation (basic)
      return /^addr1[a-z0-9]{98}$/.test(address)
    case 'DOT':
      // Polkadot address validation (basic)
      return /^1[a-km-zA-HJ-NP-Z1-9]{46,47}$/.test(address)
    default:
      // For unknown tokens, just check if it's not empty
      return address.trim().length > 0
  }
}