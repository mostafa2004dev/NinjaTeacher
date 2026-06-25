import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllcomments } from "../../servises/comments.api";
import CommentCard from "./commentCard";
import CommentForm from "./CommentForm";


export default function CommentsList({ postid }) {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["comments", postid],
        queryFn: () => getAllcomments(postid),
        select: (res) => res?.data?.data?.comments,
        enabled: !!postid,   
        staleTime: 0       
    });

    if (isLoading) return <p>Loading comments...</p>;
    if (isError) return <p>Error loading comments</p>;
    if (!data?.length) return <p>No comments found</p>;

    return <>
        {/* <CommentForm postid={postid} onCommentChange={refetch} /> */}
        <div className="space-y-4 mt-4">
            {data.map(comment => (
                <CommentCard
                    key={comment._id}
                    comment={comment}
                    onCommentChange={refetch}
                />
            ))}
        </div>
    </>;
}