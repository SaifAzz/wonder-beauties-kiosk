export function Logo() {
  return (
    <>
      <div className="relative h-10 w-10 overflow-hidden rounded-full bg-cherry">
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
          <img src="/wonder2.avif" alt="Wonder Beauties Logo" className="object-contain w-8 h-8" />
        </div>
      </div>
      <span className="font-bold text-lg text-cherry hidden md:inline-block">Wonder Beauties</span>
    </>
  )
}
