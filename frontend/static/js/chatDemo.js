// Chat demo functionality
        class ChatDemo {
            constructor() {
                this.chatMessages = [
                    { type: "user", text: "What are your hours?" },
                    { type: "bot", text: "We're open Monday-Friday 9am-6pm, and Saturday 10am-4pm!" },
                    { type: "user", text: "Do you offer delivery?" },
                    { type: "bot", text: "Yes! We deliver within 5 miles for orders over $25. Delivery usually takes 30-45 minutes." },
                ];
                this.currentMessage = 0;
                this.chatDemo = document.getElementById('chat-demo');
                this.init();
            }

            init() {
                this.renderMessages();
                setInterval(() => {
                    this.currentMessage = (this.currentMessage + 1) % this.chatMessages.length;
                    this.renderMessages();
                }, 3000);
            }

            renderMessages() {
                const messagesToShow = this.chatMessages.slice(0, this.currentMessage + 1);
                this.chatDemo.innerHTML = '';
                
                messagesToShow.forEach((message, index) => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-fade-in`;
                    
                    const bubbleDiv = document.createElement('div');
                    bubbleDiv.className = `max-w-xs px-4 py-2 rounded-2xl ${
                        message.type === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                    }`;
                    bubbleDiv.textContent = message.text;
                    
                    messageDiv.appendChild(bubbleDiv);
                    this.chatDemo.appendChild(messageDiv);
                });
            }
        }

        // Initialize chat demo when page loads
        document.addEventListener('DOMContentLoaded', () => {
            new ChatDemo();
        });

        // Smooth scrolling for any anchor links
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });