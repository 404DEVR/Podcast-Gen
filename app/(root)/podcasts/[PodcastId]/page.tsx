"use client"

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import Image from "next/image";
import React from "react";
import  PodcastDetailPlayer  from "@/components/PodcastsDetailPlayer";
import LoaderSpinner from "@/components/LoaderSpinner";
import PodcastCard from "@/components/PodcastCard";
import EmptyState from "@/components/EmptyState";
import { useUser } from "@clerk/nextjs";

const PodcastDetails = ({
  params: { PodcastId },
}: {
  params: { PodcastId: Id<'podcasts'> };
}) => {
  const podcast = useQuery(api.podcasts.getPodcastById, {
    podcastId: PodcastId,
  });

  const {user} =useUser()

  const SimilarPodcast=useQuery(api.podcasts.getPodcastByGenreType,{podcastId:PodcastId})

  const isOwner =user?.id === podcast?.authorId

  if(!SimilarPodcast || !podcast ) return <LoaderSpinner />
  return (
    <section className="flex-flex-col w-full">
      <header className="mt-9 flex items-center justify-between">
        <h1 className="text-20 font-bold text-white-1">Currently Playing</h1>
        <figure className="flex gap-3">
          <Image
            src="/icons/headphone.svg"
            width={24}
            height={24}
            alt="headphones"
          ></Image>
          <h2 className="text-16 font-bold text-white-1">{podcast?.views}</h2>
        </figure>
      </header>
      <PodcastDetailPlayer 
        isOwner={isOwner}
        podcastId={podcast._id}
        {...podcast}
      />
      <p className="text-white-1 text-16 pb-8 pt-[45px] font-medium mx-md:text-center">
        {podcast?.podcastDescription}
      </p>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-18 font-bold text-white-1">Transcription</h1>
          <p className="text-16 font-medium text-white-1">
            {podcast?.voicePrompt}
          </p>
        </div>
        {podcast?.imagePrompt && (
          <div className="flex flex-col gap-4">
            <h1 className="text-18 font-bold text-white-1">Thumbnail Prompt</h1>
            <p className="text-16 font-medium text-white-1">
              {podcast?.imagePrompt}
            </p>
          </div>
        )}
      </div>
      <section className="mt-8 flex flex-col gap-5">
        <h1 className="text-20 font-bold text-white-1">Similar Podcasts</h1>
        {SimilarPodcast && SimilarPodcast.length > 0 ? (
          <div className="podcast_grid">
            {SimilarPodcast?.map((e) => (
              <PodcastCard
                key={e._id}
                imgUrl={e.imageUrl!}
                title={e.podcastTitle}
                description={e.podcastDescription}
                podcastId={e._id!}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No similar podcasts found"
            buttonLink="/discover"
            buttonText="Discover more Podcasts"
          />
        )}
      </section>
    </section>
  );
};

export default PodcastDetails;
