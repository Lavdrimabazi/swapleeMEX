import { NextRequest, NextResponse } from 'next/server'
import { serverMexcService } from '@/lib/server/mexc-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    console.log('Checking order status:', orderId)

    const order = await serverMexcService.getOrderStatus(orderId)

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      order
    })

  } catch (error) {
    console.error('Order status check error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to check order status',
        success: false 
      },
      { status: 500 }
    )
  }
}