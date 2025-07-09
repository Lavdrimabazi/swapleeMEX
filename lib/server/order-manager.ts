import { serverMexcService } from './mexc-service'

export interface OrderManagerConfig {
  maxOrderAge: number // in milliseconds
  checkInterval: number // in milliseconds
  retryAttempts: number
}

export class OrderManager {
  private config: OrderManagerConfig
  private isRunning: boolean = false
  private intervalId?: NodeJS.Timeout

  constructor(config: Partial<OrderManagerConfig> = {}) {
    this.config = {
      maxOrderAge: 30 * 60 * 1000, // 30 minutes
      checkInterval: 10 * 1000, // 10 seconds
      retryAttempts: 3,
      ...config
    }
  }

  // Start the order monitoring process
  start() {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('Order manager started')
    
    this.intervalId = setInterval(() => {
      this.processOrders()
    }, this.config.checkInterval)
  }

  // Stop the order monitoring process
  stop() {
    if (!this.isRunning) return
    
    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
    console.log('Order manager stopped')
  }

  // Process all pending orders
  private async processOrders() {
    try {
      // Clean up expired orders
      await serverMexcService.cleanupExpiredOrders()
      
      // Get all pending orders
      const pendingOrders = await serverMexcService.getPendingOrders()
      
      for (const order of pendingOrders) {
        await this.processOrder(order.orderId)
      }
    } catch (error) {
      console.error('Error processing orders:', error)
    }
  }

  // Process a single order
  private async processOrder(orderId: string) {
    try {
      // Check if deposit has been made
      const depositStatus = await serverMexcService.checkDepositStatus(orderId)
      
      if (depositStatus.hasDeposit) {
        console.log(`Deposit detected for order ${orderId}, executing swap...`)
        
        // Execute the swap
        const swapResult = await serverMexcService.executeSwap(orderId)
        
        if (swapResult.success) {
          console.log(`Swap executed successfully for order ${orderId}`)
        } else {
          console.error(`Swap execution failed for order ${orderId}:`, swapResult.error)
        }
      }
    } catch (error) {
      console.error(`Error processing order ${orderId}:`, error)
    }
  }

  // Get order manager status
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      checkInterval: this.config.checkInterval
    }
  }
}

// Create a singleton instance
export const orderManager = new OrderManager() 