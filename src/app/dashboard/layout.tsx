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

        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div
            className="absolute -top-[15%] -left-[10%] h-[55%] w-[55%] rounded-full opacity-25 blur-[100px]"
            style={{
              background:
                "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-[8%] right-[-5%] h-[50%] w-[50%] rounded-full opacity-20 blur-[110px]"
            style={{
              background:
                "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-[-8%] left-[35%] h-[55%] w-[55%] rounded-full opacity-[0.18] blur-[110px]"
            style={{
              background:
                "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            }}
          />
        </div>

        <DashboardSidebar />
        <SidebarInset className="h-screen overflow-hidden">
            <header className="flex h-14 items-center gap-4 border-b border-white/20 dark:border-white/10 bg-background/60 dark:bg-background/40 backdrop-blur-xl px-4 md:hidden z-50">
              <SidebarTrigger />
              <div className="font-semibold text-lg tracking-tight">Cilupbah</div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
