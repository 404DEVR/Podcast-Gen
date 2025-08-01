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

const GenerateThumbnail = ({ setImageStorageId,
  setImage,
  image,
  imagePrompt,
  setImagePrompt }: GenerateThumbnailProps) => {
  const [isThumbnail, setIsThumbnail] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl);
  const getImageUrl = useMutation(api.podcasts.getUrl);
  const handleImageGeneration = async () => {
    setIsImageLoading(true);
    setImage("");
    const options = {
      method: 'POST',
      url: 'https://open-ai21.p.rapidapi.com/texttoimage2',
      headers: {
        'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_IMAGE_KEY,
        'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      data: {
        text: imagePrompt
      }
    };

    try {
      if (!imagePrompt.trim()) {
        toast({
          title: "Please enter a prompt",
          description: "Enter a description for your thumbnail image",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.request(options);
      const imageUrl = response.data.generated_image;

      if (!imageUrl) {
        toast({
          title: "Image generation failed",
          description: "No image URL received from the API",
          variant: "destructive",
        });
        return;
      }

      // Use our proxy API route to bypass CORS restrictions
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;

      const imageResponse = await fetch(proxyUrl);

      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image through proxy: ${imageResponse.status}`);
      }

      const imageBlob = await imageResponse.blob();
      await handleImage(imageBlob, "generated-thumbnail.png");

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

      // Extract storageId properly from the upload response
      const storageId = (uploaded[0].response as { storageId?: string }).storageId || uploaded[0].response as Id<"_storage">;
      setImageStorageId(storageId);

      // Try to get the Convex URL first
      const imageUrl = await getImageUrl({ storageId });

      // Test if the Convex URL is accessible
      if (imageUrl) {
        try {
          const testResponse = await fetch(imageUrl, { method: 'HEAD' });
          if (testResponse.ok) {
            setImage(imageUrl);
          } else {
            throw new Error(`Convex URL not accessible: ${testResponse.status}`);
          }
        } catch {
          // Create a blob URL as fallback
          const blobUrl = URL.createObjectURL(blob);
          setImage(blobUrl);
        }
      } else {
        // Create a blob URL as fallback
        const blobUrl = URL.createObjectURL(blob);
        setImage(blobUrl);
      }

      setIsImageLoading(false);
      toast({ title: "Thumbnail generated successfully" });
    } catch {
      // As a last resort, try to create a blob URL
      try {
        const blobUrl = URL.createObjectURL(blob);
        setImage(blobUrl);
        setImageStorageId(null);
        toast({ title: "Thumbnail generated (using local preview)" });
      } catch {
        toast({ title: "Error generating thumbnail", variant: "destructive" });
      }
      setIsImageLoading(false);
    }
  };

  const { toast } = useToast()
  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    try {
      const files = e.target.files;
      if (!files) return;
      const file = files[0];
      const blob = await file.arrayBuffer().then((ab) => new Blob([ab]))
      handleImage(blob, file.name)
    } catch {
      toast({ title: "Error Uploading Image", variant: "destructive" })
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
              className="input-class font-light focus-visible:ring-offset-[#4CAF50]"
              placeholder="Provide text to generate audio"
              rows={5}
              value={imagePrompt}
              onChange={(e) => { setImagePrompt(e.target.value) }}
            />
          </div>
          <div className="w-full max-w-[200px]">
            <Button
              type="submit"
              className="text-16 bg-[#4CAF50] py-4 font-bold text-white-1"
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
            <h2 className="text-12 font-bold text-[#4CAF50]">Click to uplaod</h2>
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
            className="mt-5 rounded-lg object-cover"
            alt="thumbnail"
            unoptimized={true}
          />
        </div>
      )}

    </>
  );
};

export default GenerateThumbnail;
