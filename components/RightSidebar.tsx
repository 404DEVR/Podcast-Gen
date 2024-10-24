"use client"

import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import Link from 'next/link';
import Image from "next/image";
import React, { useState } from 'react'
import Carousel from "./Carousel";
import Header from "./Header";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import LoaderSpinner from "./LoaderSpinner";
import { Button } from "./ui/button";

const RightSidebar = () => {
  const { user } = useUser()
  const topPodcasters = useQuery(api.users.getTopUserByPodcastCount);
  const router=useRouter()
  const [isPressed,setIsPressed]=useState(false);
  if (!topPodcasters) return <LoaderSpinner />;

  return (
    <div className="relative flex justify-end top-5 gap-4 max-md:hidden ">
      <div className="relative">
        <Button onClick={() => setIsPressed(!isPressed)} className="z-10">
          Find Podcast creaters
        </Button>
        {isPressed && (
          <section
            className={`right_sidebar text-white-1 h-[calc(100vh-100px)] top-0 right-44`}
          >
            <div>
              <section>
                <Header headerTitle=" Fans Like You" />
                <Carousel fansLikeDetail={topPodcasters!} />
              </section>
              <section className="flex flex-col gap-8 pt-6">
                <Header
                  headerTitle="Top Podcasters"
                  headerClassname=""
                ></Header>
                <div className="flex flex-col gap-6 mb-4">
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
            </div>
          </section>
        )}
      </div>
      <SignedIn>
        <Button className="right-5 top-5 rounded-lg gap-2">
          <Link href={`/profile/${user?.id}`} className="flex gap-2">
            <UserButton />
            <div className="flex w-full items-center justify-between">
              <h1 className="text-16 truncate font-semibold text-white-1">
                {user?.firstName} {user?.lastName}
              </h1>
            </div>
          </Link>
        </Button>
      </SignedIn>
    </div>
  );
}

export default RightSidebar