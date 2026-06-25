import { Input } from '@heroui/react'
import React from 'react'
import AppButton from '../shared/validationMessage/appbutton/AppButton'
import { IoSend } from 'react-icons/io5'
import { useForm } from 'react-hook-form'
import { sendComment } from '../../servises/comments.api'
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function CommentForm({ postid }) {

    const queryClient = useQueryClient();

    const { handleSubmit, register, formState: { errors }, reset } = useForm({
        defaultValues: {
            content: "",
        }
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (data) => sendComment(postid, { content: data.content }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["comments", postid]
            });

            reset();
        },
        onError: (err) => {
            console.error("Failed to send comment:", err);
        }
    });

    function creatComment(data) {
        mutate(data);
    }

    return (
        <form
            onSubmit={handleSubmit(creatComment)}
            className="p-4 bg-white rounded-2xl"
        >
            <div className="flex items-start gap-3">

                {/* Input */}
                <div className="flex-1">
                    <Input
                        placeholder="Enter your comment..."
                        type="text"
                        variant="bordered"
                        className="w-full"
                        {...register("content", {
                            required: {
                                value: true,
                                message: "Comment is empty"
                            },
                            maxLength: {
                                value: 225,
                                message: "max char 225"
                            }
                        })}
                    />

                    {errors.content && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.content.message}
                        </p>
                    )}
                </div>

                {/* Send Button */}
                <AppButton
                    type="submit"
                    disabled={isPending}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 h-11 transition duration-200 disabled:opacity-50"
                >
                    {isPending ? "..." : <IoSend className="text-lg" />}
                </AppButton>

            </div>
        </form>
    )
}