"use client";

import { useQuery } from "convex/react";
import { CheckCircle2, LayoutDashboard } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const ping = useQuery(api.admin.adminPing);

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
      {ping?.ok ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
          Backend access confirmed for the administrator.
        </p>
      ) : null}
    </div>
  );
}
