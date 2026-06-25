import React from 'react'
import { Link, Navigate } from 'react-router'
import Login from '../pages/Auth/login/login'

export default function Authroute({ children }) {

    const token = localStorage.getItem("userToken")
    if (!token) {
        return children
    }





    return (
        // <div>
        //     <Link to={"/login"} className='text-blue-600'>please login first</Link >
        // </div>
        // <Login />
        <Navigate to={"/welcome"}></Navigate>
    )
}
