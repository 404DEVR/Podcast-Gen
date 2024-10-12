"use client"

// import EmptyState from "@/components/EmptyState";
import LoaderSpinner from "@/components/LoaderSpinner";
import PodcastCard from "@/components/PodcastCard";
import SearchBar from "@/components/SearchBar";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React from "react";

const Discover = ({searchParams:{search}}:{searchParams:{search:string}}) => {
  const podcastData=useQuery(api.podcasts.getPodcastBySearch,{search:search || ''})
  return (
    <div className="flex flex-col gap-9 pt-8 ">
      <SearchBar/>
      <div className="flex flex-col gap-9">
        <h1 className="text-20 font-bold text-white-1">{!search ?'Discover Trending Podcasts':'Search Results for: '} {search && <span className="text-white-2">{search}</span>}</h1>
        {podcastData ? (
          <div className="podcast_grid">
            {podcastData?.map((e) => (
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
          <LoaderSpinner />
        )}
      </div>
    </div>
  );
};

export default Discover;
