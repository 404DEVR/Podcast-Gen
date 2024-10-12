import React, { useRef, useState } from 'react'
import { Button } from './ui/button';
import { GenerateThumbnailProps } from '@/types';
import { Label } from "./ui/label";
import { Textarea } from './ui/textarea';
import { Loader } from 'lucide-react';
import { Input } from './ui/input';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from 'convex/react';
import { useUploadFiles } from '@xixixao/uploadstuff/react';
import { api } from '@/convex/_generated/api';
import axios from "axios";

import { Id } from "@/convex/_generated/dataModel";

const GenerateThumbnail = ({setImageStorageId,
setImage,
image,
imagePrompt,
setImagePrompt}:GenerateThumbnailProps) => {
  const [isThumbnail,setIsThumbnail]=useState(false)
  const [isImageLoading, setIsImageLoading] = useState(false);
  const imageRef=useRef<HTMLInputElement>(null)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl);
  const getImageUrl = useMutation(api.podcasts.getUrl);
  const handleImageGeneration = async () => {
    setIsImageLoading(true);
    setImage("");
    const options = {
      method: "POST",
      url: "https://open-ai21.p.rapidapi.com/texttoimage2",
      headers: {
        "x-rapidapi-key": "7d47536f0cmsh9e3a6f0a02d3b9dp14dfadjsn4cbb024939d5",
        "x-rapidapi-host": "open-ai21.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      data: { text: imagePrompt },
    };
    const imagewords=imagePrompt.split(" ")

    try {
      if (imagewords.length <= 5) {
        const response = await axios.request(options);
        const imageUrl = response.data.generated_image;
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();
        await handleImage(imageBlob, "generated-thumbnail.png");
      } else {
        toast({
          title: "Please Enter a prompt of less than 5 letters",
          variant: "destructive",
        });
      }
      
    } catch {
      toast({
        title: "Error generating image",
        variant: "destructive",
      });
    } finally {
      setIsImageLoading(false);
    }
  };



 const handleImage = async (blob: Blob, fileName: string) => {
   setIsImageLoading(true);
   setImage("");
   try {
     const file = new File([blob], fileName, { type: "image/png" });
     const uploaded = await startUpload([file]);
     const storageId = (uploaded[0].response as Id<"_storage">).storageId;
     setImageStorageId(storageId);
     const imageUrl = await getImageUrl({ storageId });
     setImage(imageUrl!);
     setIsImageLoading(false);
     toast({ title: "Thumbnail generated successfully" });
   } catch {
     toast({ title: "Error generating thumbnail", variant: "destructive" });
   }

 };

  const {toast}=useToast()
  const uploadImage=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    e.preventDefault()
    try{
      const files=e.target.files;
      if(!files) return;
      const file=files[0];
      const blob=await file.arrayBuffer().then((ab)=>new Blob([ab]))
      handleImage(blob,file.name)
    }catch{
      toast({title:"Error Uploading Image",variant:"destructive"})
    }
  }
  return (
    <>
      <div className="generate_thumbnail">
        <Button
          type="button"
          variant="plain"
          onClick={() => setIsThumbnail(true)}
          className={`${isThumbnail ? "bg-black-6" : ""}`}
        >
          use AI to Generate Thumbnail
        </Button>
        <Button
          type="button"
          variant="plain"
          onClick={() => setIsThumbnail(false)}
          className={`${isThumbnail ? "" : "bg-black-6"}`}
        >
          Upload Custon Image
        </Button>
      </div>
      {isThumbnail ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5 mt-5">
            <Label className="text-16 font-bold text-white-1">
              AI Prompt to generate Thumbnail
            </Label>
            <Textarea
              className="input-class font-light focus-visible:ring-offset-orange-1"
              placeholder="Provide text to generate audio"
              rows={5}
              value={imagePrompt}
              onChange={(e)=>{setImagePrompt(e.target.value)}}
            />
          </div>
          <div className="w-full max-w-[200px]">
            <Button
              type="submit"
              className="text-16 bg-orange-1 py-4 font-bold text-white-1"
              onClick={handleImageGeneration}
            >
              {isImageLoading ? (
                <>
                  Generating
                  <Loader size={20} className="animate-spin ml-2" />
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="image_div" onClick={() => imageRef?.current?.click()}>
          <Input
            type="file"
            className="hidden"
            ref={imageRef}
            onChange={(e) => uploadImage(e)}
          />
          {!isImageLoading ? (
            <Image
              src="/icons/upload-image.svg"
              alt="upload"
              width={40}
              height={40}
            />
          ) : (
            <div className="text-16 flex-center font-medium text-white-1">
              Uplaoding
              <Loader size={20} className="animate-spin ml-2" />
            </div>
          )}
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-12 font-bold text-orange-1">Click to uplaod</h2>
            <p className="text-12 font-bold text-gray-1">
              SVG,JPG,PNG or GIF max(1080x1080px)
            </p>
          </div>
        </div>
      )}
      {image && (
        <div className="flex-center w-full">
          <Image
            src={image}
            width={200}
            height={200}
            className="mt-5"
            alt="thumbnail"
          />
        </div>
      )}
    </>
  );
};

export default GenerateThumbnail;
