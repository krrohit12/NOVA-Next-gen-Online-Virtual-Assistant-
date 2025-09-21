import uploadOnCloudinary from "../config/cloudinary.js"
import generateAIResponse from "../config/gemini.js"
import User from "../models/user.model.js"
export const getCurrentUser=async(req , res)=>{
    try{
        const userId=req.userId
        const user =await User.findById(userId).select("-password")
        if(!user){
            return res.status(400).json({message:"user not found"})
        }
        return res.status(200).json(user)
    }catch(error){
        return res.status(400).json({message:"current user error"})
    }
}

export const updateAssistant=async(req,res)=>{
    try{
        const {assistantName,imageUrl}=req.body
        let assistantImage;
        if(req.file){
            assistantImage=await uploadOnCloudinary(req.file.path)
        }
        else{
            assistantImage=imageUrl
        }

        const user=await User.findByIdAndUpdate(req.userId,{
            assistantName,assistantImage
        },{new:true}).select("-password")
        return res.status(200).json(user)
    }catch(error){
        return res.status(400).json({message:"update assistant error"})
    }
}


export const askToAssistant = async (req, res) => {
    try {
        const { command } = req.body
        
        // Validate command
        if (!command || command.trim() === '') {
            return res.status(400).json({ message: "Command is required" })
        }
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const userName = user.name
        const assistantName = user.assistantName

        // Get AI response
        const result = await generateAIResponse(command, assistantName, userName)

        if (!result.success) {
            return res.status(500).json({
                message: "AI response error",
                error: result.error
            })
        }

        // Extract type and other data from Gemini response
        const aiResponse = result.response
        const responseType = aiResponse.type || 'general'
        const userInput = aiResponse.userinput || command
        const assistantReply = aiResponse.response || 'Sorry, I could not process your request.'

        // Create history entry with both command and response
        const historyEntry = {
            command: command,
            response: assistantReply,
            type: responseType,
            timestamp: new Date()
        }

        // Clear old history data that doesn't match new schema and add new entry
        user.history = [historyEntry]
        await user.save()

        console.log('Response Type:', responseType)
        console.log('User Input:', userInput)
        console.log('Assistant Reply:', assistantReply)

        // Return structured response
        return res.status(200).json({
            success: true,
            type: responseType,
            userInput: userInput,
            assistantResponse: assistantReply,
            fullResponse: aiResponse
        })
        
    } catch (error) {
        console.error('Ask Assistant Error:', error)
        return res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        })
    }
}