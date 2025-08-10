import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import DrawerLayout from "@/components/DrawerLayout";

export const metadata: Metadata = {
  title: "StudioMate - AI-Powered Art Opportunities",
  description: "Connect Australian artists with relevant opportunities and generate tailored applications using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="studiomate-dashboard">
      <body className="antialiased bg-base-100 text-neutral">
        <SessionProvider>
          <DrawerLayout>
            {children}
          </DrawerLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
