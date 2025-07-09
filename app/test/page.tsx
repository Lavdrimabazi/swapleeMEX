"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPage() {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (step: string, data: any) => {
    setResults(prev => [...prev, { step, data, timestamp: new Date().toISOString() }])
  }

  const runTest = async () => {
    setIsLoading(true)
    setResults([])
    
    try {
      // Step 1: Check current orders
      addResult("Initial State", "Checking current orders...")
      const debugResponse = await fetch('/api/debug/orders')
      const debugData = await debugResponse.json()
      addResult("Debug Orders", debugData)

      // Step 2: Create order
      addResult("Step 1", "Creating order...")
      const createResponse = await fetch('/api/simulation/test-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromToken: 'BTC',
          toToken: 'SOL',
          amount: '0.001',
          destinationAddress: 'test-sol-address-123',
          testStep: 'create'
        })
      })
      const createData = await createResponse.json()
      addResult("Create Order", createData)

      if (!createData.success) {
        throw new Error('Order creation failed')
      }

      const orderId = createData.result.orderId

      // Step 3: Check orders after creation
      addResult("After Creation", "Checking orders after creation...")
      const debugResponse2 = await fetch('/api/debug/orders')
      const debugData2 = await debugResponse2.json()
      addResult("Debug Orders After Creation", debugData2)

      // Step 4: Simulate deposit
      addResult("Step 2", "Simulating deposit...")
      const depositResponse = await fetch('/api/simulation/test-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          amount: '0.001',
          testStep: 'deposit'
        })
      })
      const depositData = await depositResponse.json()
      addResult("Simulate Deposit", depositData)

      // Step 5: Execute swap
      addResult("Step 3", "Executing swap...")
      const swapResponse = await fetch('/api/simulation/test-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          testStep: 'execute'
        })
      })
      const swapData = await swapResponse.json()
      addResult("Execute Swap", swapData)

      // Step 6: Final check
      addResult("Final State", "Checking final state...")
      const debugResponse3 = await fetch('/api/debug/orders')
      const debugData3 = await debugResponse3.json()
      addResult("Final Debug Orders", debugData3)

    } catch (error) {
      addResult("Error", { error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Debug Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runTest} 
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600"
            >
              {isLoading ? "Running Test..." : "Run Debug Test"}
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>

          <div className="space-y-2">
            {results.map((result, index) => (
              <Card key={index} className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="font-bold text-sm">{result.step}</div>
                  <div className="text-xs text-muted-foreground">{result.timestamp}</div>
                  <pre className="text-xs mt-2 bg-background p-2 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 