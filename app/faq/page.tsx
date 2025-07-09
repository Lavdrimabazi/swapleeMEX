import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BackgroundGradient } from "@/components/background-gradient"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle, Shield, DollarSign, Clock, AlertTriangle } from "lucide-react"

export default function FAQ() {
  const faqCategories = [
    {
      title: "Getting Started",
      icon: <HelpCircle className="h-5 w-5" />,
      questions: [
        {
          question: "How does Swaplee work?",
          answer:
            "Swaplee is a non-custodial cryptocurrency exchange. You simply select the tokens you want to swap, enter the amount and your destination address, and we provide you with a unique deposit address. Send your crypto to that address and receive your swapped tokens automatically.",
        },
        {
          question: "Do I need to create an account?",
          answer:
            "No! Swaplee requires no registration, no KYC, and no personal information. Just enter your swap details and you're ready to go.",
        },
        {
          question: "Which cryptocurrencies do you support?",
          answer:
            "We support major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), Tether (USDT), USD Coin (USDC), Binance Coin (BNB), Polygon (MATIC), Solana (SOL), and many more.",
        },
      ],
    },
    {
      title: "Security & Trust",
      icon: <Shield className="h-5 w-5" />,
      questions: [
        {
          question: "Is Swaplee safe to use?",
          answer:
            "Yes! Swaplee is completely non-custodial, meaning we never hold your funds. All transactions happen on-chain and are secured by the respective blockchain networks.",
        },
        {
          question: "What happens if something goes wrong?",
          answer:
            "Our smart contracts are audited and battle-tested. In the rare case of an issue, our support team is available 24/7 to help resolve any problems.",
        },
        {
          question: "Do you store my wallet information?",
          answer:
            "No, we don't store any wallet information or private keys. Each swap uses a unique, one-time deposit address that's generated specifically for your transaction.",
        },
      ],
    },
    {
      title: "Fees & Limits",
      icon: <DollarSign className="h-5 w-5" />,
      questions: [
        {
          question: "What are your fees?",
          answer:
            "We charge a flat 0.3% service fee on all swaps. This fee is already included in the exchange rate you see, so there are no hidden costs.",
        },
        {
          question: "Are there any limits?",
          answer:
            "Minimum swap amounts vary by cryptocurrency, typically starting from $10 equivalent. Maximum limits depend on liquidity and are displayed in real-time.",
        },
        {
          question: "Do you charge network fees?",
          answer:
            "Network fees (gas fees) are separate from our service fee and depend on the blockchain network. These fees go directly to miners/validators, not to Swaplee.",
        },
      ],
    },
    {
      title: "Timing & Support",
      icon: <Clock className="h-5 w-5" />,
      questions: [
        {
          question: "How long do swaps take?",
          answer:
            "Most swaps complete within 3-5 minutes after your deposit is confirmed on the blockchain. Complex swaps or network congestion may take longer.",
        },
        {
          question: "What if my swap is taking too long?",
          answer:
            "You can track your swap status using your unique swap ID. If there are any delays, you'll see real-time updates on the status page.",
        },
        {
          question: "How can I contact support?",
          answer:
            "Our support team is available 24/7 through our contact page. We typically respond within 1 hour during business hours.",
        },
      ],
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <BackgroundGradient />
      <Header />
      <main className="flex-1 px-4 py-12 pt-24">
        <div className="container max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4 animate-fade-in">
            <Badge variant="outline" className="mb-4">
              Frequently Asked Questions
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Got{" "}
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Questions?
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about using Swaplee for cryptocurrency swaps.
            </p>
          </div>

          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <Card
                key={category.title}
                className="border-border/50 shadow-lg backdrop-blur-sm bg-background/80 animate-slide-up hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${categoryIndex * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-orange-500">{category.icon}</div>
                    <h2 className="text-2xl font-bold">{category.title}</h2>
                  </div>

                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`${categoryIndex}-${index}`}
                        className="border border-border/50 rounded-lg px-4 hover:bg-muted/20 transition-colors duration-200"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-4">
                          <span className="font-medium">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-background/80 animate-slide-up-delayed">
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-orange-500 flex justify-center">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold">Still have questions?</h3>
              <p className="text-muted-foreground">
                Can't find what you're looking for? Our support team is here to help 24/7.
              </p>
              <div className="pt-4">
                <Badge variant="outline" className="text-orange-500 border-orange-500/50">
                  Contact Support
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
