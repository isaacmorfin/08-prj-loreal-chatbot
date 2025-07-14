// System prompt for the AI
const systemPrompt = {
  role: "system",
  content:
    "You are a helpful assistant for L’Oréal. Only answer questions related to L’Oréal products, beauty routines, and product recommendations. If asked about anything else, politely explain that you can only help with L’Oréal products and routines.",
};

// Conversation history array
let conversation = [systemPrompt];

// Track user's name (optional, can be set from first message)
let userName = "";

/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.innerHTML = `<div class="msg ai">👋 Hello! How can I help you today?</div>`;

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user's message
  const userMessage = userInput.value;

  // If user's name is not set, try to extract from first message (optional)
  if (!userName) {
    // Simple check for "My name is ..."
    const match = userMessage.match(/my name is ([a-zA-Z0-9_\- ]+)/i);
    if (match) {
      userName = match[1].trim();
    }
  }

  // Add user message to conversation history
  conversation.push({ role: "user", content: userMessage });

  // Remove 'new' class from previous bubbles
  const oldNewMsgs = chatWindow.querySelectorAll(".msg.new");
  oldNewMsgs.forEach((el) => el.classList.remove("new"));

  // Display user's latest question above the response with 'new' class
  chatWindow.innerHTML += `<div class="msg user new"><strong>You asked:</strong> ${userMessage}</div>`;

  // Disable input and button
  userInput.disabled = true;
  document.getElementById("sendBtn").disabled = true;

  // Call your Cloudflare Worker API
  const response = await fetch("https://sparky.imorfin2.workers.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: conversation }),
  });

  const data = await response.json();
  const aiReply = data.choices[0].message.content;

  // Add AI reply to conversation history
  conversation.push({ role: "assistant", content: aiReply });

  // Remove 'new' class from previous bubbles
  const oldNewMsgs2 = chatWindow.querySelectorAll(".msg.new");
  oldNewMsgs2.forEach((el) => el.classList.remove("new"));

  // Show AI's reply in chat window as a distinct bubble with 'new' class
  chatWindow.innerHTML += `<div class="msg ai new"><strong>Assistant:</strong> ${aiReply}</div>`;

  // Scroll to bottom for new messages (with a slight delay)
  setTimeout(() => {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, 50);

  // Clear input
  userInput.value = "";

  // Re-enable input and button after response
  userInput.disabled = false;
  document.getElementById("sendBtn").disabled = false;
  userInput.focus();
});
