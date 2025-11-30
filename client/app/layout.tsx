import type { Metadata } from "next";
import './layout.css'
import AppProvider from "./context/AppProvider";

export const metadata: Metadata = {
  title: "AI Playground",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
