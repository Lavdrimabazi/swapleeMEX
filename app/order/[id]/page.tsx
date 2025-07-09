"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, Copy, RefreshCw, CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSound } from "@/components/sound-provider"
import QRCodeComponent from "@/components/qr-code"

interface OrderDetails {
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

export default function OrderPage() {
  const params = useParams()
  const orderId = params.id as string
  const { toast } = useToast()
  const { playClick, playSuccess } = useSound()
  
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  // Fetch order details
  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/swap/status/${orderId}`)
      const result = await response.json()
      
      if (result.success && result.order) {
        setOrder(result.order)
        // Calculate time remaining
        const now = Date.now()
        const remaining = Math.max(0, result.order.expiresAt - now)
        setTimeRemaining(Math.floor(remaining / 1000))
      } else {
        toast({
          title: "Order Not Found",
          description: "The order you're looking for doesn't exist.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      toast({
        title: "Error",
        description: "Failed to load order details.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Check order status periodically
  useEffect(() => {
    fetchOrder()
    
    const interval = setInterval(() => {
      fetchOrder()
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [orderId])

  // Update countdown timer
  useEffect(() => {
    if (!order) return
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) return 0
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [order])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    playSuccess()
    toast({
      title: `${label} copied!`,
      description: `The ${label.toLowerCase()} has been copied to your clipboard.`,
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const generateQRData = () => {
    if (!order?.depositAddress) return ""
    
    // For Bitcoin, include the amount in the QR code
    if (order.fromSymbol === 'BTC') {
      return `bitcoin:${order.depositAddress}?amount=${order.fromAmount}`
    }
    
    // For other tokens, just the address
    return order.depositAddress
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="pixel-border shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/20 via-purple-500/20 to-blue-500/20 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold pixel-font tracking-wider mb-2">
            ORDER #{order.orderId}
          </h1>
          <p className="text-muted-foreground">
            {order.fromSymbol} → {order.toSymbol} Swap
          </p>
        </div>

        {/* Status Card */}
        <Card className="pixel-border shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {order.status === 'pending' && (
                <>
                  <RefreshCw className="h-6 w-6 text-orange-500 animate-spin" />
                  WAITING FOR DEPOSIT
                </>
              )}
              {order.status === 'processing' && (
                <>
                  <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
                  PROCESSING SWAP
                </>
              )}
              {order.status === 'completed' && (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  SWAP COMPLETED
                </>
              )}
              {(order.status === 'failed' || order.status === 'expired') && (
                <>
                  <XCircle className="h-6 w-6 text-red-500" />
                  {order.status === 'failed' ? 'SWAP FAILED' : 'ORDER EXPIRED'}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Details */}
            <div className="pixel-border bg-muted/30 p-4">
              <div className="text-center space-y-4">
                <div className="text-sm font-bold text-muted-foreground pixel-text tracking-wider">
                  TRANSACTION DETAILS
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-muted-foreground pixel-text">SEND</div>
                    <div className="text-xs text-muted-foreground font-mono">{order.fromSymbol}</div>
                    <div className="pixel-border bg-background p-3 flex items-center justify-between">
                      <span className="font-mono text-lg">{order.fromAmount}</span>
                      <div className="w-8 h-8 bg-orange-500 flex items-center justify-center text-white font-bold text-sm rounded">
                        {order.fromSymbol}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-muted-foreground pixel-text">RECEIVE</div>
                    <div className="text-xs text-muted-foreground font-mono">{order.toSymbol}</div>
                    <div className="pixel-border bg-background p-3 flex items-center justify-between">
                      <span className="font-mono text-lg">≈{order.toAmount}</span>
                      <div className="w-8 h-8 bg-blue-500 flex items-center justify-center text-white font-bold text-sm rounded">
                        {order.toSymbol}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            {order.status === 'pending' && (
              <div className="space-y-4">
                <div className="text-center text-sm font-bold pixel-text tracking-wider">
                  SEND {order.fromAmount} {order.fromSymbol} TO:
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32 pixel-border bg-white p-2 flex items-center justify-center">
                    <QRCodeComponent 
                      data={generateQRData()}
                      size={120}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pixel-border bg-muted/30 p-4">
                  <div className="text-xs font-bold pixel-text tracking-wider mb-2">
                    DEPOSIT ADDRESS:
                  </div>
                  <div className="font-mono text-sm break-all mb-2">{order.depositAddress}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full pixel-border"
                    onClick={() => copyToClipboard(order.depositAddress, "Deposit Address")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Address
                  </Button>
                </div>

                {/* Countdown Timer */}
                <div className="text-center">
                  <div className="text-sm font-bold pixel-text tracking-wider mb-2">
                    TIME REMAINING
                  </div>
                  <div className="text-2xl font-mono font-bold text-orange-500">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Order expires in {formatTime(timeRemaining)}
                  </div>
                </div>
              </div>
            )}

            {/* Destination Address */}
            <div className="pixel-border bg-muted/30 p-4">
              <div className="text-xs font-bold pixel-text tracking-wider mb-2">
                DESTINATION ADDRESS ({order.toSymbol}):
              </div>
              <div className="font-mono text-sm break-all mb-2">{order.destinationAddress}</div>
              <Button
                variant="outline"
                size="sm"
                className="w-full pixel-border"
                onClick={() => copyToClipboard(order.destinationAddress, "Destination Address")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Address
              </Button>
            </div>

            {/* Transaction Hash */}
            {order.txHash && (
              <div className="pixel-border bg-muted/30 p-4">
                <div className="text-xs font-bold pixel-text tracking-wider mb-2">
                  TRANSACTION HASH:
                </div>
                <div className="font-mono text-sm break-all mb-2">{order.txHash}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full pixel-border"
                  onClick={() => copyToClipboard(order.txHash!, "Transaction Hash")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Hash
                </Button>
              </div>
            )}

            {/* Error Message */}
            {order.error && (
              <div className="pixel-border bg-red-500/20 p-4">
                <div className="text-xs font-bold pixel-text tracking-wider mb-2 text-red-500">
                  ERROR:
                </div>
                <div className="text-sm text-red-500">{order.error}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1 pixel-border"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Swap
          </Button>
          
          <Button
            className="flex-1 pixel-border bg-orange-500 hover:bg-orange-600 text-black font-bold"
            onClick={() => {
              playClick()
              fetchOrder()
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
        </div>
      </div>
    </div>
  )
} 