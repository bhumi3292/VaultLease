// backend/controllers/ChatbotController.js

const ApiError = require("../utils/api_error");
const ApiResponse = require("../utils/api_response");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const Asset = require("../models/Asset");
const User = require("../models/User");
const Category = require("../models/Category");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateKnowledgeBase = async () => {
    let context = "";

    try {
        const recentAssets = await Asset.find({}).sort({ createdAt: -1 }).limit(5).populate('category', 'category_name');

        context += "LIVE ASSET INFORMATION (recent):\n";
        if (recentAssets.length > 0) {
            recentAssets.forEach(asset => {
                context += `- Name: ${asset.name}, Type: ${asset.category ? asset.category.category_name : 'N/A'}, Location: ${asset.location}, Fee: $${asset.accessFee}, SN: ${asset.serialNumber}.\n`;
            });
        } else {
            context += "No recent assets available.\n";
        }

        // Fetch some administrators
        const admins = await User.find({ role: "ADMINISTRATOR" }).limit(3);

        context += "\nOUR ADMINISTRATORS (contacts):\n";
        if (admins.length > 0) {
            admins.forEach(admin => {
                context += `- Name: ${admin.fullName}, Dept: ${admin.department || 'N/A'}, Email: ${admin.email}.\n`;
            });
        } else {
            context += "No administrator info available.\n";
        }

        // Fetch categories
        const categories = await Category.find({});
        context += "\nASSET CATEGORIES:\n";
        if (categories.length > 0) {
            context += categories.map(cat => `- ${cat.category_name}`).join('\n') + '.\n';
        } else {
            context += "No asset categories defined.\n";
        }

    } catch (dbError) {
        console.error("Error fetching data for knowledge base:", dbError);
        context += "\nNote: Data retrieval failed.\n";
    }

    return context;
};

// This is the static personality and FAQ for your bot.
const systemPrompt = `You are VaultBot, the AI assistant for "VaultLese", an institutional asset access system.

Your mission is to guide students and faculty through:
- Finding and requesting equipment or rooms
- Understanding access policies
- Contacting administrators

Tone:
- Professional, academic, and helpful.
- Concise and precise.

Capabilities:
1. **Asset Recommendations:**
    - Use LIVE ASSET INFORMATION.
    - Ask: "What equipment do you need?" or "Which department?"

2. **Requesting Access:**
    - Guide to "Assets" page -> "Request Access" button.
    - Requirements: University ID, Department approval.

3. **Policies:**
    - "Return assets on time to avoid late fees."
    - "All requests require valid University credentials."

👋 First Message:
"Hello! I'm VaultBot. How can I assist you with accessing university resources today?"

🏡 LIVE DATA:
[Insert LIVE ASSET INFORMATION and OUR ADMINISTRATORS here]
[Insert ASSET CATEGORIES here]

📚 FAQs:

🏠 What is VaultLese?
"VaultLese is the university's centralized system for managing and leasing academic assets like lab equipment, rooms, and books."

🔑 How do I request an item?
"Log in with your university account, browse the 'Assets' catalog, and click 'Request Access' on the item you need."

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
                { role: "model", parts: [{ text: "Understood! I'm VaultBot, your assistant for VaultLease, ready to help users find assets or manage their listings. Let's start!" }] },
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