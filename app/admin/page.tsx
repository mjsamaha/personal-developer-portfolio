import { LayoutDashboard } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[2rem] leading-[1.2] font-semibold tracking-[-0.01em]">Dashboard</h1>
      <Card className="max-w-xl">
        <CardHeader>
          <LayoutDashboard className="size-5 text-primary" aria-hidden="true" />
          <CardTitle>No modules yet</CardTitle>
          <CardDescription>
            Content modules will appear here as they are added. For now, this is an empty admin
            shell.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
