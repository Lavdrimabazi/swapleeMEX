import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t-2 border-border py-3 md:py-6 bg-background/95 backdrop-blur-sm">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-3 md:gap-6 font-mono">
          <Link href="/terms" className="hover:text-orange-500 pixel-text text-[10px] md:text-sm">
            TERMS
          </Link>
          <Link href="/privacy" className="hover:text-orange-500 pixel-text text-[10px] md:text-sm">
            PRIVACY
          </Link>
          <Link href="/contact" className="hover:text-orange-500 pixel-text text-[10px] md:text-sm">
            CONTACT
          </Link>
        </div>
        <div className="text-[10px] md:text-xs font-mono">
          <span className="bg-muted text-muted-foreground px-2 py-1 pixel-border">v0.1.0 BETA</span>
        </div>
      </div>
    </footer>
  )
}
