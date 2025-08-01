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
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import GeneratePodcast from "@/components/GeneratePodcast";
import GenerateThumbnail from "@/components/GenerateThumbnail";
import { Loader } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Label } from "@radix-ui/react-label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Voice } from "@/types";
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

// Function to convert locale codes to readable language names using voice data
const getLanguageDisplayName = (locale: string, voicesData: Voice[] = []): string => {
  // Find a voice with this locale to extract the language name from FriendlyName
  const voiceWithLocale = voicesData.find(voice => voice.Locale === locale);
  
  if (voiceWithLocale && voiceWithLocale.FriendlyName) {
    // Extract language and country from FriendlyName
    // Example: "Adri Online (Natural) - Afrikaans (South Africa)" -> "Afrikaans (South Africa)"
    const match = voiceWithLocale.FriendlyName.match(/- (.+)$/);
    if (match) {
      return match[1];
    }
  }
  
  // Fallback to locale code if no match found
  return locale;
};

const CreatePodcast = () => {
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
    try {
      setIsSubmitting(true)
      if (!audioUrl || !imageUrl || !genre || !voiceType) {
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
        title: "Podcast Created"
      })
      setIsSubmitting(false)
      router.push("/")
    } catch {
      toast({
        title: "Error",
        variant: 'destructive'
      })
      setIsSubmitting(false)
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePrompt, setImagePrompt] = useState("")
  const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [audioUrl, setAudioUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [audioDuration, setAudioDuration] = useState(0)
  const [voicePrompt, setVoicePrompt] = useState("");
  const [voiceType, setVoiceType] = useState("");
  const [voiceLanguage, setVoiceLanguage] = useState("");

  const [genre, setgenre] = useState("");
  const [filteredVoices, setFilteredVoices] = useState<Voice[]>([]);
  const [voiceObj, setVoiceObj] = useState<Voice>();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageSearchValue, setLanguageSearchValue] = useState("");

  const handlevoiceChange = (value: string) => {
    setVoiceType(value);
    const selectedVoice = filteredVoices.find(
      (voice) => voice.ShortName === value
    );
    setVoiceObj(selectedVoice!);
  };

  useEffect(() => {
    const storedVoices = localStorage.getItem("rapidapi-voices");

    if (storedVoices) {
      const parsedVoices = JSON.parse(storedVoices);
      setVoices(parsedVoices);
      // Extract unique languages from voices
      const uniqueLanguages: string[] = Array.from(new Set(parsedVoices.map((voice: Voice) => voice.Locale)));
      setLanguages(uniqueLanguages);
    } else {
      const fetchVoices = async () => {
        try {
          const response = await axios.get(
            "https://realistic-text-to-speech-tts-api.p.rapidapi.com/tts/voices",
            {
              headers: {
                'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_TEXT_KEY,
                'x-rapidapi-host': 'realistic-text-to-speech-tts-api.p.rapidapi.com'
              },
            }
          );
          setVoices(response.data);
          // Extract unique languages from voices
          const uniqueLanguages: string[] = Array.from(new Set(response.data.map((voice: Voice) => voice.Locale)));
          setLanguages(uniqueLanguages);
          localStorage.setItem("rapidapi-voices", JSON.stringify(response.data));
        } catch (error) {
          console.error("Error fetching voices", error);
        }
      };
      fetchVoices();
    }
  }, []);


  useEffect(() => {
    if (voiceLanguage) {
      const voicesForLanguage = voices.filter(
        (voice) => voice.Locale === voiceLanguage
      );
      setFilteredVoices(voicesForLanguage);
    } else {
      setFilteredVoices([]);
    }
  }, [voiceLanguage, voices]);


  return (
    <section className="mt-8 flex flex-col">
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
                      className="input-class focus-visible:ring-offset-[#4CAF50]"
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
              <Popover open={languageOpen} onOpenChange={setLanguageOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={languageOpen}
                    className="text-16 w-full justify-between border-none bg-black-1 text-gray-1 hover:bg-black-1 focus-visible:ring-offset-[#4CAF50]"
                  >
                    {voiceLanguage
                      ? getLanguageDisplayName(voiceLanguage, voices)
                      : "Select AI Language..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 border-none bg-black-1">
                  <Command className="bg-black-1">
                    <CommandInput
                      placeholder="Search languages..."
                      className="text-white-1 border-none bg-black-1"
                      value={languageSearchValue}
                      onValueChange={setLanguageSearchValue}
                    />
                    <CommandEmpty className="text-white-1 py-6 text-center text-sm">
                      No language found.
                    </CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {languages
                        .filter((locale) =>
                          getLanguageDisplayName(locale, voices)
                            .toLowerCase()
                            .includes(languageSearchValue.toLowerCase())
                        )
                        .map((locale) => (
                          <CommandItem
                            key={locale}
                            value={locale}
                            onSelect={(currentValue) => {
                              setVoiceLanguage(currentValue === voiceLanguage ? "" : currentValue);
                              setLanguageOpen(false);
                              setLanguageSearchValue("");
                            }}
                            className="text-white-1 hover:bg-[#4CAF50] cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                voiceLanguage === locale ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {getLanguageDisplayName(locale, voices)}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-[2.5]">
              <Label className="text-16 font-bold text-white-1 pb-3">
                Select Voice
              </Label>
              <Select onValueChange={(value) => handlevoiceChange(value)}>
                <SelectTrigger
                  className={`text-16 w-full border-none bg-black-1 text-gray-1 focus-visible:ring-offset-[#4CAF50]`}
                >
                  <SelectValue
                    placeholder="Select Ai Voice"
                    className="placeholder:text-gray-1"
                  />
                </SelectTrigger>
                <SelectContent className="text-16 border-none bg-black-1 font-bold text-white focus:ring-[#4CAF50] text-white-1">
                  {filteredVoices.map((e, i) => (
                    <SelectItem
                      key={i}
                      value={e.ShortName}
                      className="capitalize focus:bg-[#4CAF50]"
                    >
                      {e.FriendlyName}
                    </SelectItem>
                  ))}
                </SelectContent>

              </Select>
              <p className="text-white-1 text-sm mt-2">
                Please Select Language first to select the Voice
              </p>
            </div>

            <div className="flex flex-col gap-[2.5]">
              <Label className="text-16 font-bold text-white-1 pb-3">
                Select Genre
              </Label>
              <Select onValueChange={(value) => setgenre(value)}>
                <SelectTrigger
                  className={`text-16 w-full border-none bg-black-1 text-gray-1 focus-visible:ring-offset-[#4CAF50]`}
                >
                  <SelectValue
                    placeholder="Select Genre"
                    className="placeholder:text-gray-1"
                  />
                </SelectTrigger>
                <SelectContent className="text-16 border-none bg-black-1 font-bold text-white focus:ring-[#4CAF50] text-white-1">
                  {podcastGenres.map((e, i) => (
                    <SelectItem
                      key={i}
                      value={e}
                      className="capitalize focus:bg-[#4CAF50]"
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
                      className="input-class focus-visible:ring-offset-[#4CAF50]"
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
                className="text-16 w-full bg-[#4CAF50] py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1"
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