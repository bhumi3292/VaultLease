// vaultlease_backend/controllers/ChatbotController.js

const ApiError = require("../utils/api_error");
const ApiResponse = require("../utils/api_response");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const Property = require("../models/Property");
const User = require("../models/User");
const Category = require("../models/Category");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateKnowledgeBase = async () => {
    let context = "";

    try {
        // Live spaces (recently added rooms)
        const recentProperties = await Property.find({}).sort({ createdAt: -1 }).limit(5).populate('categoryId', 'category_name');

        context += "LIVE SPACE INFORMATION (recent rooms):\n";
        if (recentProperties.length > 0) {
            recentProperties.forEach(prop => {
                context += `- Room: ${prop.title}, Department: ${prop.categoryId ? prop.categoryId.category_name : 'N/A'}, Location: ${prop.location || 'N/A'}, Capacity: ${prop.capacity || 'N/A'}.\n`;
            });
        } else {
            context += "No recent rooms available in the system.\n";
        }

        // Fetch some landlords (optional, but good for context if chatbot is asked about them)
        const landlords = await User.find({ role: "Landlord" }).limit(3); // Assuming 'role' field in User model

        context += "\nOUR DEPARTMENT ADMINS (examples):\n";
        if (landlords.length > 0) {
            landlords.forEach(landlord => {
                context += `- Name: ${landlord.fullName || 'N/A'}, Email: ${landlord.email || 'N/A'}.\n`;
            });
        } else {
            context += "No department admin information available.\n";
        }

        // Fetch property categories
        const categories = await Category.find({});
        context += "\nDEPARTMENTS:\n";
        if (categories.length > 0) {
            context += categories.map(cat => `- ${cat.category_name}`).join('\n') + '.\n';
        } else {
            context += "No departments defined.\n";
        }

    } catch (dbError) {
        console.error("Error fetching data for knowledge base:", dbError);
        context += "\nNote: Data retrieval failed, I might have limited real-time information.\n";
    }

    return context;
};

// This is the static personality and FAQ for your bot.
const systemPrompt = `You are VaultBot, the friendly and helpful chatbot assistant for "VaultLease", a university department room reservation system.

Your mission is to guide users through:
- Finding available department rooms and labs
- Making reservations for campus spaces
- Answering site-related or department-related questions
- Providing concise scheduling and reservation guidance

Tone:
- Be welcoming, professional, and use phrases related to campus spaces and bookings (e.g., "Let's find a suitable room for your class!", "Reservation confirmed!").
- Keep replies concise, clear, and helpful.

Capabilities:
1. **Space Recommendations:**
    - If the user asks about rooms, use the LIVE SPACE INFORMATION to recommend suitable options.
    - Ask follow-up questions like:
        - "Which department or lab do you need?"
        - "What date and time are you looking for?"
        - "What is the expected capacity or equipment needed?"
    - Then suggest a few rooms based on that info.

2. **Making Reservations:**
    - If the user wants to reserve a room, guide them to the "Add Reservation" page or explain the reservation steps.
    - Explain the process: "If you're an admin or student, you can reserve a department room on VaultLease. Select the department, choose an available slot, and confirm the reservation."

3. **Booking Process/Advice:**
    - If they ask about booking rules, offer general campus-relevant tips:
        - "Confirm department approval if required."
        - "Check equipment availability ahead of time."
        - "Note any cleanup or usage policies specific to the space."

4. **Other Questions:**
    - If you're unsure or the question is outside your scope, reply:
        - "I'm not sure about that, but you can browse available department rooms or check with your department admin for specifics."

👋 First Message:
Always start your very first response with:
"Hello! I'm VaultBot, your friendly VaultLease assistant. How can I help you find or reserve a department room today?"

🏡 LIVE DATA:
The latest data from our system will appear below. Use it when available to generate your responses.

---
[Insert LIVE SPACE INFORMATION and OUR DEPARTMENT ADMINS here]
[Insert DEPARTMENTS here]

📚 FAQs for VaultLease:

🏠 What is VaultLease and how does it work?
"VaultLease is a campus-focused platform for reserving university department rooms and labs. Browse available spaces, check schedules, and make reservations for classes, events, or research."

🛠️ Who manages VaultLease?
"VaultLease is maintained by the campus IT and facilities teams in collaboration with department administrators to simplify space management across campus."

👤 How do I update my profile?
"To update your profile, log in to your VaultLease account, go to your Profile, and select 'Edit Profile' to update your contact information and preferences."

🔍 How can I find rooms on VaultLease?
"Use the search filters to find rooms by department, capacity, equipment, or available time slots. Tell me what you need and I'll suggest options."

🔑 How do I reserve a room?
"Select the department and room, choose an available time slot, and confirm the reservation. Some rooms may require department approval."

🔐 I forgot my password. What do I do?
"Click the 'Forgot Password' link on the login page; we'll email instructions to reset your password."
`;


const handleChatQuery = async (req, res) => {
    try {
        const { query, history = [] } = req.body;

        if (!query) {
            // Using ApiError for validation errors
            throw new ApiError(400, "Query is required.");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const knowledgeBase = await generateKnowledgeBase();
        const fullSystemPrompt = systemPrompt + knowledgeBase;

        const formattedHistory = history.map(item => ({
            role: item.role,
            parts: [{ text: item.text }],
        })).filter(Boolean);

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: fullSystemPrompt }] },
                { role: "model", parts: [{ text: "Understood! I'm VaultBot, your assistant for VaultLease, ready to help users find rooms or manage department listings. Let's start!" }] },
                ...formattedHistory,
            ],
            generationConfig: {
                maxOutputTokens: 250,
            },
        });

        const result = await chat.sendMessage(query);
        const response = result.response;
        const text = response.text();

        // Using ApiResponse for successful responses
        return res.status(200).json(new ApiResponse(200, { reply: text }, "Chatbot responded successfully."));
    } catch (error) {
        console.error("Chatbot error:", error);
        // Ensure error is an instance of ApiError or default to a generic 500
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error); // Send the custom ApiError
        }
        // For unexpected errors, send a generic 500 ApiError
        return res.status(500).json(new ApiError(500, error.message || "Internal server error during chatbot processing."));
    }
};

module.exports = handleChatQuery;