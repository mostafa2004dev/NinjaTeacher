import React, { useContext, useState } from 'react'
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import timeAgo from "../utilitis/utilitis";
import defultProfilephoto from "../../img/pngwing.com (1).png"
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { deleteOneComment } from '../../servises/comments.api';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Authcontext } from '../../context/Authcontext';





function checkProfileIMG(image) {
    return image.includes('undefined') ? defultProfilephoto : image
}

export default function CommentCard({ comment }) {
    // const { currentUserId } = useContext(Authcontext)
    const { userId } = useContext(Authcontext)

    const queryClient = useQueryClient();
    const [liked, setLiked] = useState(false);

    const { mutate } = useMutation({
        mutationFn: () => deleteOneComment(comment.post, comment._id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["comments", comment.post]
            });
        },
        onError: (error) => {
            console.error("Error deleting comment:", error);
        }
    });

    function handleDelete() {
        mutate();
    }

    return (
        <div className="max-w-xl mx-auto bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300">

            {/* Header */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    {comment.commentCreator.photo && (
                        <img
                            src={checkProfileIMG(comment.commentCreator.photo)}
                            alt={comment.commentCreator.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    )}
                    <div>
                        <h4 className="font-semibold text-sm">
                            {comment.commentCreator.name}
                        </h4>
                        <span className="text-xs text-gray-500">
                            {timeAgo(comment.createdAt)}
                        </span>
                    </div>
                </div>

                {comment.commentCreator._id === userId && (
                    <Dropdown placement="bottom">
                        <DropdownTrigger>
                            <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Profile Actions" variant="flat">
                            <DropdownItem key="delete" onClick={handleDelete}>
                                Delete Comment
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                )}
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
                <p className="text-sm text-left">
                    {comment.content}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-5 p-4">
                <Heart
                    onClick={() => setLiked(!liked)}
                    className={`w-6 h-6 cursor-pointer transition ${liked
                        ? "text-red-500 fill-red-500 scale-110"
                        : "text-gray-600 hover:text-red-500"
                        }`}
                />
            </div>

        </div>
    )
}