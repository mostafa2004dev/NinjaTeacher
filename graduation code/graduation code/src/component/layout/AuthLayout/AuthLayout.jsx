import React from 'react'
import { Outlet } from 'react-router'
import Footer from "../Footer/Footer"
import Navbar from '../Navbar/Navbar'
export default function AuthLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer /></>
  )
}
