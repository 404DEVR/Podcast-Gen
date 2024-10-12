"use client";

import React from "react";
import PodcastCard from "@/components/PodcastCard";


import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";


const Home = () => {
 const trendingPodcasts = useQuery(api.podcasts.getTrendingPodcasts);
  return (
    <div className="mt-9 flex flex-col gap-9 md:overflow-hidden ">
      <section className="flex flex-col gap-5">
        <h1 className="text-20 font-bold text-white-1">Trending Podcast</h1>
        <div className="podcast_grid">
          {trendingPodcasts?.map((e) => (
            <PodcastCard
              key={e._id}
              imgUrl={e.imageUrl!}
              title={e.podcastTitle}
              description={e.podcastDescription}
              podcastId={e._id!}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
