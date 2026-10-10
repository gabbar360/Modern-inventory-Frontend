import "@/index.css";
import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import ReduxProvider from "@/store/Provider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { APP_CONFIG } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${APP_CONFIG.NAME} - ${APP_CONFIG.DESCRIPTION}`,
  description: "Production-grade Next.js + TypeScript ERP & CRM with Redux Toolkit Architecture",
  icons: {
    icon: "/icon.svg",
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans">
        <ReduxProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <AuthProvider>
              <Toaster position="top-right" richColors closeButton />
              {children}
            </AuthProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
