import { MexcAPI, type SwapQuote } from './mexc'

export interface SwapRequest {
  fromToken: string
  toToken: string
  amount: string
  destinationAddress: string
}

export interface SwapResponse {
  success: boolean
  swapId: string
  quote: SwapQuote
  status: 'pending' | 'processing' | 'completed' | 'failed'
  txHash?: string
  error?: string
}

export interface SwapStatus {
  swapId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  destinationAddress: string
  createdAt: string
  completedAt?: string
  txHash?: string
  error?: string
}

class SwapService {
  private mexcApi: MexcAPI | null = null
  private swaps: Map<string, SwapStatus> = new Map()

  // Initialize with MEXC credentials
  initialize(apiKey: string, secretKey: string) {
    this.mexcApi = new MexcAPI({ apiKey, secretKey })
  }

  // Check if service is initialized
  private ensureInitialized() {
    if (!this.mexcApi) {
      throw new Error('Swap service not initialized. Please provide MEXC API credentials.')
    }
  }

  // Get swap quote
  async getQuote(fromToken: string, toToken: string, amount: string): Promise<SwapQuote> {
    this.ensureInitialized()
    
    try {
      console.log('SwapService: Getting quote from MEXC API')
      const quote = await this.mexcApi!.getSwapQuote(fromToken, toToken, amount)
      console.log('SwapService: Quote received:', quote)
      return quote
    } catch (error) {
      console.error('SwapService: Quote error:', error)
      throw error
    }
  }

  // Execute swap
  async executeSwap(request: SwapRequest): Promise<SwapResponse> {
    this.ensureInitialized()

    const swapId = this.generateSwapId()
    
    try {
      // Create initial swap status
      const swapStatus: SwapStatus = {
        swapId,
        status: 'pending',
        fromToken: request.fromToken,
        toToken: request.toToken,
        fromAmount: request.amount,
        toAmount: '0',
        destinationAddress: request.destinationAddress,
        createdAt: new Date().toISOString()
      }
      
      this.swaps.set(swapId, swapStatus)

      // Update status to processing
      swapStatus.status = 'processing'
      this.swaps.set(swapId, swapStatus)

      // Execute the swap on MEXC
      const result = await this.mexcApi!.executeSwap(
        request.fromToken,
        request.toToken,
        request.amount
      )

      // Update swap status with results
      swapStatus.status = 'completed'
      swapStatus.toAmount = result.quote.toAmount
      swapStatus.completedAt = new Date().toISOString()
      swapStatus.txHash = result.orderId // Using order ID as transaction hash
      this.swaps.set(swapId, swapStatus)

      return {
        success: true,
        swapId,
        quote: result.quote,
        status: 'completed',
        txHash: result.orderId
      }

    } catch (error) {
      // Update swap status with error
      const swapStatus = this.swaps.get(swapId)
      if (swapStatus) {
        swapStatus.status = 'failed'
        swapStatus.error = error instanceof Error ? error.message : 'Unknown error'
        this.swaps.set(swapId, swapStatus)
      }

      return {
        success: false,
        swapId,
        quote: {
          fromSymbol: request.fromToken,
          toSymbol: request.toToken,
          fromAmount: request.amount,
          toAmount: '0',
          rate: '0',
          fee: '0'
        },
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get swap status
  getSwapStatus(swapId: string): SwapStatus | null {
    return this.swaps.get(swapId) || null
  }

  // Get all swaps
  getAllSwaps(): SwapStatus[] {
    return Array.from(this.swaps.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  // Generate unique swap ID
  private generateSwapId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Simulate network confirmation (for demo purposes)
  private async simulateNetworkConfirmation(swapId: string) {
    setTimeout(() => {
      const swap = this.swaps.get(swapId)
      if (swap && swap.status === 'processing') {
        swap.status = 'completed'
        swap.completedAt = new Date().toISOString()
        this.swaps.set(swapId, swap)
      }
    }, 30000) // 30 seconds delay
  }
}

// Export singleton instance
export const swapService = new SwapService()