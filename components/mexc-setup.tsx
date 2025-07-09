"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, ExternalLink, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MexcSetupProps {
  onSetupComplete: () => void
}

export function MexcSetup({ onSetupComplete }: MexcSetupProps) {
  const [apiKey, setApiKey] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [showSecret, setShowSecret] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSetup = async () => {
    if (!apiKey.trim() || !secretKey.trim()) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both API Key and Secret Key",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/swap/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          secretKey: secretKey.trim()
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Setup Complete!",
          description: "MEXC API connected successfully. You can now perform real swaps.",
        })
        onSetupComplete()
      } else {
        throw new Error(result.error || 'Setup failed')
      }
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: error instanceof Error ? error.message : "Failed to connect to MEXC API",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md pixel-border">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center pixel-font">
            <Shield className="h-6 w-6 text-orange-500" />
            MEXC API Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              To enable real cryptocurrency swaps, you need to connect your MEXC API credentials.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey" className="pixel-text text-xs">
                API KEY
              </Label>
              <Input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your MEXC API Key"
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="secretKey" className="pixel-text text-xs">
                SECRET KEY
              </Label>
              <div className="relative">
                <Input
                  id="secretKey"
                  type={showSecret ? "text" : "password"}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter your MEXC Secret Key"
                  className="font-mono pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleSetup}
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold pixel-border"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  CONNECTING...
                </div>
              ) : (
                "CONNECT TO MEXC"
              )}
            </Button>

            <div className="text-center">
              <a
                href="https://www.mexc.com/user/openapi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1 justify-center pixel-text"
              >
                <ExternalLink className="h-3 w-3" />
                GET MEXC API KEYS
              </a>
            </div>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              <strong>Security Note:</strong> Your API keys are only used locally and never stored permanently. 
              Make sure to enable only "Spot Trading\" permissions for your API key.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}