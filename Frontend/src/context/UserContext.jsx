/* eslint-disable react-refresh/only-export-components */
import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserDataContext = createContext();

export const UserContext = ({ children }) => {
    const serverUrl="https://nova-next-gen-online-virtual-assistant.onrender.com"
    // eslint-disable-next-line no-unused-vars
    const [userData,setUserData]= useState(null)
      const [frontendImage, setFrontendImage]=useState(null);
      const [backendImage, setBackendImage]=useState(null);
      const [selectedImage, setSelectedImage]=useState(null);
    const handleCurrentUser=async()=>{
        try{
            const result=await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})

            setUserData(result.data)
            console.log(result.data)
        }catch(error){
            console.log(error)
        }
    }

    useEffect(()=>{
        handleCurrentUser()
    },[])
    const value={
        serverUrl,userData,setUserData,backendImage, setBackendImage,frontendImage, setFrontendImage,selectedImage, setSelectedImage
    }
    return (
        <div>
        <UserDataContext.Provider value={value} >
            {children}
        </UserDataContext.Provider>
        </div>
    );
};
 
