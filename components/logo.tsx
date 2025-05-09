import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative h-10 w-10 overflow-hidden rounded-full bg-cherry">
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold">WB</div>
      </div>
      <span className="font-bold text-lg text-cherry hidden md:inline-block">Wonder Beauties</span>
    </Link>
  )
}
