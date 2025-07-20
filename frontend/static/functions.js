const business_id = "nimbus-noodles"; // To be dynamic later

  function appendMessage(sender, text) {
    const div = document.createElement("div");
    div.className = "message " + sender;
    div.textContent = text;
    const chatbox = document.getElementById("chatbox");
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  async function sendMessage() {
    const input = document.getElementById("userInput");
    const msg = input.value.trim();
    if (!msg) return;

    appendMessage("user", msg);
    input.value = "";

     // 👇 Add typing indicator
    const typingDiv = document.createElement("div");
    typingDiv.className = "message bot typing";
    typingDiv.id = "typing-indicator";
    typingDiv.innerHTML = `
    <span class="typing-indicator">
        <span></span><span></span><span></span>
    </span>`;

    const chatbox = document.getElementById("chatbox");
    chatbox.appendChild(typingDiv);
    chatbox.scrollTop = chatbox.scrollHeight;

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: msg, business_id })
      });

      if (!response.ok) {
        appendMessage("bot", "Oops! Something went wrong.");
        return;
      }

      const data = await response.json();

    // 👇 Remove typing indicator before showing actual response
    typingDiv.remove();
    appendMessage("bot", data.answer || "No response.");
  } catch (err) {
    typingDiv.remove();
    appendMessage("bot", "Failed to reach server.");
    console.error("Fetch error:", err);
    }
  }

  document.getElementById("userInput").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  // toogling chat button

  function toggleChat() {
  const widget = document.getElementById("chatWidget");
  widget.classList.toggle("hidden");
  console.log("Chat toggled:", widget.classList);
}
    