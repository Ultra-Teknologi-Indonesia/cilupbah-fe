import { DashboardSidebar } from "@/components/dashboard/sidebar/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
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
          {/* Header/Navbar can go here later */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  );
}
