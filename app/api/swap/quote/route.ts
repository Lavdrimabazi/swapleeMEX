import { NextRequest, NextResponse } from 'next/server'
import { serverMexcService } from '@/lib/server/mexc-service'

export async function POST(request: NextRequest) {
  try {
    console.log('Quote API called')
    const { fromToken, toToken, amount } = await request.json()
    console.log('Quote request:', { fromToken, toToken, amount })

    if (!fromToken || !toToken || !amount) {
      console.log('Missing parameters')
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    if (parseFloat(amount) <= 0) {
      console.log('Invalid amount')
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    const quote = await serverMexcService.getSwapQuote(fromToken, toToken, amount)
    console.log('Quote result:', quote)

    return NextResponse.json({
      success: true,
      quote
    })

  } catch (error) {
    console.error('Quote API error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get quote',
        success: false 
      },
      { status: 500 }
    )
  }
}