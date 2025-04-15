import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; // Get the logged-in user's ID from the request object
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }) // Find all users except the logged-in user
      .select("-password"); // Exclude the password field from the result

    res.status(200).json(filteredUsers); // Send the filtered users as a response
  } catch (error) {
    console.error("Error fetching users for sidebar:", error.message); // Log the error message
    return res.status(500).json({ message: "Internal Server error" }); // Send a 500 Internal Server Error response
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id; // Get the logged-in user's ID from the request object

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); // Sort messages by creation date in ascending order
    res.status(200).json(messages); // Send the messages as a response
  } catch (error) {
    console.error("Error fetching messages:", error.message); // Log the error message
    return res.status(500).json({ message: "Internal Server error" }); // Send a 500 Internal Server Error response
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body; // Destructure the text and image from the request body
    const { id: receiverId } = req.params; // Get the receiver ID from the request parameters
    const senderId = req.user._id; // Get the sender ID from the request object

    let imageUrl;
    if (image) {
      //Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url; // Get the secure URL of the uploaded image
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl, // Use the image URL if provided
    });

    await newMessage.save(); // Save the new message to the database

    //to do: realtime fucntionality goes here => socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage); // Send the new message as a response
  } catch (error) {
    console.error("Error sending message:", error.message); // Log the error message
    res.status(500).json({ message: "Internal Server error" }); // Send a 500 Internal Server Error response
  }
};
