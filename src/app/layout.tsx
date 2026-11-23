import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Chuan Heng Bee · Hot-Brew Tea Cups",
    template: "%s · Chuan Heng Bee",
  },
  description:
    "Explore Chuan Heng Bee 金兴美 hot-brew tea cups in 3D — Jasmine Green, Peach Oolong, Lemon Green, Lychee Black, Chrysanthemum Pu'er and Red Date Wolfberry. Built-in filter, just add hot water.",
  applicationName: "Chuan Heng Bee",
  openGraph: {
    title: "Chuan Heng Bee · Hot-Brew Tea Cups",
    description: "Six seasonal tea flavours in a cup with a built-in filter. Just add hot water.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#b3261e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
