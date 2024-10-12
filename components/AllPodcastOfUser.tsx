import { ProfilePodcastProps } from '@/types';
import React from 'react'
import PodcastCard from './PodcastCard';
import EmptyState from './EmptyState';

const AllPodcastOfUser = ({ podcasts }: ProfilePodcastProps) => {
  return (
    <div className="flex flex-col gap-9">
      <div className="flex flex-col gap-9">
        <h1 className="text-20 font-bold text-white-1">All Podcasts</h1>
        {podcasts ? (
          <div className="podcast_grid">
            {podcasts?.map((e) => (
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
          <EmptyState title='You have not created yet' buttonLink='/create-podcast' buttonText='create podcast'/>
        )}
      </div>
    </div>
  );
};

export default AllPodcastOfUser
