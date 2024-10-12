import { GeneratePodcastProps} from "@/types";
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
       url: "https://realistic-text-to-speech.p.rapidapi.com/v3/generate_voice_over_v2",
       headers: {
         "x-rapidapi-key": "f475346e6fmshb04316f6f3ebf43p142298jsnc48503acc2a1", 
         "x-rapidapi-host": "realistic-text-to-speech.p.rapidapi.com",
         "Content-Type": "application/json",
       },
       data: {
         voice_obj: voiceObj,
         json_data: [
           {
             block_index: 0,
             text: text,
           },
         ],
       },
     };
     try {
        const response = await axios.request(options);
        const audioUrl = response.data[0].link;
        const audioresponse = await fetch(audioUrl);
        const imageBlob = await audioresponse.blob();
        return imageBlob;
     } catch {
       toast({
         title:
           "Your submission exceeds the maximum allowed word count of 300 words. Please revise your content to fit within the specified limit. Thank you for your understanding",
       });
       throw new Error("Failed to fetch speech data");
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
      } else {
        const audioBlob = await fetchAudio(voicePrompt);
        const fileName = `podcast-${uuidv4()}.mp3`;
        const file = new File([audioBlob!], fileName, { type: "audio/mpeg" });
        const uploaded = await startUpload([file]);
        const storageId = (uploaded[0].response as Id<"_storage">).storageId;
        setAudioStorageId(storageId);
        const audioUrl = await getAudioUrl({ storageId });
        setAudio(audioUrl!);
        setIsGenerating(false);
        toast({
          title: "Podcast generated successfully",
        });
      }
    } catch{
      toast({
        title: "Error creating a podcast",
        variant: "destructive",
      });
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
          className="input-class font-light focus-visible:ring-offset-orange-1"
          placeholder="Provide text to generate audio"
          rows={5}
          value={props.voicePrompt}
          onChange={(e) => props.setVoicePrompt(e.target.value)}
        />
      </div>
      <div className="mt-5 w-full max-w-[200px]">
        <Button
          type="submit"
          className="text-16 bg-orange-1 py-4 font-bold text-white-1"
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
