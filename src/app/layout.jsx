import "@/index.css";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

export const metadata = {
  title: "Vegnar ERP & CRM - Enterprise Management System",
  description: "Production-grade MERN Stack Next.js ERP & CRM Application",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <Toaster position="top-right" richColors closeButton />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
