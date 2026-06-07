import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex w-full flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="w-full flex justify-between items-center">
            <h1 className="font-semibold text-lg">Dashboard</h1>
            <div className="flex items-center gap-4">
              {/* Tempat untuk profile/notification nanti */}
            </div>
          </div>
        </header>
        <div className="flex-1 p-6 bg-muted/20">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
