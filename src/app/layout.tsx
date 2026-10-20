import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { RootLayoutProps } from "./layout.types";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "نوبت | مدیریت رزرو",
  description: "داشبورد فارسی و راست‌به‌چپ مدیریت رزرو نوبت",
};

export default function RootLayout(props: RootLayoutProps) {
  const { children } = props;

  return (
    <html lang="fa" dir="rtl" className={cn("font-sans", vazirmatn.variable)}>
      <body>
        <TooltipProvider>
          {children}
          <Toaster richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
