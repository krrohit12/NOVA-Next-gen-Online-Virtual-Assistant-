import React, { useContext, useState } from "react";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";

export const Customize2 = () => {
  const { userData, backendImage, selectedImage, serverUrl,setUserData } =
    useContext(UserDataContext);
  const [assisantName, setAssistantName] = useState(
    userData?.assisantName || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleUpdateAssistant = async () => {
    setIsLoading(true);
    try {
        let formData=new FormData()
        formData.append("assistantName" , assisantName)

      if(backendImage){
        formData.append("assistantImage",backendImage)
      }
      else{
        formData.append("imageUrl",selectedImage)
      }
      const result = await axios.post(`${serverUrl}/api/user/update`,formData,{withCredentials:true});

      console.log(result.data)
      setUserData(result.data)

      // Navigate to home page after successful update
      navigate("/")

    } catch (error) {
        console.log(error)
    } finally {
        setIsLoading(false);
    }
  };
  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#0c1141] flex justify-center items-center flex-col p-[20px] relative">
      <button
        onClick={() => navigate('/customize')}
        className="absolute top-6 left-6 text-white hover:text-cyan-400 transition-colors p-2 rounded-full hover:bg-white/10"
      >
        <IoArrowBack size={24} />
      </button>
      <h1 className="text-white text-[30px] text-center mb-[30px]">
        Enter Your{" "}
        <span
          className="
      text-blue-200"
        >
          Assistant Name
        </span>
      </h1>
      <input
        type="text"
        name="email"
        required
        onChange={(e) => setAssistantName(e.target.value)}
        value={assisantName}
        className="w-full max-w-[500px] pl-3 pr-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 hover:border-gray-500"
        placeholder="eg. shifra"
      />
      {assisantName && (
        <button
          type="button"
          onClick={handleUpdateAssistant}
          disabled={isLoading}
          className={`min-w-[300px] h-[60px] font-semibold rounded-full m-3 transition-colors ${
            isLoading 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'text-black hover:text-amber-950 bg-amber-50 hover:underline cursor-pointer'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              Creating Assistant...
            </div>
          ) : (
            'Finally Create Your Assistant'
          )}
        </button>
      )}
    </div>
  );
};
