import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/session'

export default async function AdminPage() {
    // Protect this route
    await requireAdmin()

    // Redirect to the dashboard
    redirect('/admin/dashboard')
} 