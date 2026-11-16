"use client";

import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function UserMenu() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return <Skeleton className="h-10 w-40" />;
  }

  const label = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Administrator";

  return (
    <div className="flex items-center gap-3">
      <UserButton />
      <span className="hidden max-w-48 truncate text-sm text-muted-foreground sm:inline">
        {label}
      </span>
      <SignOutButton redirectUrl="/sign-in">
        <Button variant="outline" className="h-10 px-3">
          <LogOut aria-hidden="true" />
          Sign out
        </Button>
      </SignOutButton>
    </div>
  );
}
