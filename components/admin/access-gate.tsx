"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { ShieldAlert } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Renders admin content only after the backend confirms the caller is the administrator.
export function AccessGate({ children }: { children: ReactNode }) {
  const access = useQuery(api.access.current);
  const router = useRouter();

  useEffect(() => {
    if (access === "unauthenticated") {
      router.replace("/sign-in");
    }
  }, [access, router]);

  if (access === undefined || access === "unauthenticated") {
    return (
      <div className="flex min-h-svh flex-col gap-4 p-6" role="status" aria-label="Loading">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full max-w-xl" />
      </div>
    );
  }

  if (access === "denied") {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <ShieldAlert className="size-5 text-destructive" aria-hidden="true" />
            <h1 className="text-xl leading-snug font-semibold">Access denied</h1>
            <CardDescription>
              This account is not authorized to use the admin area. Sign out and use an authorized
              account.
            </CardDescription>
            <SignOutButton redirectUrl="/sign-in">
              <Button variant="outline" className="mt-2 h-10 w-fit">
                Sign out
              </Button>
            </SignOutButton>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return <>{children}</>;
}
