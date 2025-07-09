"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSound } from "@/components/sound-provider"

const tokens = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿", color: "bg-orange-500", network: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ", color: "bg-purple-500", network: "Ethereum" },
  { symbol: "USDT", name: "Tether", icon: "₮", color: "bg-green-500", network: "Ethereum" },
  { symbol: "USDC", name: "USD Coin", icon: "$", color: "bg-blue-500", network: "Ethereum" },
  { symbol: "BNB", name: "Binance Coin", icon: "B", color: "bg-yellow-500", network: "BSC" },
  { symbol: "MATIC", name: "Polygon", icon: "M", color: "bg-violet-500", network: "Polygon" },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "S",
    color: "bg-gradient-to-r from-purple-500 to-blue-500",
    network: "Solana",
  },
]

interface TokenSelectorProps {
  token: {
    symbol: string
    name: string
    icon: string
    color: string
    network: string
  }
  onSelect: (token: any) => void
  className?: string
}

export function TokenSelector({ token, onSelect, className }: TokenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { playClick } = useSound()

  const filteredTokens = tokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSelect = (token: any) => {
    playClick()
    onSelect(token)
    setSearchQuery("")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <Button
            variant="ghost"
            className={cn("px-2 md:px-4 font-mono flex items-center gap-1 md:gap-2 h-full pixel-border min-h-[44px]", className)}
            onClick={() => playClick()}
          >
            <div
              className={cn("w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-white font-bold text-xs md:text-sm", token.color)}
            >
              {token.icon}
            </div>
            <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] p-4 pixel-border bg-card max-h-[80vh] overflow-auto">
        <div className="flex items-center px-2 pb-4 mb-4 border-b border-border">
          <Search className="mr-2 h-4 w-4 opacity-50" />
          <Input
            placeholder="Search tokens..."
            className="h-8 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 font-mono"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[300px] overflow-auto space-y-2">
          {filteredTokens.map((t) => (
            <DropdownMenuItem
              key={t.symbol}
              className="flex items-center gap-3 cursor-pointer p-3 pixel-border hover:bg-muted/50 min-h-[44px]"
              onClick={() => {
                playClick();
                setTimeout(() => handleSelect(t), 50);
              }}
            >
              <div className={cn("w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-white font-bold text-sm", t.color)}>
                {t.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold font-mono text-sm md:text-base">{t.symbol}</div>
                <div className="text-xs text-muted-foreground">{t.name}</div>
              </div>
              <div className="text-xs bg-muted px-2 py-1 pixel-border font-mono whitespace-nowrap">{t.network}</div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}