import type { Metadata } from "next";
// import localFont from "next/font/local";
import {Manrope} from 'next/font/google'
import "./globals.css";
import ConvexClerkProvider from "@/provider/ConvexClerkProvider";
import AudioProvider from "@/provider/AudioProvider";

const manrope = Manrope({subsets:['latin']})

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata: Metadata = {
  title: "PodcastGen",
  description: "Generated Your Podacst using AI",
  icons:{
    icon:'/icons/logo.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClerkProvider>
      <html lang="en">
        <AudioProvider>
          <body
            className={`bg-black-3 ${manrope.className}`}
          >
            {children}
          </body>
        </AudioProvider>
      </html>
    </ConvexClerkProvider>
  );
}
