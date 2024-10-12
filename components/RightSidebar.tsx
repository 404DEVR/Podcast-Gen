"use client"

import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import Link from 'next/link';
import Image from "next/image";
import React from 'react'
import Carousel from "./Carousel";
import Header from "./Header";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import LoaderSpinner from "./LoaderSpinner";
import { useAudio } from "@/provider/AudioProvider";

const RightSidebar = () => {
  const { user } = useUser()
  const topPodcasters = useQuery(api.users.getTopUserByPodcastCount);
  const router=useRouter()
  const {audio} = useAudio()
  if (!topPodcasters) return <LoaderSpinner />;
  return (
    <section className={`right_sidebar text-white-1 ${audio?.audioUrl ? "h-[calc(100vh-140px)]" : "h-[calc(100vh-5px)]"}`}>
      <SignedIn>
        <Link href={`/profile/${user?.id}`} className="flex gap-3 pb-12">
          <UserButton />
          <div className="flex w-full items-center justify-between">
            <h1 className="text-16 truncate font-semibold text-white-1">
              {user?.firstName}
            </h1>
            <Image
              src="/icons/right-arrow.svg"
              alt="arrow"
              width={24}
              height={24}
            />
          </div>
        </Link>
        <section>
          <Header headerTitle=" Fans Like You" />
          <Carousel fansLikeDetail={topPodcasters!} />
        </section>
        <section className="flex flex-col gap-8 pt-12">
          <Header headerTitle="Top Podcasters" headerClassname=""></Header>
          <div className="flex flex-col gap-6 mt-4">
            {topPodcasters?.slice(0, 4).map((item) => (
              <div
                key={item._id}
                className="flex cursor-pointer justify-between"
                onClick={() => router.push(`/profile/${item.clerkId}`)}
              >
                <figure className="flex items-center gap-2">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    className="aspect-square rounded-lg"
                    width={44}
                    height={44}
                  />
                  <h2 className="text-14 font-semibold">{item.name}</h2>
                </figure>
                <div className="flex items-center">
                  <p className="text-12 font-normal">
                    {item.totalPodcasts}{" "}
                    {item.totalPodcasts === 1 ? "podcast" : "podcasts"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </SignedIn>
    </section>
  );
}

export default RightSidebar