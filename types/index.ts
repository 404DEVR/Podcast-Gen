/* eslint-disable no-unused-vars */

import { Dispatch, SetStateAction } from "react";

import { Id } from "@/convex/_generated/dataModel";

export interface EmptyStateProps {
  title: string;
  search?: boolean;
  buttonText?: string;
  buttonLink?: string;
}

export interface TopPodcastersProps {
  _id: Id<"users">;
  _creationTime: number;
  email: string;
  imageUrl: string;
  clerkId: string;
  name: string;
  podcast: {
    podcastTitle: string;
    podcastId: Id<"podcasts">;
  }[];
  totalPodcasts: number;
}

export interface PodcastProps {
  _id: Id<"podcasts">;
  _creationTime: number;
  audioStorageId: Id<"_storage"> | null;
  user: Id<"users">;
  podcastTitle: string;
  podcastDescription: string;
  audioUrl?: string ;
  imageUrl?: string | null;
  imageStorageId: Id<"_storage"> | null;
  author: string;
  authorId: string;
  authorImageUrl: string;
  voicePrompt: string;
  imagePrompt: string | null;
  voiceType?: string|undefined;
  genre?:string,
  audioDuration: number;
  views: number;
}

export interface Voice {
  gender: string; 
  id: number; 
  language_code: string; 
  language_name: string; 
  rank: number; 
  sample_audio_url: string; 
  sample_text: string; 
  status: number;
  type: string; 
  voice_id: string; 
  voice_name: string; 
}

export interface VoicesResponse {
  data: Voice[];
  languages: string[];
}


export interface ProfilePodcastProps {
  podcasts: PodcastProps[];
  listeners: number|undefined;
}

export type VoiceType =
  | "alloy"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "shimmer";

export type PodcastGenre =
  | "True Crime"
  | "Comedy"
  | "Business"
  | "Health & Wellness"
  | "Technology"
  | "Education"
  | "Lifestyle"
  | "Society & Culture"
  | "Arts"
  | "Science"
  | "History"
  | "News"
  | "Personal Journals"
  | "Politics"
  | "Relationships"
  | "Parenting"
  | "Sports"
  | "Music"
  | "Fiction"
  | "Self-Improvement"
  | "Travel";


export interface GeneratePodcastProps {
  voiceObj:Voice;
  voiceType: string;
  language:string;
  setAudio: Dispatch<SetStateAction<string>>;
  audio: string;
  setAudioStorageId: Dispatch<SetStateAction<Id<"_storage"> | null>>;
  voicePrompt: string;
  setVoicePrompt: Dispatch<SetStateAction<string>>;
  setAudioDuration: Dispatch<SetStateAction<number>>;
}

export interface GenerateThumbnailProps {
  setImage: Dispatch<SetStateAction<string>>;
  setImageStorageId: Dispatch<SetStateAction<Id<"_storage"> | null>>;
  image: string;
  imagePrompt: string;
  setImagePrompt: Dispatch<SetStateAction<string>>;
}

export interface LatestPodcastCardProps {
  imgUrl: string;
  title: string;
  duration: string;
  index: number;
  audioUrl: string;
  author: string;
  views: number;
  podcastId: Id<"podcasts">;
}

export interface PodcastDetailPlayerProps {
  audioUrl: string ;
  podcastTitle: string;
  author: string;
  isOwner: boolean;
  imageUrl: string ;
  podcastId: Id<"podcasts">;
  imageStorageId: Id<"_storage">;
  audioStorageId: Id<"_storage">;
  authorImageUrl: string;
  authorId: string;
}

export interface AudioProps {
  title: string;
  audioUrl: string;
  author: string;
  imageUrl: string;
  podcastId: string;
}


export interface AudioContextType {
  audio: AudioProps | undefined;
  setAudio: React.Dispatch<React.SetStateAction<AudioProps | undefined>>;
}

export interface PodcastCardProps {
  imgUrl: string;
  title: string;
  description: string;
  podcastId: Id<"podcasts">;
}

export interface CarouselProps {
  fansLikeDetail: TopPodcastersProps[];
}

export interface ProfileCardProps {
  podcastData: ProfilePodcastProps;
  imageUrl: string;
  userFirstName: string;
}

export type UseDotButtonType = {
  selectedIndex: number;
  scrollSnaps: number[];
  onDotButtonClick: (index: number) => void;
};
