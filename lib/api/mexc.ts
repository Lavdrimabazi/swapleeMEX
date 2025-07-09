import crypto from 'crypto'

// MEXC API Configuration
const MEXC_BASE_URL = 'https://api.mexc.com'
const MEXC_API_VERSION = '/api/v3'

export interface MexcCredentials {
  apiKey: string
  secretKey: string
}

export interface TokenInfo {
  symbol: string
  name: string
  network: string
  withdrawEnabled: boolean
  depositEnabled: boolean
  minWithdraw: string
  withdrawFee: string
}

export interface OrderRequest {
  symbol: string
  side: 'BUY' | 'SELL'
  type: 'MARKET' | 'LIMIT'
  quantity: string
  price?: string
}

export interface SwapQuote {
  fromSymbol: string
  toSymbol: string
  fromAmount: string
  toAmount: string
  rate: string
  fee: string
  orderId?: string
}

export class MexcAPI {
  private apiKey: string
  private secretKey: string

  constructor(credentials: MexcCredentials) {
    this.apiKey = credentials.apiKey
    this.secretKey = credentials.secretKey
  }

  // Generate signature for authenticated requests
  private generateSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(queryString)
      .digest('hex')
  }

  // Create authenticated request headers
  private createHeaders(timestamp: number, signature: string) {
    return {
      'X-MEXC-APIKEY': this.apiKey,
      'Content-Type': 'application/json',
    }
  }

  // Make authenticated API request
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    params: Record<string, any> = {}
  ) {
    const timestamp = Date.now()
    const queryString = new URLSearchParams({
      ...params,
      timestamp: timestamp.toString(),
    }).toString()

    const signature = this.generateSignature(queryString)
    const url = `${MEXC_BASE_URL}${MEXC_API_VERSION}${endpoint}?${queryString}&signature=${signature}`

    const response = await fetch(url, {
      method,
      headers: this.createHeaders(timestamp, signature),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`MEXC API Error: ${error.msg || response.statusText}`)
    }

    return response.json()
  }

  // Get account information
  async getAccountInfo() {
    return this.makeRequest('/account')
  }

  // Get all supported symbols
  async getExchangeInfo() {
    const response = await fetch(`${MEXC_BASE_URL}${MEXC_API_VERSION}/exchangeInfo`, {
      headers: {
        'User-Agent': 'Swaplee/1.0'
      }
    })
    return response.json()
  }

  // Get current price for a symbol
  async getPrice(symbol: string) {
    const response = await fetch(`${MEXC_BASE_URL}${MEXC_API_VERSION}/ticker/price?symbol=${symbol}`, {
      headers: {
        'User-Agent': 'Swaplee/1.0',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to get price for ${symbol}: ${response.status}`)
    }
    
    return response.json()
  }

  // Get order book depth
  async getOrderBook(symbol: string, limit: number = 100) {
    const response = await fetch(`${MEXC_BASE_URL}${MEXC_API_VERSION}/depth?symbol=${symbol}&limit=${limit}`, {
      headers: {
        'User-Agent': 'Swaplee/1.0'
      }
    })
    return response.json()
  }

  // Place a new order
  async placeOrder(order: OrderRequest) {
    return this.makeRequest('/order', 'POST', order)
  }

  // Get order status
  async getOrder(symbol: string, orderId: string) {
    return this.makeRequest('/order', 'GET', { symbol, orderId })
  }

  // Cancel an order
  async cancelOrder(symbol: string, orderId: string) {
    return this.makeRequest('/order', 'DELETE', { symbol, orderId })
  }

  // Get account balances
  async getBalances() {
    const account = await this.getAccountInfo()
    return account.balances.filter((balance: any) => 
      parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
    )
  }

  // Calculate swap quote
  async getSwapQuote(fromSymbol: string, toSymbol: string, amount: string): Promise<SwapQuote> {
    try {
      console.log(`Getting quote for ${fromSymbol} to ${toSymbol}, amount: ${amount}`)
      
      // For direct pairs (e.g., BTC/USDT)
      const directSymbol = `${fromSymbol}${toSymbol}`
      let price: any
      let isReverse = false
      let actualSymbol = directSymbol

      try {
        console.log(`Trying direct symbol: ${directSymbol}`)
        price = await this.getPrice(directSymbol)
        console.log(`Direct price found:`, price)
      } catch {
        // Try reverse pair (e.g., USDT/BTC)
        const reverseSymbol = `${toSymbol}${fromSymbol}`
        console.log(`Trying reverse symbol: ${reverseSymbol}`)
        price = await this.getPrice(reverseSymbol)
        console.log(`Reverse price found:`, price)
        isReverse = true
        actualSymbol = reverseSymbol
      }

      const rate = parseFloat(price.price)
      const fromAmount = parseFloat(amount)
      
      if (isNaN(rate) || isNaN(fromAmount)) {
        throw new Error('Invalid price or amount data')
      }
      
      let toAmount: number
      if (isReverse) {
        toAmount = fromAmount / rate
      } else {
        toAmount = fromAmount * rate
      }

      // Calculate fee (0.1% trading fee)
      const fee = toAmount * 0.003 // 0.3% fee

      return {
        fromSymbol,
        toSymbol,
        fromAmount: amount,
        toAmount: (toAmount - fee).toFixed(8),
        rate: rate.toString(),
        fee: fee.toFixed(8),
        orderId: `QUOTE_${Date.now()}`
      }
    } catch (error) {
      console.error('Quote error:', error)
      throw new Error(`Failed to get swap quote: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Execute swap (market order)
  async executeSwap(fromSymbol: string, toSymbol: string, amount: string): Promise<any> {
    try {
      const quote = await this.getSwapQuote(fromSymbol, toSymbol, amount)
      
      // Determine trading pair and side
      const directSymbol = `${fromSymbol}${toSymbol}`
      let symbol = directSymbol
      let side: 'BUY' | 'SELL' = 'SELL'
      let quantity = amount

      try {
        await this.getPrice(directSymbol)
      } catch {
        // Use reverse pair
        symbol = `${toSymbol}${fromSymbol}`
        side = 'BUY'
        // For buy orders, quantity should be in quote currency
        quantity = quote.toAmount
      }

      const order: OrderRequest = {
        symbol,
        side,
        type: 'MARKET',
        quantity
      }

      const result = await this.placeOrder(order)
      
      return {
        ...result,
        quote,
        swapId: result.orderId
      }
    } catch (error) {
      throw new Error(`Swap execution failed: ${error}`)
    }
  }
}

// Utility functions for the frontend
export const mexcUtils = {
  // Format number for display
  formatAmount: (amount: string | number, decimals: number = 8): string => {
    return parseFloat(amount.toString()).toFixed(decimals)
  },

  // Validate trading pair
  isValidPair: (symbol1: string, symbol2: string): boolean => {
    const validSymbols = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'MATIC', 'SOL']
    return validSymbols.includes(symbol1) && validSymbols.includes(symbol2) && symbol1 !== symbol2
  },

  // Calculate minimum trade amount
  getMinTradeAmount: (symbol: string): string => {
    const minimums: Record<string, string> = {
      'BTC': '0.00001',
      'ETH': '0.0001',
      'USDT': '1',
      'USDC': '1',
      'BNB': '0.001',
      'MATIC': '1',
      'SOL': '0.01'
    }
    return minimums[symbol] || '0.001'
  }
}