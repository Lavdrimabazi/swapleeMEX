import { Header } from "@/components/header"
import { SwapForm } from "@/components/swap-form"
import { Footer } from "@/components/footer"
import { BackgroundGradient } from "@/components/background-gradient"
import { HeroSection } from "@/components/hero-section"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <BackgroundGradient />
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 py-8 pt-20 md:pt-24">
        <HeroSection />
        <div className="w-full max-w-[95%] sm:max-w-md lg:max-w-lg">
          <SwapForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}