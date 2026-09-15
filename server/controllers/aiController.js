export const aiHelp = async (req, res) => {
    try {
        const { messages = [] } = req.body;

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ success: false, message: "AI service is not configured" });
        }

        const safeMessages = Array.isArray(messages)
            ? messages.slice(-10).filter(message =>
                message && ["user", "assistant"].includes(message.role) && typeof message.content === "string"
            )
            : [];

        if (!safeMessages.length) {
            return res.status(400).json({ success: false, message: "Please enter a message" });
        }

        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || "gpt-5-mini",
                instructions: `You are CarRental AI Help, a simple support assistant for this car rental website.
Only help with this website and car-rental related questions such as browsing cars, checking availability, booking, rental dates, booking status, owner dashboard, managing cars, managing bookings, and eSewa payment.
Keep answers short, clear and beginner-friendly. Do not invent cars, prices, booking status, payment status, policies, or features that are not provided in the user's message or known from these instructions.
If the user asks something unrelated, politely say that you can only help with the CarRental website and its services.
Never ask for passwords, JWT tokens, eSewa credentials, card details, or secret API keys.`,
                input: safeMessages,
                max_output_tokens: 300
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("OpenAI error:", result);
            return res.status(502).json({ success: false, message: "AI service is temporarily unavailable" });
        }

        res.json({ success: true, reply: result.output_text || "Sorry, I could not generate a response." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Unable to contact AI service" });
    }
};
