import { GeneratePodcastProps } from "@/types";
import React, { useState } from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { useUploadFiles } from "@xixixao/uploadstuff/react";
import axios from "axios";
import { Id } from "@/convex/_generated/dataModel";

const useGeneratePodcast = ({
  setAudio,
  voicePrompt,
  setAudioStorageId,
  voiceType,
  language,
  voiceObj
}: GeneratePodcastProps) => {

  const fetchAudio = async (text: string) => {
    const options = {
      method: "POST",
      url: "https://realistic-text-to-speech-tts-api.p.rapidapi.com/tts",
      headers: {
        "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_TEXT_KEY || "",
        "x-rapidapi-host": "realistic-text-to-speech-tts-api.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      data: {
        text: text,
        voice: voiceObj.ShortName,
        rate: '+0%',
        pitch: '+0Hz',
        volume: '+0%'
      },
    };
    try {
      const response = await axios.request(options);

      // Handle different response formats
      let audioUrl: string;
      if (typeof response.data === 'string') {
        audioUrl = response.data;
      } else if (response.data && response.data.url) {
        audioUrl = response.data.url;
      } else if (response.data && response.data.audio_url) {
        audioUrl = response.data.audio_url;
      } else {
        throw new Error("Invalid response format from TTS API");
      }

      // If the URL is relative, make it absolute
      if (audioUrl.startsWith('/')) {
        audioUrl = `https://realistic-text-to-speech-tts-api.p.rapidapi.com${audioUrl}`;
      }

      const audioresponse = await fetch(audioUrl, {
        headers: {
          "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_TEXT_KEY || "",
          "x-rapidapi-host": "realistic-text-to-speech-tts-api.p.rapidapi.com",
        },
      });
      if (!audioresponse.ok) {
        throw new Error(`Failed to fetch audio: ${audioresponse.status}`);
      }
      const audioBlob = await audioresponse.blob();
      return audioBlob;
    } catch (error: unknown) {
      // Handle specific API errors with user-friendly messages
      const axiosError = error as { response?: { status: number; data?: { detail?: string } } };
      if (axiosError.response?.status === 413) {
        const errorDetail = axiosError.response?.data?.detail || "Text is too long for your current plan.";
        toast({
          title: "Text Too Long",
          description: errorDetail.includes("1000 characters")
            ? "Your text exceeds the 1000 character limit for the BASIC plan. Please shorten your transcript and try again."
            : errorDetail,
          variant: "destructive",
        });
      } else if (axiosError.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "There's an issue with the API authentication. Please try again later.",
          variant: "destructive",
        });
      } else if (axiosError.response?.status === 429) {
        toast({
          title: "Rate Limit Exceeded",
          description: "You've made too many requests. Please wait a moment and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Audio Generation Failed",
          description: "Unable to generate audio. Please check your text and try again.",
          variant: "destructive",
        });
      }
      throw error; // Re-throw to be caught by the outer try-catch
    }
  };
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl);

  const getAudioUrl = useMutation(api.podcasts.getUrl);

  const generatePodcast = async () => {
    setIsGenerating(true);
    setAudio("");
    if (!voicePrompt) {
      toast({
        title: "Please provide a voiceType to generate a podcast",
      });
      return setIsGenerating(false);
    }

    try {
      if (!voiceType || !language || !voicePrompt) {
        toast({
          title: "Please select language and Ai voice first",
          variant: "destructive",
        });
        setIsGenerating(false);
        return; // Add return to prevent further execution
      } else {
        const audioBlob = await fetchAudio(voicePrompt);
        const fileName = `podcast-${uuidv4()}.mp3`;
        const file = new File([audioBlob!], fileName, { type: "audio/mpeg" });
        const uploaded = await startUpload([file]);

        // Extract storageId properly from the upload response
        const storageId = (uploaded[0].response as { storageId?: string }).storageId || uploaded[0].response as Id<"_storage">;
        setAudioStorageId(storageId);
        const audioUrl = await getAudioUrl({ storageId });
        setAudio(audioUrl!);
        setIsGenerating(false);
        toast({
          title: "Podcast generated successfully",
        });
      }
    } catch (error: unknown) {
      // Only show generic error if it's not a TTS API error (which already shows specific error)
      const axiosError = error as { response?: { status: number } };
      if (!axiosError.response || !axiosError.response.status) {
        toast({
          title: "Error creating a podcast",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
      setIsGenerating(false);
    }
  };

  return { isGenerating, generatePodcast };
};


const GeneratePodcast = (props: GeneratePodcastProps) => {
  const { isGenerating, generatePodcast } = useGeneratePodcast(props);
  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <Label className="text-16 font-bold text-white-1">
          Add Transcript to generate Podcast
        </Label>
        <Textarea
          className="input-class font-light focus-visible:ring-offset-[#4CAF50]"
          placeholder="Provide text to generate audio"
          rows={5}
          value={props.voicePrompt}
          onChange={(e) => props.setVoicePrompt(e.target.value)}
        />
      </div>
      <div className="mt-5 w-full max-w-[200px]">
        <Button
          type="submit"
          className="text-16 bg-[#4CAF50] py-4 font-bold text-white-1"
          onClick={generatePodcast}
        >
          {isGenerating ? (
            <>
              Generating
              <Loader size={20} className="animate-spin ml-2" />
            </>
          ) : (
            "Generate"
          )}
        </Button>
      </div>
      {props.audio && (
        <audio
          controls
          src={props.audio}
          autoPlay
          className="mt-5"
          onLoadedMetadata={(e) =>
            props.setAudioDuration(e.currentTarget.duration)
          }
        />
      )}
    </div>
  );
};

export default GeneratePodcast;
