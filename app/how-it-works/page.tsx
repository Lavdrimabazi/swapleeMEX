import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BackgroundGradient } from "@/components/background-gradient"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Zap, Lock, CheckCircle } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Select Tokens",
      description: "Choose what you want to send and what you want to receive from our supported cryptocurrencies.",
      icon: <ArrowRight className="h-6 w-6" />,
    },
    {
      number: "02",
      title: "Enter Details",
      description: "Input the amount you want to swap and your destination wallet address.",
      icon: <Zap className="h-6 w-6" />,
    },
    {
      number: "03",
      title: "Get Instructions",
      description: "Receive a unique deposit address and exact amount to send for your swap.",
      icon: <Lock className="h-6 w-6" />,
    },
    {
      number: "04",
      title: "Send & Receive",
      description: "Send your crypto to the provided address and receive your swapped tokens automatically.",
      icon: <CheckCircle className="h-6 w-6" />,
    },
  ]

  const features = [
    {
      title: "Non-Custodial",
      description: "We never hold your funds. Everything happens on-chain.",
      icon: <Shield className="h-8 w-8" />,
    },
    {
      title: "No Registration",
      description: "No accounts, no KYC, no personal information required.",
      icon: <Lock className="h-8 w-8" />,
    },
    {
      title: "Lightning Fast",
      description: "Most swaps complete within 3-5 minutes.",
      icon: <Zap className="h-8 w-8" />,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <BackgroundGradient />
      <Header />
      <main className="flex-1 px-4 py-12 pt-24">
        <div className="container max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4 animate-fade-in">
            <Badge variant="outline" className="mb-4">
              How It Works
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Simple, Secure,{" "}
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Trustless
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Swap cryptocurrencies without creating accounts, connecting wallets, or trusting intermediaries.
            </p>
          </div>

          <div className="grid gap-8 md:gap-12">
            {steps.map((step, index) => (
              <Card
                key={step.number}
                className="border-border/50 shadow-lg backdrop-blur-sm bg-background/80 animate-slide-up hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl animate-pulse-slow">
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold">{step.title}</h3>
                        <div className="text-orange-500 animate-bounce-subtle">{step.icon}</div>
                      </div>
                      <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 animate-slide-up-delayed">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="border-border/50 shadow-lg backdrop-blur-sm bg-background/80 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="text-orange-500 flex justify-center group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
