import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BackgroundGradient } from "@/components/background-gradient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react"

export default function Status() {
  const systemStatus = [
    { service: "Swap Engine", status: "operational", uptime: "99.9%" },
    { service: "Bitcoin Network", status: "operational", uptime: "100%" },
    { service: "Ethereum Network", status: "operational", uptime: "99.8%" },
    { service: "API Services", status: "operational", uptime: "99.9%" },
    { service: "Database", status: "operational", uptime: "100%" },
  ]

  const recentSwaps = [
    { id: "XPDKE", from: "BTC", to: "USDT", amount: "0.017", status: "completed", time: "2 min ago" },
    { id: "MKLP9", from: "ETH", to: "USDC", amount: "2.5", status: "processing", time: "5 min ago" },
    { id: "QWER7", from: "USDT", to: "BTC", amount: "1000", status: "completed", time: "8 min ago" },
    { id: "ASDF3", from: "BNB", to: "ETH", amount: "5.2", status: "completed", time: "12 min ago" },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
      case "completed":
        return "bg-green-500/20 text-green-500 border-green-500/50"
      case "processing":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
      default:
        return "bg-red-500/20 text-red-500 border-red-500/50"
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <BackgroundGradient />
      <Header />
      <main className="flex-1 px-4 py-12 pt-24">
        <div className="container max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <Badge variant="outline" className="mb-4">
              System Status
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              All Systems{" "}
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                Operational
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Real-time status of Swaplee services and recent swap activity.
            </p>
          </div>

          <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-background/80 animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Track Your Swap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input placeholder="Enter your swap ID (e.g., XPDKE)" className="font-mono" />
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-background/80 animate-slide-up">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemStatus.map((service, index) => (
                  <div
                    key={service.service}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <span className="font-medium">{service.service}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{service.uptime}</span>
                      <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-background/80 animate-slide-up-delayed">
              <CardHeader>
                <CardTitle>Recent Swaps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentSwaps.map((swap, index) => (
                  <div
                    key={swap.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{swap.id}</span>
                        {getStatusIcon(swap.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {swap.amount} {swap.from} → {swap.to}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(swap.status)}>{swap.status}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">{swap.time}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-background/80 animate-slide-up-delayed">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-green-500 animate-counter">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-500 animate-counter">1,247</div>
                  <div className="text-sm text-muted-foreground">Swaps Today</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-orange-500 animate-counter">3.2s</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
