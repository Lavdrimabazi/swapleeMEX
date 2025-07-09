"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode as QrCodeIcon, RefreshCw, Copy, ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useSound } from "@/components/sound-provider"
import QRCodeComponent from "@/components/qr-code"

interface SwapStatusProps {
  state: 'form' | 'processing' | 'waiting'
  fromToken: {
    symbol: string
    name: string
    icon: string
    color: string
  }
  toToken: {
    symbol: string
    name: string
    icon: string
    color: string
  }
  fromAmount: string
  toAmount: string
  destinationAddress: string
  depositAddress: string
  orderId: string
  timeRemaining: number
  onSwapAgain: () => void
}

export function SwapStatus({ 
  state,
  fromToken, 
  toToken, 
  fromAmount, 
  toAmount, 
  destinationAddress,
  depositAddress,
  orderId,
  timeRemaining,
  onSwapAgain
}: SwapStatusProps) {
  const { toast } = useToast()
  const { playClick, playSuccess } = useSound()
  const [copied, setCopied] = useState(false)
  const [orderStatus, setOrderStatus] = useState<string>('pending')
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [currentTimeRemaining, setCurrentTimeRemaining] = useState(timeRemaining)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

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

  // Check order status and monitor deposits periodically
  const checkOrderStatus = async () => {
    if (!orderId || isCheckingStatus) return
    
    setIsCheckingStatus(true)
    try {
      // First check order status
      const statusResponse = await fetch(`/api/swap/status/${orderId}`)
      const statusResult = await statusResponse.json()
      
      if (statusResult.success && statusResult.order) {
        setOrderStatus(statusResult.order.status)
        
        // If order is still pending, check for deposits
        if (statusResult.order.status === 'pending') {
          const depositResponse = await fetch('/api/swap/monitor-deposits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
          })
          const depositResult = await depositResponse.json()
          
          if (depositResult.success && depositResult.swapTxHash) {
            // Deposit was detected and swap was executed
            setOrderStatus('completed')
            playSuccess()
            toast({
              title: "Swap Completed!",
              description: `Your ${fromToken.symbol} has been successfully swapped to ${toToken.symbol}.`,
            })
          }
        } else if (statusResult.order.status === 'completed') {
          playSuccess()
          toast({
            title: "Swap Completed!",
            description: `Your ${fromToken.symbol} has been successfully swapped to ${toToken.symbol}.`,
          })
        } else if (statusResult.order.status === 'failed' || statusResult.order.status === 'expired') {
          toast({
            title: "Swap Failed",
            description: statusResult.order.error || "The swap has failed or expired.",
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      console.error('Failed to check order status:', error)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  // Check status every 10 seconds and update countdown
  useEffect(() => {
    const statusInterval = setInterval(checkOrderStatus, 10000)
    const countdownInterval = setInterval(() => {
      setCurrentTimeRemaining(prev => {
        if (prev <= 0) return 0
        return prev - 1
      })
    }, 1000)
    
    return () => {
      clearInterval(statusInterval)
      clearInterval(countdownInterval)
    }
  }, [orderId])

  // Generate QR code data
  const generateQRData = () => {
    if (!depositAddress) return ""
    
    // For Bitcoin, include the amount in the QR code
    if (fromToken.symbol === 'BTC') {
      return `bitcoin:${depositAddress}?amount=${fromAmount}`
    }
    
    // For other tokens, just the address
    return depositAddress
  }

  // Processing state - show spinner
  if (state === 'processing') {
    return (
      <div className="space-y-4 md:space-y-6 w-full animate-slide-in-up">
        <Card className="pixel-border shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold pixel-font tracking-wider">PROCESSING YOUR SWAP</h3>
                <p className="text-muted-foreground font-mono">Please wait while we prepare your transaction...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Waiting for payment state
  return (
    <div className="space-y-4 md:space-y-6 w-full animate-slide-in-up">
      <Card className="pixel-border shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
          <div className="space-y-2">
            <div className="text-xs font-bold text-muted-foreground pixel-text tracking-wider">
              ORDER #{orderId}
            </div>
            <CardTitle className="text-base md:text-xl lg:text-2xl font-bold pixel-font tracking-wider leading-tight">
              WAITING FOR YOU TO SEND {fromToken.symbol}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6 pb-4 md:pb-6">
          <div className="pixel-border bg-muted/30 p-3 md:p-4 lg:p-6">
            <div className="text-center space-y-3 md:space-y-4">
              <div className="text-xs md:text-sm font-bold text-muted-foreground pixel-text tracking-wider">
                TRANSACTION DETAILS
              </div>

              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div className="space-y-1 md:space-y-2">
                  <div className="text-xs font-bold text-muted-foreground pixel-text">SEND</div>
                  <div className="text-xs text-muted-foreground font-mono">{fromToken.symbol}</div>
                  <div className="pixel-border bg-background p-2 md:p-3 flex items-center justify-between min-h-[44px] md:min-h-[48px]">
                    <span className="font-mono text-xs md:text-sm lg:text-lg truncate">{fromAmount}</span>
                    <div
                      className={cn(
                        "w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 flex items-center justify-center text-white font-bold text-xs md:text-sm",
                        fromToken.color,
                      )}
                    >
                      {fromToken.icon}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono truncate">
                    1 {fromToken.symbol} ≈ 59,238.917 USDT
                  </div>
                  <div className="text-xs font-mono">$1005.63</div>
                </div>

                <div className="space-y-1 md:space-y-2">
                  <div className="text-xs font-bold text-muted-foreground pixel-text">RECEIVE</div>
                  <div className="text-xs text-muted-foreground font-mono">{toToken.symbol}</div>
                  <div className="pixel-border bg-background p-2 md:p-3 flex items-center justify-between min-h-[44px] md:min-h-[48px]">
                    <span className="font-mono text-xs md:text-sm lg:text-lg truncate">≈{toAmount}</span>
                    <div
                      className={cn(
                        "w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 flex items-center justify-center text-white font-bold text-xs md:text-sm",
                        toToken.color,
                      )}
                    >
                      {toToken.icon}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono truncate">1 USDT ≈ 1.00 USDT</div>
                  <div className="text-xs font-mono">$1000.08</div>
                </div>
              </div>

              <div className="flex justify-center">
                {orderStatus === 'pending' && (
                  <RefreshCw className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-green-500 animate-spin-slow" />
                )}
                {orderStatus === 'completed' && (
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-green-500" />
                )}
                {(orderStatus === 'failed' || orderStatus === 'expired') && (
                  <XCircle className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-red-500" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap bg-muted/30 p-2 rounded-md">
                <span className="text-sm md:text-base font-bold pixel-text text-orange-500">SEND</span>
                <span className="font-mono text-sm md:text-base truncate">{fromAmount} {fromToken.symbol}</span>
                <div className={cn(
                  "w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-white font-bold text-xs",
                  fromToken.color,
                )}>
                  {fromToken.icon}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap bg-muted/30 p-2 rounded-md">
                <span className="text-sm md:text-base font-bold pixel-text text-orange-500">TO:</span>
                <span className="font-mono text-xs md:text-sm truncate flex-1 min-w-0">
                  {depositAddress}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 pixel-border bg-transparent flex-shrink-0"
                  onClick={() => {
                    playClick();
                    copyToClipboard(depositAddress, "Address");
                  }}
                >
                  <Copy className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>

            <div className="pixel-border bg-muted/30 p-3 md:p-4">
              <div className="text-xs md:text-sm font-bold pixel-text tracking-wider mb-2">DEPOSIT ADDRESS {fromToken.symbol}:</div>
              <div className="font-mono text-xs md:text-sm break-all">{depositAddress}</div>
            </div>

            <div className="pixel-border bg-muted/30 p-3 md:p-4">
              <div className="text-xs md:text-sm font-bold pixel-text tracking-wider mb-2">DESTINATION ADDRESS {toToken.symbol}:</div>
              <div className="font-mono text-xs md:text-sm break-all">{destinationAddress}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 md:space-y-4">
                <div className="space-y-1 md:space-y-2">
                  <div className="text-xs font-bold text-muted-foreground pixel-text tracking-wider">ORDER ID</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm md:text-base font-bold">{orderId}</span>
                    <Copy
                      className="h-3 w-3 md:h-4 md:w-4 cursor-pointer"
                      onClick={() => {
                        playClick();
                        copyToClipboard(orderId, "Order ID");
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1 md:space-y-2">
                  <div className="text-xs font-bold text-muted-foreground pixel-text tracking-wider">
                    TIME REMAINING
                  </div>
                  <div className="font-mono text-sm md:text-base font-bold text-orange-500">{formatTime(currentTimeRemaining)}</div>
                </div>

                <div className="space-y-1 md:space-y-2">
                  <div className="text-xs font-bold text-muted-foreground pixel-text tracking-wider">CREATION TIME</div>
                  <div className="font-mono text-sm md:text-base font-bold">08/30/24</div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 pixel-border bg-white p-2 flex items-center justify-center">
                  <QRCodeComponent 
                    data={generateQRData()}
                    size={128}
                    className="w-full h-full cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="text-center text-xs font-mono text-muted-foreground bg-muted/30 p-2 rounded-md">SCAN QR CODE TO PROCEED</div>
            
            {/* Demo: Simulate deposit button */}
            {orderStatus === 'pending' && (
              <div className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="pixel-border bg-green-500 hover:bg-green-600 text-white font-bold text-xs pixel-text tracking-wider"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/swap/simulate-deposit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId })
                      })
                      const result = await response.json()
                      if (result.success && result.hasDeposit) {
                        toast({
                          title: "Deposit Detected!",
                          description: "Processing your swap...",
                        })
                      } else {
                        toast({
                          title: "No Deposit",
                          description: "Try again to simulate deposit detection",
                        })
                      }
                    } catch (error) {
                      console.error('Failed to simulate deposit:', error)
                    }
                  }}
                >
                  🧪 SIMULATE DEPOSIT (DEMO)
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          variant="outline" 
          className="pixel-border bg-orange-500 hover:bg-orange-600 text-black font-bold px-6 md:px-8 py-3 md:py-4 pixel-text tracking-wider flex items-center gap-2 success-animation"
          onClick={onSwapAgain}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-base md:text-lg">BACK TO SWAP</span>
        </Button>
      </div>
    </div>
  )
}