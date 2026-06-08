import { DashboardSidebar } from "@/components/dashboard/sidebar/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <div className="flex flex-col h-screen overflow-hidden">
            {/* Mobile Header with Hamburger Menu */}
            <header className="flex h-14 items-center gap-4 border-b border-white/20 dark:border-white/10 bg-background/60 dark:bg-background/40 backdrop-blur-xl px-4 md:hidden z-50 sticky top-0">
              <SidebarTrigger />
              <div className="font-semibold text-lg tracking-tight">UltraFit WMS</div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-transparent">
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
