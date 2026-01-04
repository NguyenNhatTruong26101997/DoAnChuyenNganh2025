// AI Chatbot Integration
// This is the UI for the chatbot, backend integration will be added later

class Chatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        // Create chatbot HTML structure
        this.createChatbotUI();

        // Add event listeners
        this.setupEventListeners();

        // Load chat history from localStorage
        this.loadChatHistory();

        // Add welcome message
        if (this.messages.length === 0) {
            this.addMessage('Xin chào! Tôi là trợ lý AI của Laptop World. Tôi có thể giúp gì cho bạn?', 'bot');
        }
    }

    createChatbotUI() {
        const chatbotHTML = `
      <!-- Chatbot Button -->
      <button class="chatbot-button" id="chatbotButton" aria-label="Open chatbot">
        <i class="fas fa-comments"></i>
      </button>
      
      <!-- Chatbot Window -->
      <div class="chatbot-window" id="chatbotWindow">
        <div class="chatbot-header">
          <div>
            <strong><i class="fas fa-robot"></i> AI Trợ lý</strong>
            <div style="font-size: 0.8rem; opacity: 0.9;">Online</div>
          </div>
          <button class="btn btn-link text-white" id="closeChatbot" aria-label="Close chatbot">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="chatbot-messages" id="chatbotMessages">
          <!-- Messages will be added here -->
        </div>
        
        <div class="chatbot-input">
          <input type="text" id="chatbotInput" placeholder="Nhập tin nhắn..." />
          <button class="btn btn-primary btn-sm" id="sendMessage">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;

        const container = document.createElement('div');
        container.innerHTML = chatbotHTML;
        document.body.appendChild(container);
    }

    setupEventListeners() {
        const chatbotButton = document.getElementById('chatbotButton');
        const closeChatbot = document.getElementById('closeChatbot');
        const sendButton = document.getElementById('sendMessage');
        const input = document.getElementById('chatbotInput');

        chatbotButton.addEventListener('click', () => this.toggle());
        closeChatbot.addEventListener('click', () => this.close());
        sendButton.addEventListener('click', () => this.sendMessage());

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbotWindow');

        if (this.isOpen) {
            window.classList.add('active');
        } else {
            window.classList.remove('active');
        }
    }

    open() {
        this.isOpen = true;
        document.getElementById('chatbotWindow').classList.add('active');
    }

    close() {
        this.isOpen = false;
        document.getElementById('chatbotWindow').classList.remove('active');
    }

    sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();

        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');

        // Clear input
        input.value = '';

        // Simulate AI response (in real app, this would call backend API)
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        }, 1000);
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Save to messages array
        this.messages.push({ text, sender, timestamp: Date.now() });

        // Save to localStorage
        this.saveChatHistory();
    }

    generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // Simple keyword-based responses (will be replaced with real AI later)
        if (lowerMessage.includes('giá') || lowerMessage.includes('bao nhiêu')) {
            return 'Laptop của chúng tôi có giá từ 15 triệu đến 48 triệu VNĐ. Bạn muốn tìm laptop trong khoảng giá nào?';
        }

        if (lowerMessage.includes('gaming') || lowerMessage.includes('chơi game')) {
            return 'Chúng tôi có các dòng laptop gaming từ Asus ROG, MSI Stealth với card đồ họa RTX 3060, 3070 Ti. Bạn có muốn xem chi tiết không?';
        }

        if (lowerMessage.includes('văn phòng') || lowerMessage.includes('office')) {
            return 'Laptop văn phòng phổ biến của chúng tôi là HP Pavilion, Acer Swift và Lenovo ThinkPad. Giá từ 15-42 triệu. Bạn cần cấu hình như thế nào?';
        }

        if (lowerMessage.includes('dell') || lowerMessage.includes('hp') || lowerMessage.includes('asus') ||
            lowerMessage.includes('lenovo') || lowerMessage.includes('msi') || lowerMessage.includes('acer')) {
            return 'Chúng tôi có nhiều mẫu laptop của hãng này. Bạn có thể xem tại trang Sản phẩm hoặc cho tôi biết cấu hình bạn cần?';
        }

        if (lowerMessage.includes('bảo hành')) {
            return 'Tất cả laptop đều có bảo hành chính hãng 12-24 tháng. Chúng tôi cũng hỗ trợ bảo hành tận nơi cho một số dòng cao cấp.';
        }

        if (lowerMessage.includes('thanh toán') || lowerMessage.includes('trả góp')) {
            return 'Chúng tôi hỗ trợ thanh toán: tiền mặt, chuyển khoản, thẻ tín dụng và trả góp 0% qua thẻ tín dụng. Bạn muốn biết thêm chi tiết?';
        }

        if (lowerMessage.includes('giao hàng') || lowerMessage.includes('ship')) {
            return 'Chúng tôi giao hàng toàn quốc trong 1-3 ngày. Miễn phí giao hàng cho đơn hàng trên 20 triệu trong nội thành TP.HCM.';
        }

        if (lowerMessage.includes('liên hệ') || lowerMessage.includes('số điện thoại')) {
            return 'Bạn có thể liên hệ với chúng tôi qua: Hotline: 0123 456 789, Email: info@laptopworld.vn hoặc đến trang Liên hệ.';
        }

        if (lowerMessage.includes('cảm ơn') || lowerMessage.includes('thanks')) {
            return 'Rất vui được hỗ trợ bạn! Nếu có thêm câu hỏi gì, đừng ngần ngại nhé! 😊';
        }

        // Default response
        return 'Cảm ơn bạn đã liên hệ! Tôi đang trong giai đoạn học hỏi. Bạn có thể hỏi tôi về giá, sản phẩm, bảo hành, thanh toán hoặc giao hàng. Hoặc bạn có thể liên hệ hotline 0123 456 789 để được hỗ trợ tốt hơn.';
    }

    saveChatHistory() {
        // Keep only last 50 messages
        const recentMessages = this.messages.slice(-50);
        localStorage.setItem('chatHistory', JSON.stringify(recentMessages));
    }

    loadChatHistory() {
        const history = localStorage.getItem('chatHistory');
        if (history) {
            this.messages = JSON.parse(history);

            // Display messages
            const messagesContainer = document.getElementById('chatbotMessages');
            this.messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.sender}`;
                messageDiv.textContent = msg.text;
                messagesContainer.appendChild(messageDiv);
            });
        }
    }

    clearHistory() {
        this.messages = [];
        localStorage.removeItem('chatHistory');
        document.getElementById('chatbotMessages').innerHTML = '';
        this.addMessage('Xin chào! Tôi là trợ lý AI của Laptop World. Tôi có thể giúp gì cho bạn?', 'bot');
    }
}

// Initialize chatbot when DOM is ready
let chatbot;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        chatbot = new Chatbot();
    });
} else {
    chatbot = new Chatbot();
}
