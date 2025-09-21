import React from 'react'
import { useContext, useEffect, useState } from "react";
import { UserDataContext } from '../context/UserContext';
const Card = ({image}) => {
    const {  serverUrl,userData,setUserData,backendImage, setBackendImage,frontendImage, setFrontendImage,selectedImage, setSelectedImage} =useContext(UserDataContext)
  return (
    <div className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#0c1141] border-2 border-[blue] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-amber-50 ${selectedImage==image?"border-4 border-amber-50 shadow-2xl shadow-blue-950": null}` } 
    onClick={()=>{
    setSelectedImage(image)
    setBackendImage(null)
    setFrontendImage(null)
    }}>
        <img src={image} className='h-full object-cover' />

    </div>
  )
}

export default Card