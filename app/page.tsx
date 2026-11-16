import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coming soon",
  description: "A personal developer portfolio, coming soon.",
};

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-[2.5rem] leading-[1.1] font-semibold tracking-[-0.01em] md:text-5xl">
        Coming soon
      </h1>
      <p className="max-w-prose text-muted-foreground">
        This portfolio is under construction. Please check back shortly.
      </p>
    </main>
  );
}
