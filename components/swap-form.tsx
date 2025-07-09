"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TokenSelector } from "@/components/token-selector"
import { SwapStatus } from "@/components/swap-status"
import { MexcSetup } from "@/components/mexc-setup"
import { RefreshCw, Zap } from "lucide-react"
import { useSound } from "@/components/sound-provider"
import { useToast } from "@/hooks/use-toast"

type SwapState = 'form' | 'processing' | 'waiting'

export function SwapForm() {
  const { playPunch, playClick, playSuccess } = useSound()
  const { toast } = useToast()
  const [swapState, setSwapState] = useState<SwapState>('form')
  const [showMexcSetup, setShowMexcSetup] = useState(false)
  const [mexcConnected, setMexcConnected] = useState(false)
  const [realTimeQuote, setRealTimeQuote] = useState<any>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  
  const [fromToken, setFromToken] = useState({
    symbol: "BTC",
    name: "Bitcoin",
    icon: "₿",
    color: "bg-orange-500",
    network: "Bitcoin",
  })

  const [toToken, setToToken] = useState({
    symbol: "USDT",
    name: "Tether",
    icon: "₮",
    color: "bg-green-500",
    network: "Ethereum",
  })

  const [fromAmount, setFromAmount] = useState("0.01736494")
  const [toAmount, setToAmount] = useState("1000.62")
  const [destinationAddress, setDestinationAddress] = useState("")
  const [isGettingQuote, setIsGettingQuote] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(1200) // 20 minutes in seconds
  const [currentOrder, setCurrentOrder] = useState<any>(null)

  // Auto-initialize MEXC on component mount
  useEffect(() => {
    const initializeMexc = async () => {
      try {
        console.log('Initializing MEXC with credentials...')
        const response = await fetch('/api/swap/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiKey: 'mx0vgl7SvRk6e5CVUS',
            secretKey: 'd755147672ce474a8d7ac81c7c01c82d'
          })
        })

        const result = await response.json()
        if (result.success) {
          setMexcConnected(true)
          console.log('MEXC connection successful!')
          toast({
            title: "MEXC Connected!",
            description: "Ready for real cryptocurrency trading.",
          })
        }
      } catch (error) {
        console.error('Auto-initialization failed:', error)
        setMexcConnected(false)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeMexc()
  }, [toast])

  // Timer for waiting state
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (swapState === 'waiting') {
      timer = setInterval(() => {
        setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [swapState])

  // Get real-time quote from MEXC API
  const getRealTimeQuote = useCallback(async () => {
    if (!mexcConnected || !fromAmount || parseFloat(fromAmount || "0") <= 0) {
      console.log('Skipping quote - not connected or invalid amount:', { mexcConnected, fromAmount })
      return
    }

    setIsGettingQuote(true)
    console.log('Getting real-time quote...', { fromToken: fromToken.symbol, toToken: toToken.symbol, fromAmount })
    
    try {
      const response = await fetch('/api/swap/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          amount: fromAmount
        })
      })

      const result = await response.json()
      console.log('Quote response:', result)
      
      if (result.success) {
        setRealTimeQuote(result.quote)
        setToAmount(result.quote.toAmount)
        console.log('Quote updated successfully')
      } else {
        console.error('Quote API error:', result.error)
        toast({
          title: "Quote Error",
          description: result.error || "Failed to get quote",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to get quote:', error)
      toast({
        title: "Connection Error", 
        description: "Failed to connect to quote service",
        variant: "destructive"
      })
    } finally {
      setIsGettingQuote(false)
    }
  }, [mexcConnected, fromAmount, fromToken.symbol, toToken.symbol])

  // Get quote when amount or tokens change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      getRealTimeQuote()
    }, 500) // Debounce API calls
    
    return () => clearTimeout(timeoutId)
  }, [getRealTimeQuote])

  const handleSwapTokens = () => {
    playClick()
    const temp = fromToken
    setTimeout(() => {
      setFromToken(toToken)
      setToToken(temp)

      const tempAmount = fromAmount
      setFromAmount(toAmount)
      setToAmount(tempAmount)
    }, 50)
  }

  const handleGetInstructions = async () => {
    if (!mexcConnected && !isInitializing) {
      setShowMexcSetup(true)
      return
    }

    playPunch()
    setIsLoading(true)
    setSwapState('processing')
    
    try {
      const response = await fetch('/api/swap/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          amount: fromAmount,
          destinationAddress
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setCurrentOrder(result)
        setSwapState('waiting')
        playSuccess()
        toast({
          title: "Swap Order Created!",
          description: `Your ${fromToken.symbol} to ${toToken.symbol} swap order has been created.`,
        })
      } else {
        throw new Error(result.error || 'Swap failed')
      }
    } catch (error) {
      setSwapState('form')
      toast({
        title: "Swap Failed",
        description: error instanceof Error ? error.message : "Failed to execute swap",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMexcSetupComplete = () => {
    setShowMexcSetup(false)
    setMexcConnected(true)
    toast({
      title: "MEXC Connected!",
      description: "You can now perform real cryptocurrency swaps.",
    })
  }

  const handleSwapAgain = () => {
    playClick()
    setSwapState('form')
    setFromAmount("0.01736494")
    setToAmount("1000.62")
    setDestinationAddress("")
    setTimeRemaining(1200)
    setCurrentOrder(null)
  }

  // Show swap status instead of form when not in form state
  if (swapState !== 'form') {
    return (
      <SwapStatus
        state={swapState}
        fromToken={fromToken}
        toToken={toToken}
        fromAmount={fromAmount}
        toAmount={toAmount}
        destinationAddress={destinationAddress}
        depositAddress={currentOrder?.depositAddress || ""}
        orderId={currentOrder?.orderId || ""}
        timeRemaining={timeRemaining}
        onSwapAgain={handleSwapAgain}
      />
    )
  }

  if (showMexcSetup) {
    return <MexcSetup onSetupComplete={handleMexcSetupComplete} />
  }

  return (
    <div className="space-y-4 md:space-y-6 w-full animate-slide-in-up">
      <Card className="pixel-border shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardContent className="p-4 md:p-6 lg:p-8">
          <div className="space-y-4 md:space-y-6 lg:space-y-8">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="from-amount" className="text-xs md:text-sm font-bold tracking-wider pixel-text flex items-center gap-2">
                  YOU SEND
                  {mexcConnected && (
                    <span className="text-green-500 text-xs">
                      ● LIVE
                    </span>
                  )}
                </Label>
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 pixel-border">
                  {fromToken.symbol}
                </span>
              </div>
              <div className="relative">
                <Input
                  id="from-amount"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="pr-14 md:pr-20 font-mono text-sm md:text-lg lg:text-xl h-12 md:h-14 lg:h-16 pixel-border bg-muted/50 text-center"
                  placeholder="0.00000000"
                  inputMode="decimal"
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <TokenSelector token={fromToken} onSelect={setFromToken} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span className="truncate">
                  {realTimeQuote ? `1 ${fromToken.symbol} ≈ ${realTimeQuote.rate} ${toToken.symbol}` : `1 ${fromToken.symbol} ≈ 59,238.917 USDT`}
                </span>
                <span>
                  {realTimeQuote ? `$${(Number.parseFloat(fromAmount || "0") * Number.parseFloat(realTimeQuote.rate)).toFixed(2)}` : `$${(Number.parseFloat(fromAmount || "0") * 59238.917).toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 md:h-12 md:w-12 pixel-border bg-muted hover:bg-orange-500/20 kick-animation"
                onClick={handleSwapTokens}
              >
                <RefreshCw className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
              </Button>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="to-amount" className="text-xs md:text-sm font-bold tracking-wider pixel-text flex items-center gap-2">
                  YOU RECEIVE
                  {isGettingQuote && (
                    <div className="w-3 h-3 border border-orange-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </Label>
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 pixel-border">
                  {toToken.symbol}
                </span>
              </div>
              <div className="relative">
                <Input
                  id="to-amount"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  className="pr-14 md:pr-20 font-mono text-sm md:text-lg lg:text-xl h-12 md:h-14 lg:h-16 pixel-border bg-muted/50 text-center"
                  placeholder="0.00"
                  inputMode="decimal"
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <TokenSelector token={toToken} onSelect={setToToken} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span className="truncate">
                  {realTimeQuote ? `Fee: ${realTimeQuote.fee} ${toToken.symbol}` : "1 USDT ≈ 1.00 USDT"}
                </span>
                <span>
                  ${Number.parseFloat(toAmount || "0").toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <Label htmlFor="destination" className="text-xs md:text-sm font-bold tracking-wider pixel-text">
                DESTINATION
              </Label>
              <div className="relative">
                <Input
                  id="destination"
                  placeholder={`YOUR ${toToken.symbol} ADDRESS`}
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="font-mono h-12 md:h-14 lg:h-16 pixel-border bg-muted/50 text-xs md:text-sm pr-12"
                />
                {destinationAddress && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => {
                      playClick();
                      setDestinationAddress('');
                    }}
                  >
                    <span className="sr-only">Clear</span>
                    ×
                  </Button>
                )}
              </div>
            </div>

            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold h-14 md:h-16 lg:h-16 text-sm md:text-base lg:text-lg pixel-border pixel-text tracking-wider punch-animation"
              onClick={handleGetInstructions}
              disabled={
                !fromAmount || 
                !toAmount || 
                !destinationAddress || 
                isLoading || isGettingQuote || isInitializing}
            >
              {isInitializing ? (
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  CONNECTING TO MEXC...
                </div>
              ) : isLoading ? (
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  PROCESSING...
                </div>
              ) : (
                <div className="flex items-center gap-2 md:gap-3 justify-center">
                  <Zap className="h-5 w-5 md:h-6 md:w-6" />
                  {mexcConnected ? "SWAP NOW (LIVE)" : "CONNECT MEXC TO SWAP"}
                </div>
              )}
            </Button>

            <div className="text-center text-[10px] md:text-xs text-muted-foreground font-mono px-2">
              BY USING THE SITE AND CREATING AN EXCHANGE, YOU AGREE TO THE SWAPLEE'S{" "}
              <span className="text-orange-500 underline cursor-pointer">TERMS OF SERVICE</span> AND{" "}
              <span className="text-orange-500 underline cursor-pointer">PRIVACY POLICY</span>
              {mexcConnected && !isInitializing && (
                <div className="mt-2 text-green-500">
                  ● CONNECTED
                </div>
              )}
              {isInitializing && (
                <div className="mt-2 text-yellow-500">
                  ● CONNECTING TO MEXC...
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}