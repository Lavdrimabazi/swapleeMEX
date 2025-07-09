import { NextRequest, NextResponse } from 'next/server'
import { serverMexcService } from '@/lib/server/mexc-service'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    console.log('Simulating deposit detection for order:', orderId)

    const hasDeposit = await serverMexcService.simulateDepositDetection(orderId)

    return NextResponse.json({
      success: true,
      hasDeposit,
      message: hasDeposit ? 'Deposit detected and processing started' : 'No deposit detected'
    })

  } catch (error) {
    console.error('Deposit simulation error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to simulate deposit',
        success: false 
      },
      { status: 500 }
    )
  }
} 