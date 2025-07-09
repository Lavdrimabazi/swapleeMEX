"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useSound } from "@/components/sound-provider"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { playClick } = useSound()

  const handleClick = () => {
    playClick()
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => playClick()}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="pixel-border bg-background w-[250px] sm:w-[300px]">
        <nav className="flex flex-col gap-4 mt-8">
          <Button variant="ghost" className="font-mono pixel-text justify-start" asChild onClick={() => {
            playClick()
            handleClick()
          }}>
            <Link href="/">HOME</Link>
          </Button>
          <Button variant="ghost" className="font-mono pixel-text justify-start" asChild onClick={() => {
            playClick()
            handleClick()
          }}>
            <Link href="/how-it-works">HOW IT WORKS</Link>
          </Button>
          <Button variant="ghost" className="font-mono pixel-text justify-start" asChild onClick={() => {
            playClick()
            handleClick()
          }}>
            <Link href="/status">STATUS</Link>
          </Button>
          <Button variant="ghost" className="font-mono pixel-text justify-start" asChild onClick={() => {
            playClick()
            handleClick()
          }}>
            <Link href="/faq">FAQ</Link>
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
