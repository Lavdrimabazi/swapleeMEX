import { orderManager } from './order-manager'
import { serverMexcService } from './mexc-service'

export async function initializeServices() {
  try {
    console.log('Initializing SwapleeMEX services...')
    
    // Validate MEXC configuration
    const configValid = await serverMexcService.validateConfig()
    if (!configValid) {
      throw new Error('MEXC configuration is invalid')
    }
    
    // Start the order manager
    orderManager.start()
    
    console.log('✅ All services initialized successfully')
    
    // Set up graceful shutdown
    process.on('SIGINT', gracefulShutdown)
    process.on('SIGTERM', gracefulShutdown)
    
  } catch (error) {
    console.error('❌ Failed to initialize services:', error)
    process.exit(1)
  }
}

async function gracefulShutdown() {
  console.log('\n🔄 Shutting down services gracefully...')
  
  try {
    // Stop the order manager
    orderManager.stop()
    
    console.log('✅ Services shut down successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during shutdown:', error)
    process.exit(1)
  }
}

// Auto-initialize if this module is imported
if (typeof window === 'undefined') {
  // Only run on server side
  initializeServices().catch(console.error)
} 