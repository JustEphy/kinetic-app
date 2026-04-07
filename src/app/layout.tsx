import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import ChromeShell from "@/components/ChromeShell";
import DisclaimerModal from "@/components/DisclaimerModal";
import ChatFAB from "@/components/ChatFAB";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkoutProvider } from "@/contexts/WorkoutContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "KINETIC - Engineered for Performance",
  description: "AI-powered workout timer with precision-engineered interval training",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0c0e12",
  viewportFit: "cover", // For iPhone notch/safe area
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark h-full antialiased ${lexend.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-surface font-body">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ThemeProvider>
          <AuthProvider>
            <WorkoutProvider>
              <DisclaimerModal />
              <ChromeShell>
                {children}
              </ChromeShell>
              <ChatFAB />
            </WorkoutProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
