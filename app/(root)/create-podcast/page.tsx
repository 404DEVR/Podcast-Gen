"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SetStateAction, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import GeneratePodcast from "@/components/GeneratePodcast";
import GenerateThumbnail from "@/components/GenerateThumbnail";
import {  Loader } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Label } from "@radix-ui/react-label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Voice, VoicesResponse} from "@/types";
import axios from "axios";

const podcastGenres = [
  "true crime",
  "comedy",
  "news",
  "business",
  "technology",
  "health",
  "education",
  "history",
  "science",
  "sports",
  "personal development",
  "fiction",
  "self-help",
  "music",
  "parenting",
  "relationships",
  "politics",
  "travel",
  "culture",
  "interviews",
];


const formSchema = z.object({
  podcastTitle: z.string().min(2),
  podcastDescription: z.string().min(2),
});

const CreatePodcast=()=> {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      podcastTitle: "",
      podcastDescription: "",
    },
  });
  const router = useRouter()
  const CreatePodcast = useMutation(api.podcasts.createPodcast);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try{
      setIsSubmitting(true)
      if(!audioUrl || !imageUrl || !genre || !voiceType){
        toast({
          title: "Please generate Audio and Image",
          variant: "destructive",
        });
        setIsSubmitting(false)
        throw new Error('Please Generate Audio and Image')
      }

      await CreatePodcast({
        podcastTitle: data.podcastTitle,
        podcastDescription: data.podcastDescription,
        audioUrl,
        imageUrl,
        voicePrompt,
        imagePrompt,
        voiceType,
        genre,
        views: 0,
        audioDuration,
        audioStorageId: audioStorageId,
        imageStorageId: imageStorageId,
      });
      toast({
        title:"Podcast Created"
      })
      setIsSubmitting(false)
      router.push("/")
    }catch{
      toast({
        title:"Error",
        variant:'destructive'
      })
      setIsSubmitting(false)
    }
  }
  
  const [isSubmitting,setIsSubmitting]=useState(false)
  const [imagePrompt,setImagePrompt]=useState("")
  const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [audioUrl,setAudioUrl]=useState("")
  const [imageUrl,setImageUrl]=useState("")
  const [audioDuration,setAudioDuration]=useState(0)
  const [voicePrompt, setVoicePrompt] = useState("");
  const [voiceType, setVoiceType] = useState("");
  const [voiceLanguage, setVoiceLanguage] = useState("");
  const [playingAudio, setPlayingAudio] = useState("");
  const [genre, setgenre] = useState("");
  const [filteredVoices, setFilteredVoices] = useState<Voice[]>([]);
  const [voiceObj, setVoiceObj] = useState<Voice>();
  const [voices, setVoices] = useState<VoicesResponse>({
    data: [],
    languages: [],
  });
  const handlevoiceChange = (value: string) => {
    setVoiceType(value);
    const selectedVoice = filteredVoices.find(
      (voice) => voice.voice_name === value
    );
    setVoiceObj(selectedVoice!);
    if (selectedVoice) {
      setPlayingAudio(selectedVoice.sample_audio_url);
      const audio = new Audio(selectedVoice.sample_audio_url);
      audio.play();
    }
  };
  useEffect(() => {
    const storedVoices = localStorage.getItem("voices");

    if (storedVoices) {
      setVoices(JSON.parse(storedVoices));
    } else {
      const fetchVoices = async () => {
        try {
          const response = await axios.get<SetStateAction<VoicesResponse>>(
            "https://realistic-text-to-speech.p.rapidapi.com/v3/get_all_v2_voices",
            {
              headers: {
                "x-rapidapi-key":
                  "f475346e6fmshb04316f6f3ebf43p142298jsnc48503acc2a1",
                "x-rapidapi-host": "realistic-text-to-speech.p.rapidapi.com",
              },
            }
          );
          setVoices(response.data);
          localStorage.setItem("voices", JSON.stringify(response.data)); // Store in localStorage
        } catch (error) {
          console.error("Error fetching voices", error);
        }
      };

      fetchVoices();
    }
  }, []);
  

  useEffect(() => {
    if (voiceLanguage) {
      const voicesForLanguage = voices.data.filter(
        (voice) => voice.language_name === voiceLanguage
      );
      setFilteredVoices(voicesForLanguage);
    } else {
      setFilteredVoices([]);
    }
  }, [voiceLanguage, voices.data]);
  return (
    <section className="mt-10 flex flex-col">
      <h1 className="text-20 font-bold text-white-1">Create Podcast</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-12 flex w-full flex-col"
        >
          <div className="flex flex-col gap-[30px] border-b border-black-5 pb-10">
            <FormField
              control={form.control}
              name="podcastTitle"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">
                    Podcast Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Add Podcast title"
                      {...field}
                      className="input-class focus-visible:ring-offset-orange-1"
                    />
                  </FormControl>
                  <FormMessage className="text-white-1 " />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-[2.5]">
              <Label className="text-16 font-bold text-white-1 pb-3">
                Select Language
              </Label>
              <Select onValueChange={(value) => setVoiceLanguage(value)}>
                <SelectTrigger
                  className={`text-16 w-full border-none bg-black-1 text-gray-1 focus-visible:ring-offset-orange-1`}
                >
                  <SelectValue
                    placeholder="Select Ai Language"
                    className="placeholder:text-gray-1"
                  />
                </SelectTrigger>
                <SelectContent className="text-16 border-none bg-black-1 font-bold text-white focus:ring-orange-1 text-white-1">
                  {Array.from(
                    new Set(voices.data.map((e) => e.language_name))
                  ).map((e, i) => (
                    <SelectItem
                      key={i}
                      value={e}
                      className="capitalize focus:bg-orange-1"
                    >
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-[2.5]">
              <Label className="text-16 font-bold text-white-1 pb-3">
                Select Voice
              </Label>
              <Select onValueChange={(value) => handlevoiceChange(value)}>
                <SelectTrigger
                  className={`text-16 w-full border-none bg-black-1 text-gray-1 focus-visible:ring-offset-orange-1`}
                >
                  <SelectValue
                    placeholder="Select Ai Voice"
                    className="placeholder:text-gray-1"
                  />
                </SelectTrigger>
                <SelectContent className="text-16 border-none bg-black-1 font-bold text-white focus:ring-orange-1 text-white-1">
                  {filteredVoices.map((e, i) => (
                    <SelectItem
                      key={i}
                      value={e.voice_name}
                      className="capitalize focus:bg-orange-1"
                    >
                      {e.voice_name}
                    </SelectItem>
                  ))}
                </SelectContent>
                {playingAudio && (
                  <audio src={playingAudio} autoPlay className="hidden"></audio>
                )}
              </Select>
              <p className="text-white-1 text-sm mt-2">Please Select Language first to select the Voice</p>
            </div>

            <div className="flex flex-col gap-[2.5]">
              <Label className="text-16 font-bold text-white-1 pb-3">
                Select Genre
              </Label>
              <Select onValueChange={(value) => setgenre(value)}>
                <SelectTrigger
                  className={`text-16 w-full border-none bg-black-1 text-gray-1 focus-visible:ring-offset-orange-1`}
                >
                  <SelectValue
                    placeholder="Select Genre"
                    className="placeholder:text-gray-1"
                  />
                </SelectTrigger>
                <SelectContent className="text-16 border-none bg-black-1 font-bold text-white focus:ring-orange-1 text-white-1">
                  {podcastGenres.map((e, i) => (
                    <SelectItem
                      key={i}
                      value={e}
                      className="capitalize focus:bg-orange-1"
                    >
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FormField
              control={form.control}
              name="podcastDescription"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a short podcast description"
                      {...field}
                      className="input-class focus-visible:ring-offset-orange-1"
                    />
                  </FormControl>
                  <FormMessage className="text-white-1 " />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-flex-col pt-10 ">
            <GeneratePodcast
              voiceObj={voiceObj!}
              language={voiceLanguage}
              setAudioStorageId={setAudioStorageId}
              setAudio={setAudioUrl}
              voiceType={voiceType!}
              audio={audioUrl}
              voicePrompt={voicePrompt}
              setVoicePrompt={setVoicePrompt}
              setAudioDuration={setAudioDuration}
            />
            <GenerateThumbnail
              setImageStorageId={setImageStorageId}
              setImage={setImageUrl}
              image={imageUrl}
              imagePrompt={imagePrompt}
              setImagePrompt={setImagePrompt}
            />
            <div className="mt-10 w-full ">
              <Button
                type="submit"
                className="text-16 w-full bg-orange-1 py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1"
              >
                {isSubmitting ? (
                  <>
                    Submitting
                    <Loader size={20} className="animate-spin ml-2" />
                  </>
                ) : (
                  <>Submit & Publish Podcast</>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}

export default CreatePodcast;