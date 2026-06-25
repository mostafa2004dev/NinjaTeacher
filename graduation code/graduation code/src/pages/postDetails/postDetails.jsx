import React from 'react'
import { getSinglepost } from '../../servises/post/posts.api'
import { useParams } from 'react-router'

import { useQuery } from '@tanstack/react-query';
import LoaderPharaoh from '../../component/shared/validationMessage/loader/loader';
import PostCard from '../../component/posts/postCard';
import { Alert } from '@heroui/react';



export default function PostDetails() {

    const { postid } = useParams()



    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["single-post"],
        queryFn: () => getSinglepost(postid),
        select: (data) => data?.data?.data?.post
  ,  staleTime: 0
    })

    if (isError) {
        return <Alert color={"danger"} title={error.response ? error.response.data.message : error.message} />
    }
    if (isLoading) {
        return <LoaderPharaoh />
    }

    return <>
        <section className='py-12'>

            <div className=' w-full max-w-100 md:max-w-1/2 mx-auto space-y-4'>
                {data &&
                    <PostCard post={data}isDetails={true} />
                }
            </div>
        </section>

    </>
}


