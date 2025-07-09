import { NextRequest, NextResponse } from 'next/server'
import { serverMexcService } from '@/lib/server/mexc-service'

export async function GET(request: NextRequest) {
  try {
    const orders = serverMexcService.getAllOrders()
    const pendingOrders = serverMexcService.getPendingOrders()
    
    return NextResponse.json({
      success: true,
      totalOrders: orders.length,
      pendingOrders: pendingOrders.length,
      orders: orders.map((order: any) => ({
        orderId: order.orderId,
        status: order.status,
        fromSymbol: order.fromSymbol,
        toSymbol: order.toSymbol,
        fromAmount: order.fromAmount,
        toAmount: order.toAmount,
        createdAt: new Date(order.createdAt).toISOString(),
        expiresAt: new Date(order.expiresAt).toISOString()
      })),
      simulationMode: true // Default to simulation mode
    })

  } catch (error) {
    console.error('Debug orders error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 