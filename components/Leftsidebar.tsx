"use client"

import Image from 'next/image'
import Link from 'next/link'
import {sidebarLinks} from "@/constants/index"
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut, useClerk } from '@clerk/nextjs'
import { Button } from './ui/button'
import { useAudio } from '@/provider/AudioProvider'

const Leftsidebar = () => {
    const pathName=usePathname();
    const router=useRouter()
    const {signOut} = useClerk()
    const {audio} =useAudio() 
  return (
    <section
      className={`left_sidebar ${audio?.audioUrl ? "h-[calc(100vh-140px)]" : "h-[calc(100vh-5px)]"}`}
    >
      <nav className="flex flex-col gap-6 h-full">
        <Link href="/" className="flex cursor-pointer items-center gap-1 pb-10">
          <Image
            src="/icons/logo.svg"
            alt="/icons/logo.svg"
            width={23}
            height={27}
          />
          <h1 className="text-24 font-extrabold text-white-1 ml-2 max-lg:hidden">
            PodcastGen
          </h1>
        </Link>
        {sidebarLinks.map((e, i) => {
          const isActive =
            pathName === e.route || pathName.startsWith(`${router}/`);
          return (
            <Link
              key={i}
              href={e.route}
              className={`flex gap-3 items-venter py-4 max-lg:px-4 justify-start ${isActive && "bg-nav-focus border-r-4 border-orange-1"}`}
            >
              <Image src={e.imgURL} alt="" width={24} height={24} />
              <p>{e.label}</p>
            </Link>
          );
        })}
      </nav>
      <SignedOut>
        <div className="flex-center w-full pb-14 max-lg:px-4 lg:pr-8">
          <Button asChild className="text-16 w-full bg-orange-1 font-extrabold">
            <Link href="/sign-in">SIgn In</Link>
          </Button>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex-center w-full pb-14 max-lg:px-4 lg:pr-8">
          <Button
            className="text-16 w-full bg-orange-1 font-extrabold"
            onClick={() => signOut(() => router.push("/"))}
          >
            Log Out
          </Button>
        </div>
      </SignedIn>
    </section>
  );
}

export default Leftsidebar
