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

    console.log('Monitoring deposits for order:', orderId)

    // Check if deposit has been made
    const depositStatus = await serverMexcService.checkDepositStatus(orderId)

    if (depositStatus.hasDeposit) {
      console.log('Deposit detected for order:', orderId, depositStatus)
      
      // Execute the swap
      const swapResult = await serverMexcService.executeSwap(orderId)
      
      if (swapResult.success) {
        return NextResponse.json({
          success: true,
          message: 'Swap executed successfully',
          depositAmount: depositStatus.depositAmount,
          depositTxHash: depositStatus.depositTxHash,
          swapTxHash: swapResult.txHash
        })
      } else {
        return NextResponse.json({
          success: false,
          error: swapResult.error,
          message: 'Deposit detected but swap execution failed'
        })
      }
    } else {
      return NextResponse.json({
        success: true,
        hasDeposit: false,
        message: 'No deposit detected yet'
      })
    }

  } catch (error) {
    console.error('Deposit monitoring error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to monitor deposits',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 