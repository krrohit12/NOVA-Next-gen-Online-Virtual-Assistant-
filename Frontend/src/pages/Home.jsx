import React, { useContext, useState, useRef } from 'react'
import { UserDataContext } from '../context/UserContext'
import { IoSettings, IoPersonOutline, IoLogOutOutline, IoMic, IoMicOff, IoTimeOutline, IoClose } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'

const Home = () => {
  // Context and navigation
  const { userData, serverUrl, setUserData } = useContext(UserDataContext)
  const navigate = useNavigate()

  // UI state
  const [showSettingsPopup, setShowSettingsPopup] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [userText, setUserText] = useState('')
  const [aiText, setAiText] = useState('')

  // Refs for stable references
  const isSpeakingRef = useRef(false)
  const speechInitialized = useRef(false)
  const hasUserInteracted = useRef(false)
  const recognitionRef = useRef(null)

  // AUTH HANDLERS

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      setShowSettingsPopup(false)
    } catch (error) {
      console.log('Logout error:', error)
    }
  }

  const handleCustomizeAssistant = () => {
    navigate('/customize')
    setShowSettingsPopup(false)
  }

  const handleShowHistory = () => {
    console.log('Opening history modal. Current history:', userData?.history)
    setShowHistoryModal(true)
    setShowSettingsPopup(false)
  }

  const handleCloseHistory = () => {
    setShowHistoryModal(false)
  }

  // SPEECH SYNTHESIS

  const initializeSpeech = () => {
    if (speechInitialized.current) {
      console.log('Speech already initialized')
      return
    }

    console.log('🔧 Initializing speech synthesis...')

    // Wait for voices to load and log available voices
    const logVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      console.log('🎤 Available voices:', voices.map(v => `${v.name} (${v.lang})`))

      // Log Hindi/Indian voices specifically
      const indianVoices = voices.filter(voice =>
        voice.lang.includes('hi') ||
        voice.lang.includes('IN') ||
        voice.name.toLowerCase().includes('hindi') ||
        voice.name.toLowerCase().includes('indian')
      )
      if (indianVoices.length > 0) {
        console.log(' Hindi/Indian voices found:', indianVoices.map(v => `${v.name} (${v.lang})`))
      } else {
        console.log(' No Hindi/Indian voices available')
      }
    }

    // Log voices immediately and also when they load
    logVoices()
    window.speechSynthesis.onvoiceschanged = logVoices

    speechInitialized.current = true
    console.log('Speech synthesis enabled')
  }

  const speak = (text, retryCount = 0) => {
    if (!text?.trim()) return

    console.log(' Starting to speak:', text)
    setAiText(text)
    setUserText('')

    if (!window.speechSynthesis) {
      console.log(' Speech synthesis not supported')
      return
    }

    // Initialize speech on first use
    if (!speechInitialized.current) {
      initializeSpeech()
      if (retryCount < 3) {
        setTimeout(() => speak(text, retryCount + 1), 100)
      }
      return
    }

    // Cancel any ongoing speech and wait a moment before starting new speech
    if (window.speechSynthesis.speaking) {
      if (retryCount < 3) {
        console.log(' Speech in progress, canceling and restarting...')
        window.speechSynthesis.cancel()
        setTimeout(() => speak(text, retryCount + 1), 200)
      } else {
        console.log(' Too many speech retries, skipping...')
      }
      return
    }

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8
    utterance.pitch = 1
    utterance.volume = 1

    // Set speaking state immediately
    setIsSpeaking(true)
    isSpeakingRef.current = true

    // Calculate fallback timeout (more generous for Chrome)
    const words = text.split(' ').length
    const estimatedDuration = (words / (120 * utterance.rate)) * 60 * 1000  // Slower estimate
    const fallbackTimeout = Math.max(estimatedDuration + 3000, 8000)  // Longer timeout

    // Prevent duplicate cleanup calls
    let hasCleanedUp = false
    const resetSpeakingState = () => {
      if (hasCleanedUp) return
      hasCleanedUp = true
      console.log(' Resetting speaking state')
      setIsSpeaking(false)
      isSpeakingRef.current = false
      setTimeout(() => {
        setAiText('')
        setUserText('')
      }, 300)
    }

    // Set fallback timer
    const fallbackTimer = setTimeout(() => {
      console.log('⏰ Fallback timeout triggered')
      resetSpeakingState()
    }, fallbackTimeout)

    // Handle speech events
    utterance.onstart = () => {
      console.log(' AI Started Speaking')
      console.log(' Volume:', utterance.volume, 'Rate:', utterance.rate, 'Pitch:', utterance.pitch)
      console.log('Selected Voice:', utterance.voice?.name || 'Default')
      setIsSpeaking(true)
      isSpeakingRef.current = true
    }

    utterance.onend = () => {
      console.log('🤐 AI Finished Speaking')
      clearTimeout(fallbackTimer)
      resetSpeakingState()
    }

    utterance.onerror = (error) => {
      console.log(' Speech Error:', error.error)
      console.log('Full Error Object:', error)
      clearTimeout(fallbackTimer)
      resetSpeakingState()
    }

    // Set voice preference - prioritize female voices (Chrome-compatible)
    const setVoiceForUtterance = () => {
      const voices = window.speechSynthesis.getVoices()

      if (voices.length === 0) {
        // Voices not loaded yet, will retry
        return false
      }

      // Try to find female voices first
      const femaleVoice = voices.find(voice =>
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('girl') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('hazel') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('tessa') ||
        voice.name.toLowerCase().includes('moira') ||
        voice.name.toLowerCase().includes('fiona') ||
        voice.name.toLowerCase().includes('susan') ||
        voice.name.toLowerCase().includes('allison') ||
        voice.name.toLowerCase().includes('ava') ||
        voice.name.toLowerCase().includes('serena')
      )

      // Try to find Hindi/Indian female voice
      const indianFemaleVoice = voices.find(voice =>
        (voice.lang.includes('hi') || voice.lang.includes('IN') ||
         voice.name.toLowerCase().includes('hindi') ||
         voice.name.toLowerCase().includes('indian')) &&
        (voice.name.toLowerCase().includes('female') ||
         voice.name.toLowerCase().includes('woman') ||
         voice.name.toLowerCase().includes('girl'))
      )

      // Fallback to any English voice
      const englishVoice = voices.find(voice =>
        voice.lang.startsWith('en')
      )

      // For testing - prioritize Indian English voice
      const indianEnglishVoice = voices.find(voice =>
        voice.name.includes('Rishi') ||
        (voice.lang.includes('en-IN') && !voice.name.includes('Google'))
      )

      if (indianEnglishVoice) {
        utterance.voice = indianEnglishVoice
        console.log(' Using Indian English voice:', indianEnglishVoice.name)
      } else if (indianFemaleVoice) {
        utterance.voice = indianFemaleVoice
        console.log(' Using Indian Female voice:', indianFemaleVoice.name)
      } else if (femaleVoice) {
        utterance.voice = femaleVoice
        console.log(' Using Female voice:', femaleVoice.name)
      } else if (englishVoice) {
        utterance.voice = englishVoice
        console.log(' Using English voice:', englishVoice.name)
      }

      return true
    }

    // Set voice and handle Chrome voice loading
    if (!setVoiceForUtterance()) {
      // Wait for voices to load in Chrome
      const voiceRetryTimeout = setTimeout(() => {
        setVoiceForUtterance()
      }, 100)
    }

    // Start speaking with Chrome-specific handling
    setTimeout(() => {
      try {
        // Chrome-specific: Cancel any pending speech first
        window.speechSynthesis.cancel()

        // Small delay to ensure cancellation completes
        setTimeout(() => {
          // Force refresh voices in Chrome
          if (utterance.voice === null || utterance.voice === undefined) {
            setVoiceForUtterance()
          }

          // Check system audio state
          console.log(' System Checks:')
          console.log('   - SpeechSynthesis ready:', window.speechSynthesis.speaking === false)
          console.log('   - Utterance volume:', utterance.volume)
          console.log('   - Browser audio context:', typeof AudioContext !== 'undefined' ? 'Available' : 'Not available')

          window.speechSynthesis.speak(utterance)
          console.log('🎵 Speech synthesis speak() called')

          // Chrome-specific: Check if speech is actually queued
          setTimeout(() => {
            console.log(' Speech Status Check:')
            console.log('   - Speaking:', window.speechSynthesis.speaking)
            console.log('   - Pending:', window.speechSynthesis.pending)
            console.log('   - Paused:', window.speechSynthesis.paused)
          }, 200)
        }, 50)

      } catch (error) {
        console.log('Speech synthesis error:', error)
        clearTimeout(fallbackTimer)
        resetSpeakingState()
      }
    }, 100)
  }

  // COMMAND PROCESSING

  const handleCommandType = (type, userInput, assistantResponse) => {
    console.log('Processing command:', type, 'Input:', userInput)

    switch (type) {
      case 'get_time': {
        const currentTime = moment().format('h:mm A')
        speak(`The current time is ${currentTime}`)
        return true
      }

      case 'get_date': {
        const currentDate = moment().format('MMMM Do, YYYY')
        speak(`Today's date is ${currentDate}`)
        return true
      }

      case 'get_day': {
        const currentDay = moment().format('dddd')
        speak(`Today is ${currentDay}`)
        return true
      }

      case 'get_month': {
        const currentMonth = moment().format('MMMM')
        speak(`The current month is ${currentMonth}`)
        return true
      }

      case 'google_search': {
        const query = userInput || assistantResponse
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`
        setTimeout(() => window.open(url, '_blank'), 1000)
        break
      }

      case 'youtube_search': {
        const query = userInput || assistantResponse
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
        setTimeout(() => window.open(url, '_blank'), 1000)
        break
      }

      case 'youtube_play': {
        const query = userInput || assistantResponse
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
        setTimeout(() => window.open(url, '_blank'), 1000)
        break
      }

      case 'calculator_open': {
        setTimeout(() => window.open('https://www.google.com/search?q=calculator', '_blank'), 1000)
        break
      }

      case 'instagram_open': {
        setTimeout(() => window.open('https://www.instagram.com', '_blank'), 1000)
        break
      }

      case 'facebook_open': {
        setTimeout(() => window.open('https://www.facebook.com', '_blank'), 1000)
        break
      }

      case 'weather-show': {
        setTimeout(() => window.open('https://weather.google.com', '_blank'), 1000)
        break
      }

      case 'general': {
        console.log('General query processed')
        break
      }

      default: {
        console.log('Unknown command type:', type)
        break
      }
    }

    return false // Not handled locally, should speak response
  }

  // SPEECH RECOGNITION (MANUAL)

  const startListening = () => {
    if (!userData?.assistantName || isListening || isSpeaking) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.log(' Speech recognition not supported')
      return
    }

    // Initialize speech on first use
    if (!hasUserInteracted.current) {
      hasUserInteracted.current = true
      if (!speechInitialized.current) {
        console.log('🎙️ First voice interaction - initializing speech')
        initializeSpeech()
      }
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognitionRef.current = recognition

    recognition.onstart = () => {
      console.log('🎙️ Manual recognition started')
      setIsListening(true)
      setUserText('')
      setAiText('')
    }

    recognition.onend = () => {
      console.log('🎙️ Manual recognition ended')
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onerror = (event) => {
      console.log(' Recognition error:', event.error)
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim()
      console.log('🎯 Speech detected:', transcript)

      setIsListening(false)
      setUserText(transcript)

      try {
        const response = await axios.post(`${serverUrl}/api/user/ask`, {
          command: transcript
        }, { withCredentials: true })

        if (response.data.success) {
          const { type, assistantResponse, userInput } = response.data
          const wasHandledLocally = handleCommandType(type, userInput, assistantResponse)

          // Refresh user data to get updated history from backend
          try {
            const userResponse = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true })
            setUserData(userResponse.data)
          } catch (error) {
            console.log('Error refreshing user data:', error)
          }

          if (!wasHandledLocally) {
            speak(assistantResponse)
          }
        } else {
          speak("Sorry, I couldn't understand that command.")
        }

      } catch (error) {
        console.error('API Error:', error)

        if (error.response?.status === 429) {
          speak('Sorry, the AI service quota has been exceeded. Please try again later.')
        } else if (error.response?.status === 401) {
          speak('Sorry, there was an authentication error. Please check your API key.')
        } else if (error.response?.status >= 500) {
          speak('Sorry, the AI service is temporarily unavailable. Please try again later.')
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          speak('Sorry, there was a network connection error. Please check your internet connection.')
        } else {
          speak('Sorry, there was an error processing your request. Please try again.')
        }
      }
    }

    // Start recognition
    try {
      recognition.start()
    } catch (error) {
      console.log('Failed to start recognition:', error)
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      console.log('Stopping manual recognition')
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.log('Error stopping recognition:', error)
      }
    }
    setIsListening(false)
  }


  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#0c1141] flex flex-col relative overflow-hidden">

      {/* Background Animation Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute rounded-full border-2 border-cyan-400/20 animate-ping"
             style={{width: '320px', height: '320px'}}></div>
        <div className="absolute rounded-full border-2 border-blue-400/20 animate-ping"
             style={{width: '420px', height: '420px', animationDelay: '0.5s'}}></div>
        <div className="absolute rounded-full border-2 border-purple-400/20 animate-ping"
             style={{width: '520px', height: '520px', animationDelay: '1s'}}></div>
      </div>

      {/* Settings Popup Backdrop */}
      {showSettingsPopup && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowSettingsPopup(false)}
        />
      )}

      {/* Header with Settings */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-50">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowSettingsPopup(!showSettingsPopup)
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
                    e.stopPropagation()
                    handleCustomizeAssistant()
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <IoPersonOutline size={16} />
                  Customize Your Assistant
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShowHistory()
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <IoTimeOutline size={16} />
                  Command History
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLogout()
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


          {/* Floating particles */}
          <div className="absolute top-8 left-8 w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-12 right-12 w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-8 right-8 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-12 left-12 w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/2 left-4 w-1 h-1 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 right-4 w-1 h-1 bg-purple-300 rounded-full animate-bounce" style={{animationDelay: '2.5s'}}></div>
        </div>

        {/* Assistant Greeting */}
        <div className="text-center">
          <p className="text-cyan-300 text-xl mb-4">
            Hi, I am {userData?.assistantName}
          </p>

          {/* Manual Mic Button */}
          <div className="mt-4 flex flex-col items-center justify-center">
            {/* Dynamic GIF Display - Above Mic Button */}

            <button
              onClick={() => {
                // Initialize speech on first interaction
                if (!hasUserInteracted.current) {
                  hasUserInteracted.current = true
                  if (!speechInitialized.current) {
                    console.log('🎙️ First interaction - initializing speech')
                    initializeSpeech()
                  }
                }

                // Handle mic button click
                if (isListening) {
                  stopListening()
                } else if (!isSpeaking) {
                  startListening()
                }
              }}
              disabled={isSpeaking}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg ${
                isSpeaking
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : isListening
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/25 animate-pulse'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-cyan-500/25'
              }`}
              title={isSpeaking ? 'AI is speaking...' : isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? (
                <IoMicOff className="w-8 h-8 text-white" />
              ) : (
                <IoMic className="w-8 h-8 text-white" />
              )}
            </button>
            <p className="text-gray-400 text-sm mt-2">
              {isSpeaking
                ? 'AI is speaking...'
                : isListening
                  ? 'Listening... Click to stop'
                  : 'Click to start listening'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Text Display Area */}
      <div className="absolute bottom-5 left-0 right-0 p-6 z-20">
        <div className="max-w-4xl mx-auto">
          {(userText || aiText || isListening) && (
            <div className="bg-black/60 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-4 mb-3">
                {isListening && !userText && !aiText && (
                  <>
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-purple-300 text-sm font-medium">Listening...</span>
                  </>
                )}
                {userText && (
                  <>
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">You</span>
                    </div>
                    <span className="text-purple-300 text-sm font-medium">You said:</span>
                  </>
                )}
                {aiText && !userText && (
                  <>
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <span className="text-cyan-300 text-sm font-medium">{userData?.assistantName} says:</span>
                  </>
                )}
              </div>

              {isListening && !userText && !aiText ? (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                  <span className="text-white/70 text-lg">Say "{userData?.assistantName}" to get started...</span>
                </div>
              ) : (
                <p className="text-white text-lg leading-relaxed">
                  {userText || aiText}
                </p>
              )}

              {(userText || aiText) && (
                <div className="mt-4 flex justify-end">
                  <span className="text-white/50 text-xs">
                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCloseHistory}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-gray-900 border border-gray-600 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                  <IoTimeOutline className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Command History</h2>
              </div>
              <button
                onClick={handleCloseHistory}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
              >
                <IoClose size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {userData?.history && userData.history.length > 0 ? (
                <div className="space-y-3">
                  {userData.history.slice().reverse().map((historyItem, index) => {
                    // Handle both old string format and new object format
                    const command = typeof historyItem === 'string' ? historyItem : historyItem.command
                    const timestamp = typeof historyItem === 'object' ? historyItem.timestamp : null

                    return (
                      <div
                        key={index}
                        className="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-xs font-bold text-white">
                              {userData.history.length - index}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm leading-relaxed">
                              {command}
                            </p>
                            <p className="text-gray-400 text-xs mt-2">
                              Command #{userData.history.length - index}
                              {timestamp && (
                                <span className="ml-2">
                                  • {moment(timestamp).format('MMM D, h:mm A')}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IoTimeOutline className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-lg mb-2">No commands yet</p>
                  <p className="text-gray-500 text-sm">
                    Start using voice commands to see your history here
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {userData?.history && userData.history.length > 0 && (
              <div className="p-6 border-t border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Total Commands: {userData.history.length}</span>
                  <span>Most recent first</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Home