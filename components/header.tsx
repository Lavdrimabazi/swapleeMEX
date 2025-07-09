import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SwapleeLogo } from "@/components/swaplee-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"

export function Header() {
  return (
    <header className="w-full border-b-2 border-border bg-background/95 backdrop-blur-sm fixed top-0 z-50 shadow-sm">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="h-6 w-24 sm:h-8 sm:w-32 md:h-8 md:w-40 relative">
              <SwapleeLogo width={160} height={32} className="object-contain" />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" className="font-mono pixel-text text-xs" asChild>
            <Link href="/how-it-works">HOW&nbsp;IT&nbsp;WORKS</Link>
          </Button>
          <Button variant="ghost" size="sm" className="font-mono pixel-text text-xs" asChild>
            <Link href="/status">STATUS</Link>
          </Button>
          <Button variant="ghost" size="sm" className="font-mono pixel-text text-xs" asChild>
            <Link href="/faq">FAQ</Link>
          </Button>
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <MobileNav /> 
        </div>
      </div>
    </header>
  )
}