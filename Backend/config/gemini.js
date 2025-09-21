import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

const generateAIResponse = async (command, assistantName, userName) => {
    const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}.

    You are not Google. You will now behave like a voice-enabled assistant.
    
    Your task is to understand the user’s natural language input and respond with a JSON
    object like this:
    
    {
      "type": "general" | "google_search" | "youtube_search" | "youtube_play" |
               "get_time" | "get_date" | "get_day" | "get_month" | "calculator_open" |
               "instagram_open" | "facebook_open" | "weather-show",
      "userinput": "<original user input> {only remove your name from userinput if
                     exists} and agar kisi ne google ya youtube pe kuch search karne ko bola hai to
                     userInput me only bo search baala text jaye,
      "response": "<a short spoken response to read out loud to the user>"
    }
    
    Instructions:
    - "type": determine the intent of the user.
    - "userinput": original sentence the user spoke.
    - "response": A short voice-friendly reply, e.g., "Sure, playing it now", 
                  "Here's what I found", "Today is Tuesday", etc.
    
    Type meanings:
    - "general": if it’s a factual or informational question.
    - "google_search": if user wants to search something on Google.
    - "youtube_search": if user wants to search something on YouTube.
    - "youtube_play": if user wants to directly play a video or song.
    - "calculator_open": if user wants to open a calculator.
    - "instagram_open": if user wants to open Instagram.
    - "facebook_open": if user wants to open Facebook.
    - "weather-show": if user wants to know weather.
    - "get_time": if user asks for current time.
    - "get_date": if user asks for today’s date.
    - "get_day": if user asks what day it is.
    - "get_month": if user asks for the current month.
    
    Important:
    - Use ${userName} agar koi puche tume kisne banaya
    - Only respond with the JSON object, nothing else.
    - Ensure the JSON is valid and properly formatted.
    
    now your userInput - ${command}
    `;
    try {
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        // Extract the generated text from Gemini response
        const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
            throw new Error('No response generated from Gemini AI');
        }

        // Try to parse JSON response
        let parsedResponse;
        try {
            // Clean the response (remove markdown formatting if any)
            const cleanedResponse = generatedText.replace(/```json\n?|\n?```/g, '').trim();
            parsedResponse = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            // Return raw text if JSON parsing fails
            parsedResponse = {
                type: "general",
                userinput: prompt,
                response: generatedText
            };
        }

        return {
            success: true,
            response: parsedResponse,
            rawResponse: generatedText,
            usage: response.data?.usageMetadata || null
        };

    } catch (error) {
        console.error('Gemini AI Error:', error.response?.data || error.message);
        
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || 'Failed to generate AI response',
            response: null
        };
    }
};

export default generateAIResponse;