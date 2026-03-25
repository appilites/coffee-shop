import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AuthPageShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#181511" }}>
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-10 w-10 shrink-0">
            <Image src="/logo.png" alt="" fill className="object-contain" />
          </div>
          <span className="font-serif font-bold text-foreground text-sm sm:text-base">Druids Nutrition</span>
        </Link>
        <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
          <Link href="/menu">Menu</Link>
        </Button>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-1">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
