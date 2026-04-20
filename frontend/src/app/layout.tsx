import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "MedChain-FL | Privacy-Preserving AI for Indian Healthcare",
  description:
    "A Data-Collaboration-as-a-Service platform enabling privacy-preserving AI for Indian Healthcare via Federated Learning. Detect Thalassemia and chronic diseases without exposing patient data.",
  keywords: ["federated learning", "healthcare AI", "thalassemia", "privacy", "India", "medical AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
