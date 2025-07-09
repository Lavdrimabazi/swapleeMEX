import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  return (
    <div className="text-center space-y-4 md:space-y-6 mb-6 md:mb-10 w-full px-2 animate-fade-in">
      <Badge variant="outline" className="pixel-border font-mono text-[10px] md:text-xs tracking-wider animate-bounce-subtle">
        NON-CUSTODIAL • NO REGISTRATION • LIGHTNING FAST
      </Badge>
      <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-bold tracking-tight pixel-font leading-tight">
        LIGHTNING{" "}
        <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse-slow">
          CRYPTO
        </span>
        <br />
        EXCHANGE
      </h1>
      <p className="text-xs md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto font-mono leading-relaxed">
        The fastest way to exchange cryptocurrencies without accounts, wallets, or intermediaries.
      </p>
    </div>
  )
}