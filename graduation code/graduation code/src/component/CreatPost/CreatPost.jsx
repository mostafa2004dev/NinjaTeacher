import { Textarea } from '@heroui/react'
import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import AppButton from '../shared/validationMessage/appbutton/AppButton';
import { CiImageOn } from "react-icons/ci";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios'; 


const createPostApi = async (data) => {
  const formData = new FormData();
  if (data.content) formData.append("body", data.content);
  if (data.image) formData.append("image", data.image);

  const res = await axios.post("https://route-posts.routemisr.com/posts", formData, {
    headers: {
      token: localStorage.getItem("userToken"), 
    },
  });
  return res.data;
};

const Maxchar = 225;
const postSchema = z.object({
  content: z.string().max(Maxchar, `maximum char is ${Maxchar}`).optional(),
  image: z.any().optional(),
}).refine((data) => data.content || data.image, {
  message: "Post must have text or an image",
  path: ["content"],
});

export default function CreatPost() {
  const queryClient = useQueryClient();
  const [imagePreview, setimagePreview] = useState(null);
  const inputFileRef = useRef(null);


  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      image: null
    }
  });

  const watchedContent = watch("content");


  const { mutate, isPending } = useMutation({
    mutationFn: (data) => createPostApi(data),
    onSuccess: () => {
      handleCancel(); 
      queryClient.invalidateQueries({ queryKey: ["all-posts"] });
    },
    onError: (err) => {
      console.error("Failed to create post:", err);
    }
  });

  function handelchahgeImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setimagePreview(URL.createObjectURL(file));
    setValue("image", file);
  }

  const handleCancel = () => {
    setimagePreview(null);
    if (inputFileRef.current) inputFileRef.current.value = null;
    reset({ content: '', image: null }); 
  };

  const onSubmit = (data) => {
    mutate(data);
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-6">
      <div className="bg-white rounded-3xl shadow-lg shadow-black/10 overflow-hidden relative">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 relative">
            <Textarea
              placeholder="What is in your mind..."
              maxLength={Maxchar}
              {...register("content")}
              isInvalid={!!errors.content}
              errorMessage={errors.content?.message}
              classNames={{
                input: "text-sm",
                base: "border-none shadow-none"
              }}
            />

            <label className="absolute top-6 right-6 cursor-pointer">
              <CiImageOn className="w-6 h-6 text-gray-500 hover:text-black transition" />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handelchahgeImage}
                ref={inputFileRef}
              />
            </label>

            <div className="text-right text-xs text-gray-400 mt-2">
              {watchedContent?.length || 0}/{Maxchar}
            </div>
          </div>

          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="preview"
                className="w-full object-cover max-h-80"
              />
              <button
                type="button"
                onClick={() => { setimagePreview(null); setValue("image", null); }}
                className="absolute top-3 right-3 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex justify-end items-center gap-3 p-4 border-t bg-white">
            <AppButton
              type="submit"
              color="primary"
              isLoading={isPending}
            >
              Post
            </AppButton>
          </div>
        </form>
        <div className='absolute bottom-4 right-25'>
          <AppButton
            type="button"
            variant="fade"
            onClick={handleCancel}
          >
            Cancel
          </AppButton>
        </div>
      </div>
    </div>
  );
}
