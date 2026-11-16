import type { Metadata } from "next";
import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
      <h1 className="sr-only">Administrator sign-in</h1>
      <Suspense>
        <SignIn
          path="/sign-in"
          routing="path"
          forceRedirectUrl="/admin"
          appearance={{
            variables: {
              colorBackground: "var(--card)",
              colorForeground: "var(--foreground)",
              colorMutedForeground: "var(--muted-foreground)",
              colorPrimary: "var(--primary)",
              colorInput: "var(--background)",
              colorInputForeground: "var(--foreground)",
              borderRadius: "var(--radius)",
              fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
            },
            elements: {
              footer: { display: "none" },
              footerAction: { display: "none" },
              cardBox: "shadow-none border border-border",
            },
          }}
        />
      </Suspense>
    </main>
  );
}
