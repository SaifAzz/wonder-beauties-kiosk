"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Phone, Lock, User, MapPin } from "lucide-react"

export default function RegisterPage() {
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [country, setCountry] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name || !phone || !password || !country) {
            toast({
                title: "خطأ",
                description: "يرجى ملء جميع الحقول",
                variant: "destructive",
            })
            return
        }

        try {
            setIsLoading(true)

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    phone,
                    password,
                    country,
                }),
            })

            const data = await response.json()

            if (!data.success) {
                toast({
                    title: "فشل التسجيل",
                    description: data.message || "تعذر التسجيل. يرجى المحاولة مرة أخرى.",
                    variant: "destructive",
                })
                return
            }

            toast({
                title: "تم التسجيل بنجاح",
                description: "تم إنشاء حسابك.",
            })

            // Redirect to login
            router.push("/login")
        } catch (error) {
            console.error("Registration error:", error)
            toast({
                title: "خطأ",
                description: "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى لاحقًا.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container flex items-center justify-center min-h-screen py-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">إنشاء حساب جديد</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">الاسم الكامل</Label>
                                <div className="relative">
                                    <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder="أدخل اسمك الكامل"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pr-10"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">رقم الهاتف</Label>
                                <div className="relative">
                                    <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        placeholder="أدخل رقم هاتفك"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="pr-10"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">كلمة المرور</Label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="أنشئ كلمة مرور"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pr-10"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="country">البلد</Label>
                                <div className="relative">
                                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                                    <Select value={country} onValueChange={setCountry}>
                                        <SelectTrigger className="pr-10">
                                            <SelectValue placeholder="اختر بلدك" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Iraq">العراق</SelectItem>
                                            <SelectItem value="Syria">سوريا</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "جاري إنشاء الحساب..." : "تسجيل"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col">
                    <p className="text-center text-sm mt-2">
                        لديك حساب بالفعل؟{" "}
                        <Link href="/login" className="underline text-primary">
                            تسجيل الدخول هنا
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
} 