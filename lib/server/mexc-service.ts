import crypto from 'crypto'
import { MEXC_CONFIG, validateMexcConfig } from './mexc-config'

export interface SwapQuote {
  fromSymbol: string
  toSymbol: string
  fromAmount: string
  toAmount: string
  rate: string
  fee: string
}

export interface SwapOrder {
  orderId: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
  fromSymbol: string
  toSymbol: string
  fromAmount: string
  toAmount: string
  depositAddress: string
  destinationAddress: string
  createdAt: number
  expiresAt: number
  txHash?: string
  error?: string
}

export interface DepositAddress {
  address: string
  network: string
  memo?: string
}

export class ServerMexcService {
  private apiKey: string
  private secretKey: string
  private baseUrl: string
  private apiVersion: string
  private orders: Map<string, SwapOrder> = new Map()

  constructor() {
    validateMexcConfig()
    this.apiKey = MEXC_CONFIG.apiKey
    this.secretKey = MEXC_CONFIG.secretKey
    this.baseUrl = MEXC_CONFIG.baseUrl
    this.apiVersion = MEXC_CONFIG.apiVersion
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
      'User-Agent': 'Swaplee/1.0'
    }
  }

  // Make authenticated API request
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    params: Record<string, any> = {}
  ) {
    const timestamp = Date.now()
    
    let url = `${this.baseUrl}${this.apiVersion}${endpoint}`
    let fetchOptions: any = {
      method,
      headers: this.createHeaders(timestamp, ''),
    }

    if (method === 'GET') {
      // For GET requests, include timestamp in query string
      const queryParams = { ...params, timestamp: timestamp.toString() }
      const queryString = new URLSearchParams(queryParams).toString()
      const signature = this.generateSignature(queryString)
      url += `?${queryString}&signature=${signature}`
      fetchOptions.headers = this.createHeaders(timestamp, signature)
    } else {
      // For POST requests, include timestamp in both query string and body
      const queryParams = { ...params, timestamp: timestamp.toString() }
      const queryString = new URLSearchParams(queryParams).toString()
      const signature = this.generateSignature(queryString)
      url += `?${queryString}&signature=${signature}`
      fetchOptions.body = JSON.stringify({ ...params, timestamp: timestamp.toString() })
      fetchOptions.headers = this.createHeaders(timestamp, signature)
    }

    console.log(`Making MEXC API request to: ${endpoint}`)
    const response = await fetch(url, fetchOptions)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`MEXC API Error: ${response.status} - ${errorText}`)
      throw new Error(`MEXC API Error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  // Get current price for a symbol (public endpoint)
  async getPrice(symbol: string) {
    const url = `${this.baseUrl}${this.apiVersion}/ticker/price?symbol=${symbol}`
    
    console.log(`Getting price for symbol: ${symbol}`)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Swaplee/1.0',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Price API Error: ${response.status} - ${errorText}`)
      throw new Error(`Failed to get price for ${symbol}: ${response.status}`)
    }
    
    return response.json()
  }

  // Get exchange info (public endpoint)
  async getExchangeInfo() {
    const url = `${this.baseUrl}${this.apiVersion}/exchangeInfo`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Swaplee/1.0',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get exchange info: ${response.status}`)
    }

    return response.json()
  }

  // Calculate swap quote
  async getSwapQuote(fromSymbol: string, toSymbol: string, amount: string): Promise<SwapQuote> {
    try {
      console.log(`Getting quote for ${fromSymbol} to ${toSymbol}, amount: ${amount}`)
      
      // Validate input
      const fromAmount = parseFloat(amount)
      if (isNaN(fromAmount) || fromAmount <= 0) {
        throw new Error('Invalid amount')
      }

      // Try different symbol combinations
      const directSymbol = `${fromSymbol}${toSymbol}`
      const reverseSymbol = `${toSymbol}${fromSymbol}`
      
      let price: any
      let isReverse = false
      let actualSymbol = directSymbol

      try {
        console.log(`Trying direct symbol: ${directSymbol}`)
        price = await this.getPrice(directSymbol)
        console.log(`Direct price found:`, price)
      } catch (error) {
        console.log(`Direct symbol failed, trying reverse: ${reverseSymbol}`)
        try {
          price = await this.getPrice(reverseSymbol)
          console.log(`Reverse price found:`, price)
          isReverse = true
          actualSymbol = reverseSymbol
        } catch (reverseError) {
          console.error('Both direct and reverse symbols failed:', error, reverseError)
          throw new Error(`No trading pair found for ${fromSymbol}/${toSymbol}`)
        }
      }

      const rate = parseFloat(price.price)
      if (isNaN(rate) || rate <= 0) {
        throw new Error('Invalid price data received')
      }
      
      let toAmount: number
      if (isReverse) {
        toAmount = fromAmount / rate
      } else {
        toAmount = fromAmount * rate
      }

      // Calculate fee (0.3% trading fee)
      const feeRate = 0.003
      const fee = toAmount * feeRate
      const finalAmount = toAmount - fee

      console.log(`Quote calculated: ${fromAmount} ${fromSymbol} = ${finalAmount} ${toSymbol} (rate: ${rate}, fee: ${fee})`)

      return {
        fromSymbol,
        toSymbol,
        fromAmount: amount,
        toAmount: finalAmount.toFixed(8),
        rate: rate.toString(),
        fee: fee.toFixed(8)
      }
    } catch (error) {
      console.error('Quote calculation error:', error)
      throw error
    }
  }

  // Helper to get network for a coin
  private async getNetworkForCoin(coin: string): Promise<string> {
    // Query MEXC for supported networks for the coin
    const result = await this.makeRequest('/capital/config/getall')
    const coinInfo = Array.isArray(result)
      ? result.find((c: any) => c.coin === coin)
      : null
    if (!coinInfo || !coinInfo.networkList || coinInfo.networkList.length === 0) {
      throw new Error(`No network found for coin ${coin}`)
    }
    // Prefer the first enabled network
    const enabled = coinInfo.networkList.find((n: any) => n.depositEnable)
    return enabled ? enabled.network : coinInfo.networkList[0].network
  }

  // Generate deposit address for a token using MEXC API
  private async generateDepositAddress(tokenSymbol: string): Promise<DepositAddress> {
    try {
      const coin = tokenSymbol
      const network = await this.getNetworkForCoin(coin)
      // POST /api/v3/capital/deposit/address
      const params = { coin, network }
      const result = await this.makeRequest('/capital/deposit/address', 'POST', params)
      // MEXC sometimes returns an array, sometimes an object
      const addressObj = Array.isArray(result) ? result[0] : result
      if (!addressObj || !addressObj.address) {
        console.error('MEXC deposit address response:', result)
        throw new Error('Failed to get deposit address from MEXC')
      }
      return {
        address: addressObj.address,
        network: addressObj.network,
        memo: addressObj.memo
      }
    } catch (error) {
      console.error('Error generating deposit address:', error)
      throw new Error('Failed to generate deposit address')
    }
  }

  // Create a new swap order
  async createSwapOrder(
    fromSymbol: string, 
    toSymbol: string, 
    fromAmount: string, 
    destinationAddress: string
  ): Promise<SwapOrder> {
    try {
      console.log(`Creating swap order: ${fromAmount} ${fromSymbol} -> ${toSymbol} to ${destinationAddress}`)

      // Get quote first
      const quote = await this.getSwapQuote(fromSymbol, toSymbol, fromAmount)
      
      // Generate deposit address for the from token
      const depositAddressInfo = await this.generateDepositAddress(fromSymbol)
      
      // Create order ID
      const orderId = `SWAP_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
      
      // Set expiration time (20 minutes from now)
      const createdAt = Date.now()
      const expiresAt = createdAt + (20 * 60 * 1000) // 20 minutes
      
      // Create the order
      const order: SwapOrder = {
        orderId,
        status: 'pending',
        fromSymbol,
        toSymbol,
        fromAmount,
        toAmount: quote.toAmount,
        depositAddress: depositAddressInfo.address,
        destinationAddress,
        createdAt,
        expiresAt,
        txHash: undefined,
        error: undefined
      }
      
      // Store the order
      this.orders.set(orderId, order)
      
      console.log(`Swap order created: ${orderId}`)
      
      return order
    } catch (error) {
      console.error('Error creating swap order:', error)
      throw new Error(`Failed to create swap order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Monitor deposits for an order
  async checkDepositStatus(orderId: string): Promise<{
    hasDeposit: boolean
    depositAmount?: string
    depositTxHash?: string
  }> {
    const order = this.orders.get(orderId)
    if (!order || order.status !== 'pending') {
      return { hasDeposit: false }
    }

    try {
      // Get deposit history from MEXC
      const deposits = await this.makeRequest('/capital/deposit/hisrec', 'GET', {
        coin: order.fromSymbol,
        status: 1, // 1 = completed deposits
        limit: 100
      })

      if (!Array.isArray(deposits)) {
        console.error('Invalid deposit history response:', deposits)
        return { hasDeposit: false }
      }

      // Find deposit matching our order
      const matchingDeposit = deposits.find((deposit: any) => {
        return deposit.address === order.depositAddress &&
               parseFloat(deposit.amount) >= parseFloat(order.fromAmount) &&
               deposit.status === 1 // completed
      })

      if (matchingDeposit) {
        return {
          hasDeposit: true,
          depositAmount: matchingDeposit.amount,
          depositTxHash: matchingDeposit.txId
        }
      }

      return { hasDeposit: false }

    } catch (error) {
      console.error('Error checking deposit status:', error)
      return { hasDeposit: false }
    }
  }

  // Execute the actual swap on MEXC
  async executeSwap(orderId: string): Promise<{
    success: boolean
    txHash?: string
    error?: string
  }> {
    const order = this.orders.get(orderId)
    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    if (order.status !== 'pending') {
      return { success: false, error: 'Order is not in pending status' }
    }

    try {
      // Update order status to processing
      order.status = 'processing'
      this.orders.set(orderId, order)

      // Calculate the amount to swap (deposit amount minus our fee)
      const depositAmount = parseFloat(order.fromAmount)
      const feeAmount = depositAmount * 0.003 // 0.3% fee
      const swapAmount = depositAmount - feeAmount

      // Execute spot trade on MEXC
      const tradeResult = await this.makeRequest('/order/spot', 'POST', {
        symbol: `${order.fromSymbol}${order.toSymbol}`,
        side: 'SELL',
        type: 'MARKET',
        quantity: swapAmount.toString(),
        newClientOrderId: orderId
      })

      if (tradeResult.orderId) {
        // Update order with trade details
        order.status = 'completed'
        order.txHash = tradeResult.orderId
        this.orders.set(orderId, order)

        // Now withdraw the swapped tokens to user's address
        const withdrawResult = await this.makeRequest('/capital/withdraw/apply', 'POST', {
          coin: order.toSymbol,
          address: order.destinationAddress,
          amount: order.toAmount,
          network: await this.getNetworkForCoin(order.toSymbol)
        })

        if (withdrawResult.id) {
          return {
            success: true,
            txHash: withdrawResult.id
          }
        } else {
          throw new Error('Withdrawal failed')
        }
      } else {
        throw new Error('Trade execution failed')
      }

    } catch (error) {
      console.error('Swap execution error:', error)
      order.status = 'failed'
      order.error = error instanceof Error ? error.message : 'Unknown error'
      this.orders.set(orderId, order)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get order status
  async getOrderStatus(orderId: string): Promise<SwapOrder | null> {
    const order = this.orders.get(orderId)
    if (!order) {
      return null
    }
    
    // Check if order has expired
    if (order.status === 'pending' && Date.now() > order.expiresAt) {
      order.status = 'expired'
      this.orders.set(orderId, order)
    }
    
    return order
  }

  // Update order status (for monitoring deposits)
  async updateOrderStatus(orderId: string, status: SwapOrder['status'], txHash?: string, error?: string) {
    const order = this.orders.get(orderId)
    if (!order) {
      throw new Error('Order not found')
    }
    
    order.status = status
    if (txHash) order.txHash = txHash
    if (error) order.error = error
    
    this.orders.set(orderId, order)
    console.log(`Order ${orderId} status updated to: ${status}`)
    
    return order
  }

  // Get account information
  async getAccountInfo() {
    return this.makeRequest('/account')
  }

  // Get all active orders
  async getActiveOrders(): Promise<SwapOrder[]> {
    return Array.from(this.orders.values()).filter(order => 
      order.status === 'pending' && Date.now() <= order.expiresAt
    )
  }

  // Validate MEXC configuration
  async validateConfig(): Promise<boolean> {
    try {
      // Test API connection by getting account info
      const accountInfo = await this.makeRequest('/account')
      return !!accountInfo
    } catch (error) {
      console.error('MEXC configuration validation failed:', error)
      return false
    }
  }

  // Get all pending orders
  getPendingOrders(): SwapOrder[] {
    const pendingOrders: SwapOrder[] = []
    for (const order of this.orders.values()) {
      if (order.status === 'pending') {
        pendingOrders.push(order)
      }
    }
    return pendingOrders
  }

  // Clean up expired orders
  async cleanupExpiredOrders() {
    const now = Date.now()
    for (const [orderId, order] of this.orders.entries()) {
      if (order.status === 'pending' && now > order.expiresAt) {
        order.status = 'expired'
        this.orders.set(orderId, order)
      }
    }
  }

  // Simulate deposit detection (for demo purposes)
  // In production, this would be handled by webhooks or polling
  async simulateDepositDetection(orderId: string): Promise<boolean> {
    const order = this.orders.get(orderId)
    if (!order || order.status !== 'pending') {
      return false
    }

    // Simulate 50% chance of deposit detection for demo
    const hasDeposit = Math.random() > 0.5
    
    if (hasDeposit) {
      await this.updateOrderStatus(orderId, 'processing')
      
      // Simulate processing time
      setTimeout(async () => {
        await this.updateOrderStatus(orderId, 'completed', `TX_${orderId}_${Date.now()}`)
      }, 5000)
      
      return true
    }
    
    return false
  }

  // Get order statistics
  async getOrderStats() {
    const orders = Array.from(this.orders.values())
    const now = Date.now()
    
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending' && now <= o.expiresAt).length,
      processing: orders.filter(o => o.status === 'processing').length,
      completed: orders.filter(o => o.status === 'completed').length,
      failed: orders.filter(o => o.status === 'failed').length,
      expired: orders.filter(o => o.status === 'expired').length
    }
  }

  // Validate trading pair
  async validateTradingPair(fromSymbol: string, toSymbol: string): Promise<boolean> {
    try {
      const directSymbol = `${fromSymbol}${toSymbol}`
      const reverseSymbol = `${toSymbol}${fromSymbol}`
      
      try {
        await this.getPrice(directSymbol)
        return true
      } catch {
        try {
          await this.getPrice(reverseSymbol)
          return true
        } catch {
          return false
        }
      }
    } catch {
      return false
    }
  }

  // Get all orders (for debugging)
  getAllOrders(): SwapOrder[] {
    return Array.from(this.orders.values())
  }

  // Get order by ID with detailed logging
  getOrderById(orderId: string): SwapOrder | null {
    console.log(`🔍 DEBUG: Looking for order ${orderId}`)
    console.log(`🔍 DEBUG: Total orders in memory: ${this.orders.size}`)
    console.log(`🔍 DEBUG: Available order IDs: ${Array.from(this.orders.keys()).join(', ')}`)
    
    const order = this.orders.get(orderId)
    if (order) {
      console.log(`✅ DEBUG: Found order ${orderId} with status: ${order.status}`)
    } else {
      console.error(`❌ DEBUG: Order ${orderId} not found`)
    }
    return order || null
  }
}

// Create singleton instance
export const serverMexcService = new ServerMexcService()