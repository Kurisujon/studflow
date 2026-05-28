import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "Studflow — AI Study Workflow",
    template: "%s | Studflow",
  },
  description:
    "Upload a PDF or DOCX and let Studflow generate concise summaries, active-recall flashcards, and quizzes — automatically.",
  keywords: ["study", "AI", "flashcards", "quiz", "PDF", "summarize"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={cn("font-sans", geist.variable)}
        data-theme-color="system"
        suppressHydrationWarning
      >
        <body>
          <ThemeProvider>
            <Navbar />
            <main
              style={{
                minHeight: "calc(100dvh - var(--nav-height))",
                paddingTop: "var(--nav-height)",
              }}
            >
              {children}
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
