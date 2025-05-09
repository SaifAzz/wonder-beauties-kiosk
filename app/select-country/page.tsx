"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { motion } from "framer-motion"
import { Utensils } from "lucide-react"

export default function CountrySelection() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if country is already selected
    const country = localStorage.getItem("country")
    if (country) {
      router.push("/login")
    }
  }, [router])

  const selectCountry = (country: string) => {
    localStorage.setItem("country", country)
    router.push("/login")
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen food-pattern flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Wonder Beauties</CardTitle>
          <CardDescription className="text-base">Please select your country to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              className="w-full py-6 text-lg justify-start gap-3 group hover:bg-cherry/10 hover:text-cherry hover:border-cherry"
              onClick={() => selectCountry("iraq")}
            >
              <div className="w-8 h-8 rounded-full bg-cherry/10 flex items-center justify-center group-hover:bg-cherry/20">
                <Utensils className="h-4 w-4 text-cherry" />
              </div>
              Iraq
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              className="w-full py-6 text-lg justify-start gap-3 group hover:bg-cherry/10 hover:text-cherry hover:border-cherry"
              onClick={() => selectCountry("syria")}
            >
              <div className="w-8 h-8 rounded-full bg-cherry/10 flex items-center justify-center group-hover:bg-cherry/20">
                <Utensils className="h-4 w-4 text-cherry" />
              </div>
              Syria
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}
