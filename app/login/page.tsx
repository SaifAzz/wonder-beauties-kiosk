"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Phone, Lock } from "lucide-react"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone || !password) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم الهاتف وكلمة المرور",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          password,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        toast({
          title: "فشل تسجيل الدخول",
          description: data.message || "بيانات الاعتماد غير صالحة. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحبًا بعودتك!",
      })

      // Redirect based on user role
      if (data.user.role === "ADMIN") {
        router.push("/admin/dashboard")
      } else {
        router.push("/catalog")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى لاحقًا.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="floating-logos min-h-screen flex items-center justify-center py-10 bg-roseLight">
      <div className="absolute inset-0 logo-bg-pattern"></div>
      <div className="container relative z-10">
        <div className="max-w-md mx-auto">
          <Card className="w-full shadow-xl border-pink border-opacity-20 backdrop-blur-sm bg-white/95">
            <div className="flex justify-center pt-8 pb-2 px-8 relative">
              <div className="rounded-full bg-secondary p-3 overflow-hidden flex items-center justify-center w-52 h-52 shadow-lg">
                <Image
                  src="/wonder2.avif"
                  alt="شعار وندر بيوتيز"
                  width={180}
                  height={180}
                  className="object-contain"
                  priority
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink/10 to-transparent"></div>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-pink">تسجيل الدخول إلى حسابك</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-foreground">رقم الهاتف</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-3 h-4 w-4 text-pink" />
                      <Input
                        id="phone"
                        placeholder="أدخل رقم هاتفك"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pr-10 border-pink border-opacity-30 focus:border-pink focus:ring-pink"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-foreground">كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3 h-4 w-4 text-pink" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="أدخل كلمة المرور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10 border-pink border-opacity-30 focus:border-pink focus:ring-pink"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-pink hover:bg-pinkDark text-white shadow-md" disabled={isLoading}>
                    {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col">
              <p className="text-center text-sm mt-2">
                ليس لديك حساب؟{" "}
                <Link href="/register" className="underline text-pink hover:text-pinkDark font-medium">
                  سجل هنا
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
