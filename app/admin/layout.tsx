import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AccessGate } from "@/components/admin/access-gate";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SessionRedirect } from "@/components/admin/session-redirect";
import { UserMenu } from "@/components/admin/user-menu";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Skeleton className="m-4 h-10 w-48" />}>
      <ConvexClientProvider>
        <SessionRedirect />
        <AccessGate>
          <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
              <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
                <SidebarTrigger className="size-10" aria-label="Toggle sidebar" />
                <Separator orientation="vertical" className="mx-1 h-6" />
                <div className="ml-auto">
                  <UserMenu />
                </div>
              </header>
              <div className="min-w-0 flex-1 p-4 md:p-6">{children}</div>
            </SidebarInset>
          </SidebarProvider>
        </AccessGate>
      </ConvexClientProvider>
    </Suspense>
  );
}
