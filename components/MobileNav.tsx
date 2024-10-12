"use client"

import React from 'react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from 'next/image';
import Link from 'next/link';
import { sidebarLinks } from '@/constants';
import { usePathname, useRouter } from "next/navigation";



const MobileNav = () => {
    const pathName = usePathname();
    const router = useRouter();
  return (
    <section>
      <Sheet>
        <SheetTrigger>
          <Image
            src="/icons/hamburger.svg"
            alt="menu"
            width={30}
            height={30}
            className="cursor-pointer"
          />
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-black-1 ">
          <Link
            href="/"
            className="flex cursor-pointer items-center gap-1 pb-10"
          >
            <Image
              src="/icons/logo.svg"
              alt="/icons/logo.svg"
              width={23}
              height={27}
            />
            <h1 className="text-24 font-extrabold text-white-1 ml-2">
              PodcastGen
            </h1>
          </Link>
          <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto">
            <SheetClose>
              <nav className="flex h-full flex-col gap-6 text-white-1">
                {sidebarLinks.map((e, i) => {
                  const isActive =
                    pathName === e.route || pathName.startsWith(`${router}/`);
                  return (
                    <SheetClose asChild key={e.route}>
                      <Link
                        key={i}
                        href={e.route}
                        className={`flex gap-3 items-venter py-4 max-lg:px-4 justify-start ${isActive && "bg-nav-focus border-r-4 border-orange-1"}`}
                      >
                        <Image src={e.imgURL} alt="" width={24} height={24} />
                        <p>{e.label}</p>
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}

export default MobileNav
