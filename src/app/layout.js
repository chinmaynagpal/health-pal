import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { APP_URL } from "@/lib/config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  axes: ["opsz"],
});

export const metadata = {
  metadataBase: new URL(APP_URL),
  title: "Health Pal — your daily fitness companion",
  description:
    "Snap a photo of your meal. Health Pal detects foods, asks for portion, and logs USDA-accurate calories.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "Health Pal",
    title: "Health Pal — your daily fitness companion",
    description:
      "AI-powered calorie tracking. Photo → items → portion → USDA-accurate kcal.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Health Pal",
    description: "AI-powered calorie tracking.",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2F2F7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 2800,
                style: {
                  borderRadius: "16px",
                  background: "rgba(28,28,30,0.92)",
                  color: "#fff",
                  fontSize: 14,
                  padding: "10px 14px",
                  backdropFilter: "blur(14px)",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
