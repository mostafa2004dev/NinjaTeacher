import axios from "axios";


const Post_URL = "https://route-posts.routemisr.com/posts/"

// SEND COMMENT
export async function sendComment(id,data) {
    return await axios.request({
        method: "post",
        url: `${Post_URL}/${id}/comments`,
        headers: {
            token: localStorage.getItem("userToken"),
        },
        data:data,
    });
}

//GET ALL COMMENT
export async function getAllcomments(id,data) {
    return await axios.request({
        method: "GET",
        url: `https://route-posts.routemisr.com/posts/${id}/comments?page=1&limit=10`,
        headers: {
            token: localStorage.getItem("userToken"),
        },
        data:data,
    });
}
// DELETEE COMMENT
export async function deleteOneComment(idpost,idcomment,data) {
    return await axios.request({
        method: "DELETE",
        url: `https://route-posts.routemisr.com/posts/${idpost}/comments/${idcomment}`,
        headers: {
            token: localStorage.getItem("userToken"),
        },
        data:data,
    });
}