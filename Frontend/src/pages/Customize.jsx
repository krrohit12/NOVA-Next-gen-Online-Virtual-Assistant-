import React, { useContext, useRef, useState } from "react";
import Card from "../components/Card";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.jpeg";
import image7 from "../assets/image7.jpeg";
import { RiImageAddLine } from "react-icons/ri";
import { IoArrowBack } from "react-icons/io5";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
const Customize = () => {
  const {
    serverUrl,
    userData,
    setUserData,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(UserDataContext);
  const inputImage = useRef();
  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };
  const navigate =useNavigate()
  return (
    <>
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      <div className="w-full min-h-screen bg-gradient-to-t from-black to-[#0c1141] flex justify-center items-start flex-col p-4 lg:p-[20px] relative overflow-x-hidden hide-scrollbar">
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 lg:top-6 lg:left-6 text-white hover:text-cyan-400 transition-colors p-2 rounded-full hover:bg-white/10 z-10"
      >
        <IoArrowBack size={20} className="lg:w-6 lg:h-6" />
      </button>
      <h1 className="text-white text-xl sm:text-2xl lg:text-[30px] text-center mb-6 lg:mb-[30px] mt-16 lg:mt-0 px-2">
        Select your{" "}
        <span className="text-blue-200">
          Assistant Image
        </span>
      </h1>
      <div className="w-full max-w-[900px] flex justify-center items-center flex-wrap gap-3 lg:gap-[15px] px-2">
        <Card image={image1} />
        <Card image={image2} />
        <Card image={image4} />
        <Card image={image5} />
        <Card image={image6} />
        <Card image={image7} />
        <div
          className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#0c1141] border-2 border-[blue] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-amber-50 flex items-center justify-center ${
            selectedImage == "input"
              ? "border-4 border-amber-50 shadow-2xl shadow-blue-950"
              : null
          } `}
          onClick={() => {
            inputImage.current.click();
            setSelectedImage("input");
          }}
        >
          {!frontendImage && (
            <RiImageAddLine className="text-white w-[25px] h-[25px]" />
          )}
          {frontendImage && (
            <img src={frontendImage} className="h-full object-cover" />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          hidden
          ref={inputImage}
          onChange={handleImage}
        />
      </div>
      {selectedImage && (
        <button
          type="button"
          onClick={()=>navigate('/customize2')}
          className="text-cyan-400 hover:text-cyan-300 min-w-[150px] h-[50px] lg:h-[60px] bg-amber-50 font-semibold transition-colors hover:underline rounded-full mt-6 mb-8 lg:m-3 cursor-pointer"
        >
          Next
        </button>
      )}
      </div>
    </>
  );
};

export default Customize;
