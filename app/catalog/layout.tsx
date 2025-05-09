import { SiteHeader } from "@/components/site-header"

export default function CatalogLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <SiteHeader />
            <main>{children}</main>
        </>
    )
} 