import type { Metadata } from "next";
import ClickSpark from "@/components/ClickSpark";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ichiro Rewah — Developer Portfolio",
  description: "A personal space for Ichiro Rewah's work, experiments, and ideas on the web.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ClickSpark sparkColor="#faf9fc" sparkSize={10} sparkRadius={18} sparkCount={8} duration={400}>
          {children}
        </ClickSpark>
      </body>
    </html>
  );
}
