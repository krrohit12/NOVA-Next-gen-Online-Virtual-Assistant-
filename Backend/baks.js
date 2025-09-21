import React, { useContext, useEffect, useState } from 'react'
import { UserDataContext } from '../context/UserContext'
import { IoSettings, IoPersonOutline, IoLogOutOutline } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'

const Home = () => {
  const { userData, serverUrl, setUserData } = useContext(UserDataContext)
  const [isAnimating, setIsAnimating] = useState(true)
  const [showSettingsPopup, setShowSettingsPopup] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isWaitingForCommand, setIsWaitingForCommand] = useState(false)
  const [commandTimeout, setCommandTimeout] = useState(null)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {withCredentials: true})
      setUserData(null)
      setShowSettingsPopup(false)
    } catch (error) {
      console.log(error)
    }
  }

  const handleCustomizeAssistant = () => {
    navigate('/customize')
    setShowSettingsPopup(false)
  }

  const speak=(text)=>{
    const utterance= new SpeechSynthesisUtterance(text)
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.lang = 'en-US'
      
      recognition.onresult = async(e) => {
        const transcript = e.results[e.results.length-1][0].transcript.trim()
        console.log('Speech detected:', transcript)
        
        if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
          
          try {
            const response = await axios.post(`${serverUrl}/api/user/ask`, {
              command: transcript
            }, { withCredentials: true })
            
            console.log('Gemini Response:', response.data.assistantResponse)
            speak(response.data.assistantResponse)
            
          } catch (error) {
            console.error('Error calling Gemini API:', error)
          }
        }
      }  
      recognition.start()
      console.log('Speech recognition started')
    }
  }, [])
  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#0c1141] flex flex-col relative overflow-hidden">
      
      {/* Background Animation Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`absolute rounded-full border-2 border-cyan-400/20 ${isAnimating ? 'animate-ping' : ''}`} 
             style={{width: '320px', height: '320px'}}></div>
        <div className={`absolute rounded-full border-2 border-blue-400/20 ${isAnimating ? 'animate-ping' : ''}`} 
             style={{width: '420px', height: '420px', animationDelay: '0.5s'}}></div>
        <div className={`absolute rounded-full border-2 border-purple-400/20 ${isAnimating ? 'animate-ping' : ''}`} 
             style={{width: '520px', height: '520px', animationDelay: '1s'}}></div>
      </div>

      {/* Backdrop to close popup */}
      {showSettingsPopup && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowSettingsPopup(false)}
        ></div>
      )}

      {/* Header */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-50">
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowSettingsPopup(!showSettingsPopup);
            }}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 relative z-50"
          >
            <IoSettings size={20} />
          </button>
          
          {/* Settings Popup */}
          {showSettingsPopup && (
            <div className="absolute right-0 top-12 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl min-w-48 z-50">
              <div className="py-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCustomizeAssistant();
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <IoPersonOutline size={16} />
                  Customize Your Assistant
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <IoLogOutOutline size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Central Assistant */}
      <div className="flex-1 flex items-center justify-center flex-col relative z-10">
        
        {/* Central Circle with Assistant Image */}
        <div className="relative w-72 h-72 flex items-center justify-center mb-8">
          {/* Main Circle Border */}
          <div className="absolute inset-0 rounded-full border-4 border-gradient-to-r from-cyan-400 to-blue-500 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 backdrop-blur-sm"></div>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-20 blur-xl animate-pulse"></div>
          
          {/* Assistant Image */}
          <img 
            src={userData?.assistantImage} 
            alt={userData?.assistantName}
            className="relative w-56 h-56 rounded-full object-cover border-4 border-white/20 shadow-2xl z-10"
          />
          
          {/* Floating particles around circle */}
          <div className="absolute top-8 left-8 w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-12 right-12 w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-8 right-8 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-12 left-12 w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/2 left-4 w-1 h-1 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 right-4 w-1 h-1 bg-purple-300 rounded-full animate-bounce" style={{animationDelay: '2.5s'}}></div>
        </div>

        {/* Assistant Name and Greeting */}
        <div className="text-center">
          <p className="text-cyan-300 text-xl mb-4">
            Hi, I am {userData?.assistantName}
          </p>
        </div>
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
    </div>
  )
}

export default Home