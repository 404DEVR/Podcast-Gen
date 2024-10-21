import Leftsidebar from "@/components/Leftsidebar";
import MobileNav from "@/components/MobileNav";
import RightSidebar from "@/components/RightSidebar";
import Image from "next/image";
import { Toaster } from "@/components/ui/toaster";
import PodcastPlayer from "@/components/PodcastPlayer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex flex-col">
      <main className="relative flex bg-black -3">
        <Leftsidebar />
        <section className="flex min-h-screen flex-1 flex-col px-4 sm:px-14 bg-black-3 md:bg-gradient-to-b from-[#4CAF50] from-80px via-black-1 via-100px to-transparent to-200px">
          <div className="mx-auto flex w-full max-w-5xl flex-col max-sm:px-4 ">
            <div className="flex h-16 items-center justify-between md:hidden">
              <div className="flex gap-2">
                <Image
                  src="/images/logo1.svg"
                  alt="/icons/logo.svg"
                  width={20}
                  height={20}
                />
                <h1 className="text-24 font-extrabold text-white-1">
                  PodcastGen
                </h1>
              </div>

              <MobileNav />
            </div>
            <div className="flex flex-col md:pb-14 my-2">
              <Toaster />
              <div className="z-10">
                <RightSidebar />
              </div>
              <div className="z-0">{children}</div>
            </div>
          </div>
        </section>
      </main>
      <PodcastPlayer />
    </div>
  );
}
