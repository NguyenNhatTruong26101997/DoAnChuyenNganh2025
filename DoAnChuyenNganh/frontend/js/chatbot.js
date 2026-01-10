// AI Chatbot Integration
// This is the UI for the chatbot, backend integration will be added later

class Chatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.conversationContext = {
            lastBudget: null,
            lastCategory: null,
            lastBrand: null,
            userPreferences: {},
            viewedProducts: []
        };
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

    async sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();

        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');

        // Clear input
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Generate AI response
        try {
            const response = await this.generateResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi. Vui lòng thử lại!', 'bot');
        }
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbotMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        // Support multi-line text
        messageDiv.style.whiteSpace = 'pre-line';
        messageDiv.textContent = text;

        // Add quick action buttons for bot messages
        if (sender === 'bot' && this.conversationContext.viewedProducts.length > 0) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            actionsDiv.style.marginTop = '8px';
            actionsDiv.style.display = 'flex';
            actionsDiv.style.gap = '5px';
            actionsDiv.style.flexWrap = 'wrap';
            
            // Quick action buttons
            const actions = [
                { text: '👍 Hữu ích', action: 'Cảm ơn!' },
                { text: '🔍 Chi tiết', action: 'Chi tiết sản phẩm 1' },
                { text: '➕ Xem thêm', action: 'Còn sản phẩm nào khác' }
            ];
            
            actions.forEach(({ text, action }) => {
                const btn = document.createElement('button');
                btn.textContent = text;
                btn.className = 'quick-action-btn';
                btn.style.cssText = 'padding: 4px 8px; font-size: 0.85rem; border: 1px solid #ddd; border-radius: 12px; background: white; cursor: pointer; transition: all 0.2s;';
                btn.onmouseover = () => btn.style.background = '#f0f0f0';
                btn.onmouseout = () => btn.style.background = 'white';
                btn.onclick = () => {
                    document.getElementById('chatbotInput').value = action;
                    this.sendMessage();
                };
                actionsDiv.appendChild(btn);
            });
            
            messageDiv.appendChild(actionsDiv);
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Save to messages array
        this.messages.push({ text, sender, timestamp: Date.now() });

        // Save to localStorage
        this.saveChatHistory();
    }

    async generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // ============================================
        // PRIORITY 0: CONTEXT-AWARE & SMART FEATURES
        // ============================================

        // === NHỚ NGÂN SÁCH & GỢI Ý TIẾP ===
        if ((lowerMessage.includes('còn') || lowerMessage.includes('thêm') || lowerMessage.includes('khác')) && 
            this.conversationContext.lastBudget) {
            const budget = this.conversationContext.lastBudget;
            try {
                const response = await api.get(`/products?minPrice=${budget.min}&maxPrice=${budget.max}&limit=5&sort=popular`);
                if (response.success && response.data.products && response.data.products.length > 0) {
                    // Filter out viewed products
                    const newProducts = response.data.products.filter(p => 
                        !this.conversationContext.viewedProducts.includes(p.IdSanPham)
                    );
                    
                    if (newProducts.length > 0) {
                        let result = `💡 Thêm gợi ý trong ngân sách ${formatCurrency(budget.min)}-${formatCurrency(budget.max)}:\n\n`;
                        newProducts.slice(0, 3).forEach((p, i) => {
                            result += `${i + 1}. ${p.TenSanPham}\n   💰 ${formatCurrency(p.GiaSanPham)}\n   🏢 ${p.TenThuongHieu}\n   ⭐ ${p.TenDanhMuc || 'Đa năng'}\n\n`;
                            this.conversationContext.viewedProducts.push(p.IdSanPham);
                        });
                        result += `Bạn muốn xem chi tiết sản phẩm nào?`;
                        return result;
                    }
                }
            } catch (error) {
                console.error('Error fetching more products:', error);
            }
        }

        // === XEM CHI TIẾT SẢN PHẨM (Smart Recognition) ===
        if ((lowerMessage.includes('chi tiết') || lowerMessage.includes('xem thêm') || 
             lowerMessage.includes('thông tin') || lowerMessage.includes('cái số')) && 
            (lowerMessage.includes('1') || lowerMessage.includes('2') || lowerMessage.includes('3') || 
             lowerMessage.includes('4') || lowerMessage.includes('5') || lowerMessage.includes('đầu') || 
             lowerMessage.includes('thứ'))) {
            
            // Extract product number
            let productNum = 1;
            if (lowerMessage.includes('2') || lowerMessage.includes('hai')) productNum = 2;
            else if (lowerMessage.includes('3') || lowerMessage.includes('ba')) productNum = 3;
            else if (lowerMessage.includes('4') || lowerMessage.includes('bốn')) productNum = 4;
            else if (lowerMessage.includes('5') || lowerMessage.includes('năm')) productNum = 5;
            
            if (this.conversationContext.viewedProducts.length >= productNum) {
                const productId = this.conversationContext.viewedProducts[productNum - 1];
                try {
                    const response = await api.get(`/products/${productId}`);
                    if (response.success && response.data) {
                        const p = response.data;
                        let result = `📱 ${p.TenSanPham}\n\n`;
                        result += `💰 Giá: ${formatCurrency(p.GiaSanPham)}\n`;
                        result += `🏢 Hãng: ${p.TenThuongHieu}\n`;
                        result += `📂 Danh mục: ${p.TenDanhMuc || 'N/A'}\n`;
                        result += `📦 Còn lại: ${p.SoLuongSanPham} sản phẩm\n`;
                        result += `⭐ Đánh giá: ${p.DiemTrungBinh || 'Chưa có'}/5\n\n`;
                        
                        if (p.MoTa) {
                            const shortDesc = p.MoTa.substring(0, 200);
                            result += `📝 Mô tả: ${shortDesc}${p.MoTa.length > 200 ? '...' : ''}\n\n`;
                        }
                        
                        result += `🛒 Bạn muốn:\n- "Thêm vào giỏ" để mua\n- "So sánh với [tên SP]" để so sánh\n- "Sản phẩm tương tự" để xem thêm`;
                        
                        return result;
                    }
                } catch (error) {
                    console.error('Error fetching product details:', error);
                }
            }
            
            return '🤔 Bạn muốn xem chi tiết sản phẩm nào? Hãy cho tôi biết số thứ tự (1, 2, 3...) hoặc tên sản phẩm!';
        }

        // === SẢN PHẨM TƯƠNG TỰ ===
        if ((lowerMessage.includes('tương tự') || lowerMessage.includes('giống') || 
             lowerMessage.includes('như vậy')) && this.conversationContext.viewedProducts.length > 0) {
            const lastProductId = this.conversationContext.viewedProducts[this.conversationContext.viewedProducts.length - 1];
            try {
                const productResponse = await api.get(`/products/${lastProductId}`);
                if (productResponse.success && productResponse.data) {
                    const product = productResponse.data;
                    const minPrice = product.GiaSanPham * 0.8;
                    const maxPrice = product.GiaSanPham * 1.2;
                    
                    const response = await api.get(`/products?minPrice=${minPrice}&maxPrice=${maxPrice}&limit=5`);
                    if (response.success && response.data.products && response.data.products.length > 0) {
                        let result = `🔍 Sản phẩm tương tự ${product.TenSanPham}:\n\n`;
                        response.data.products
                            .filter(p => p.IdSanPham !== lastProductId)
                            .slice(0, 4)
                            .forEach((p, i) => {
                                result += `${i + 1}. ${p.TenSanPham}\n   💰 ${formatCurrency(p.GiaSanPham)}\n   🏢 ${p.TenThuongHieu}\n\n`;
                                this.conversationContext.viewedProducts.push(p.IdSanPham);
                            });
                        result += `Bạn thích sản phẩm nào?`;
                        return result;
                    }
                }
            } catch (error) {
                console.error('Error fetching similar products:', error);
            }
        }

        // === THÊM VÀO GIỎ HÀNG (Smart) ===
        if ((lowerMessage.includes('thêm vào giỏ') || lowerMessage.includes('mua') || 
             lowerMessage.includes('đặt hàng')) && 
            (lowerMessage.includes('1') || lowerMessage.includes('2') || lowerMessage.includes('3') || 
             lowerMessage.includes('cái này') || lowerMessage.includes('sản phẩm này'))) {
            
            const token = localStorage.getItem('token');
            if (!token) {
                return '🔐 Bạn cần đăng nhập để thêm vào giỏ hàng!\n\nVui lòng đăng nhập tại trang Tài khoản.';
            }
            
            // Extract product number
            let productNum = 1;
            if (lowerMessage.includes('2') || lowerMessage.includes('hai')) productNum = 2;
            else if (lowerMessage.includes('3') || lowerMessage.includes('ba')) productNum = 3;
            
            if (this.conversationContext.viewedProducts.length >= productNum) {
                const productId = this.conversationContext.viewedProducts[productNum - 1];
                try {
                    const response = await api.post('/cart', {
                        IdSanPham: productId,
                        SoLuong: 1
                    });
                    
                    if (response.success) {
                        return '✅ Đã thêm vào giỏ hàng!\n\n🛒 Bạn có thể:\n- "Xem giỏ hàng" để kiểm tra\n- "Thanh toán" để đặt hàng\n- Tiếp tục mua sắm';
                    } else {
                        return '❌ Không thể thêm vào giỏ hàng. Vui lòng thử lại!';
                    }
                } catch (error) {
                    console.error('Error adding to cart:', error);
                    return '❌ Có lỗi xảy ra. Vui lòng thử lại sau!';
                }
            }
            
            return '🤔 Bạn muốn thêm sản phẩm nào vào giỏ? Hãy cho tôi biết số thứ tự!';
        }

        // === XEM GIỎ HÀNG ===
        if (lowerMessage.includes('giỏ hàng') || lowerMessage.includes('gio hang')) {
            const token = localStorage.getItem('token');
            if (!token) {
                return '🔐 Bạn cần đăng nhập để xem giỏ hàng!\n\nVui lòng đăng nhập tại trang Tài khoản.';
            }
            
            try {
                const response = await api.get('/cart');
                if (response.success && response.data && response.data.items && response.data.items.length > 0) {
                    let result = `🛒 Giỏ hàng của bạn (${response.data.items.length} sản phẩm):\n\n`;
                    let total = 0;
                    
                    response.data.items.forEach((item, i) => {
                        const itemTotal = item.GiaSanPham * item.SoLuong;
                        total += itemTotal;
                        result += `${i + 1}. ${item.TenSanPham}\n`;
                        result += `   💰 ${formatCurrency(item.GiaSanPham)} x ${item.SoLuong}\n`;
                        result += `   = ${formatCurrency(itemTotal)}\n\n`;
                    });
                    
                    result += `💵 Tổng cộng: ${formatCurrency(total)}\n\n`;
                    result += `🎯 Bạn có thể:\n- "Thanh toán" để đặt hàng\n- "Xóa sản phẩm [số]" để xóa\n- Tiếp tục mua sắm`;
                    
                    return result;
                } else {
                    return '🛒 Giỏ hàng trống!\n\nHãy khám phá các sản phẩm tuyệt vời của chúng tôi!';
                }
            } catch (error) {
                console.error('Error fetching cart:', error);
                return '❌ Không thể lấy thông tin giỏ hàng. Vui lòng thử lại!';
            }
        }

        // === THANH TOÁN ===
        if (lowerMessage.includes('thanh toán') && !lowerMessage.includes('hình thức')) {
            const token = localStorage.getItem('token');
            if (!token) {
                return '🔐 Bạn cần đăng nhập để thanh toán!\n\nVui lòng đăng nhập tại trang Tài khoản.';
            }
            
            return '💳 Để thanh toán, vui lòng:\n\n1. Vào trang Giỏ hàng\n2. Kiểm tra sản phẩm\n3. Click "Thanh toán"\n4. Điền thông tin giao hàng\n\nHoặc click vào biểu tượng giỏ hàng ở góc trên!';
        }

        // === GỢI Ý THÔNG MINH DỰA TRÊN LỊCH SỬ ===
        if (lowerMessage.includes('gợi ý') || lowerMessage.includes('đề xuất') || 
            lowerMessage.includes('nên mua gì')) {
            
            // Check user's order history for preferences
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const ordersResponse = await api.get('/orders/my-orders');
                    if (ordersResponse.success && ordersResponse.data && ordersResponse.data.length > 0) {
                        // User has order history - suggest based on that
                        return '💡 Dựa trên lịch sử mua hàng của bạn, tôi có thể gợi ý:\n\n🎯 Để gợi ý chính xác, cho tôi biết:\n- Ngân sách? (VD: "25 triệu")\n- Mục đích? (gaming/văn phòng/đồ họa)\n- Thương hiệu ưa thích?\n\nHoặc hỏi: "Laptop gaming 30 triệu"';
                    }
                } catch (error) {
                    console.error('Error fetching order history:', error);
                }
            }
            
            // New user - ask for preferences
            return '💡 Để gợi ý sản phẩm phù hợp, cho tôi biết:\n\n1️⃣ Ngân sách? (VD: "20-30 triệu")\n2️⃣ Mục đích sử dụng?\n   • Gaming/chơi game\n   • Văn phòng/làm việc\n   • Đồ họa/thiết kế\n   • Học tập/sinh viên\n   • Lập trình/code\n\n3️⃣ Yêu cầu đặc biệt?\n   • Nhẹ, mỏng\n   • Pin trâu\n   • Màn hình đẹp\n\nVí dụ: "Laptop gaming 30 triệu"';
        }

        // === TOP BÁN CHẠY / PHỔ BIẾN ===
        if (lowerMessage.includes('bán chạy') || lowerMessage.includes('phổ biến') || 
            lowerMessage.includes('nhiều người mua') || lowerMessage.includes('hot nhất')) {
            try {
                const response = await api.get('/products?limit=5&sort=popular');
                if (response.success && response.data.products && response.data.products.length > 0) {
                    let result = `🔥 TOP 5 Laptop bán chạy:\n\n`;
                    response.data.products.forEach((p, i) => {
                        result += `${i + 1}. ${p.TenSanPham}\n   💰 ${formatCurrency(p.GiaSanPham)}\n   🏢 ${p.TenThuongHieu}\n   ⭐ ${p.DiemTrungBinh || 'N/A'}/5\n\n`;
                        this.conversationContext.viewedProducts.push(p.IdSanPham);
                    });
                    result += `Bạn muốn xem chi tiết sản phẩm nào?`;
                    return result;
                }
            } catch (error) {
                console.error('Error fetching popular products:', error);
            }
        }

        // === ĐÁNH GIÁ CAO / CHẤT LƯỢNG ===
        if (lowerMessage.includes('đánh giá cao') || lowerMessage.includes('chất lượng tốt') || 
            lowerMessage.includes('review tốt') || lowerMessage.includes('5 sao')) {
            try {
                const response = await api.get('/products?limit=100');
                if (response.success && response.data.products) {
                    // Filter products with high ratings
                    const topRated = response.data.products
                        .filter(p => p.DiemTrungBinh >= 4.5)
                        .sort((a, b) => b.DiemTrungBinh - a.DiemTrungBinh)
                        .slice(0, 5);
                    
                    if (topRated.length > 0) {
                        let result = `⭐ TOP Laptop đánh giá cao:\n\n`;
                        topRated.forEach((p, i) => {
                            result += `${i + 1}. ${p.TenSanPham}\n   ⭐ ${p.DiemTrungBinh}/5\n   💰 ${formatCurrency(p.GiaSanPham)}\n   🏢 ${p.TenThuongHieu}\n\n`;
                            this.conversationContext.viewedProducts.push(p.IdSanPham);
                        });
                        result += `Bạn muốn xem chi tiết sản phẩm nào?`;
                        return result;
                    }
                }
            } catch (error) {
                console.error('Error fetching top rated products:', error);
            }
        }

        // === SO SÁNH NHANH (Quick Compare) ===
        if (lowerMessage.includes('so sánh nhanh') || 
            (lowerMessage.includes('so sánh') && (lowerMessage.includes('1') || lowerMessage.includes('2')))) {
            
            if (this.conversationContext.viewedProducts.length >= 2) {
                const id1 = this.conversationContext.viewedProducts[0];
                const id2 = this.conversationContext.viewedProducts[1];
                
                try {
                    const [p1Response, p2Response] = await Promise.all([
                        api.get(`/products/${id1}`),
                        api.get(`/products/${id2}`)
                    ]);
                    
                    if (p1Response.success && p2Response.success) {
                        const p1 = p1Response.data;
                        const p2 = p2Response.data;
                        
                        let result = `⚖️ SO SÁNH NHANH:\n\n`;
                        result += `1️⃣ ${p1.TenSanPham}\n`;
                        result += `   💰 ${formatCurrency(p1.GiaSanPham)}\n`;
                        result += `   ⭐ ${p1.DiemTrungBinh || 'N/A'}/5\n`;
                        result += `   📦 Còn: ${p1.SoLuongSanPham}\n\n`;
                        
                        result += `2️⃣ ${p2.TenSanPham}\n`;
                        result += `   💰 ${formatCurrency(p2.GiaSanPham)}\n`;
                        result += `   ⭐ ${p2.DiemTrungBinh || 'N/A'}/5\n`;
                        result += `   📦 Còn: ${p2.SoLuongSanPham}\n\n`;
                        
                        const priceDiff = Math.abs(p1.GiaSanPham - p2.GiaSanPham);
                        result += `💡 Chênh lệch giá: ${formatCurrency(priceDiff)}\n`;
                        
                        if (p1.DiemTrungBinh && p2.DiemTrungBinh) {
                            if (p1.DiemTrungBinh > p2.DiemTrungBinh) {
                                result += `⭐ Sản phẩm 1 được đánh giá cao hơn\n`;
                            } else if (p2.DiemTrungBinh > p1.DiemTrungBinh) {
                                result += `⭐ Sản phẩm 2 được đánh giá cao hơn\n`;
                            }
                        }
                        
                        return result;
                    }
                } catch (error) {
                    console.error('Error comparing products:', error);
                }
            }
            
            return '🤔 Bạn cần xem ít nhất 2 sản phẩm trước để so sánh nhanh!\n\nHãy tìm kiếm hoặc xem danh sách sản phẩm trước.';
        }

        // ============================================
        // PRIORITY 1: THÔNG TIN CỬA HÀNG (STATIC)
        // ============================================

        // === XIN CHÀO ===
        if (lowerMessage.includes('xin chào') || lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage === 'chào') {
            const hour = new Date().getHours();
            let greeting = '👋 Xin chào';
            if (hour < 12) greeting = '🌅 Chào buổi sáng';
            else if (hour < 18) greeting = '☀️ Chào buổi chiều';
            else greeting = '🌙 Chào buổi tối';
            
            const token = localStorage.getItem('token');
            let userName = '';
            if (token) {
                try {
                    const userResponse = await api.get('/auth/profile');
                    if (userResponse.success && userResponse.data) {
                        userName = `, ${userResponse.data.HoTen}`;
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            }
            
            return `${greeting}${userName}! Tôi là trợ lý AI của Laptop World. 🤖\n\n💡 Tôi có thể giúp bạn:\n✅ Tìm laptop phù hợp\n✅ So sánh sản phẩm\n✅ Tư vấn cấu hình\n✅ Kiểm tra đơn hàng\n✅ Thông tin khuyến mãi\n\n🎯 Hãy thử hỏi:\n- "Laptop gaming 30 triệu"\n- "So sánh Dell và HP"\n- "Sản phẩm bán chạy"\n\nBạn cần hỗ trợ gì?`;
        }

        // === CẢM ƠN ===
        if (lowerMessage.includes('cảm ơn') || lowerMessage.includes('thanks') || lowerMessage.includes('cám ơn') || lowerMessage.includes('thank')) {
            const responses = [
                '😊 Rất vui được hỗ trợ bạn! Nếu cần thêm thông tin, đừng ngần ngại hỏi nhé.',
                '🎉 Không có gì! Chúc bạn tìm được chiếc laptop ưng ý!',
                '💙 Luôn sẵn sàng giúp đỡ! Hãy quay lại nếu cần tư vấn thêm.',
                '✨ Cảm ơn bạn đã tin tưởng Laptop World!'
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        // === PHÀN NÀN / KHÔNG HÀI LÒNG ===
        if (lowerMessage.includes('tệ') || lowerMessage.includes('kém') || lowerMessage.includes('không tốt') || 
            lowerMessage.includes('thất vọng') || lowerMessage.includes('không hài lòng')) {
            return '😔 Chúng tôi rất tiếc khi bạn không hài lòng!\n\n📞 Vui lòng liên hệ:\n- Hotline: 0123 456 789\n- Email: laptopworld@gmail.com\n\nChúng tôi sẽ hỗ trợ bạn tốt nhất có thể! 💪';
        }

        // === KHEN NGỢI ===
        if (lowerMessage.includes('tuyệt') || lowerMessage.includes('hay') || lowerMessage.includes('tốt quá') || 
            lowerMessage.includes('giỏi') || lowerMessage.includes('xuất sắc')) {
            return '🥰 Cảm ơn bạn rất nhiều! Đó là động lực để chúng tôi phục vụ tốt hơn!\n\n💪 Hãy tiếp tục hỏi nếu cần hỗ trợ thêm nhé!';
        }

        // === HỎI VỀ BOT ===
        if (lowerMessage.includes('bạn là ai') || lowerMessage.includes('bạn là gì') || 
            lowerMessage.includes('tên bạn') || lowerMessage.includes('ai tạo ra bạn')) {
            return '🤖 Tôi là AI Chatbot của Laptop World!\n\n✨ Được tạo ra để:\n- Tư vấn laptop 24/7\n- Giúp bạn tìm sản phẩm phù hợp\n- Trả lời mọi thắc mắc\n- So sánh và đề xuất sản phẩm\n\n💡 Tôi học hỏi từ hàng nghìn sản phẩm và phản hồi khách hàng để phục vụ bạn tốt nhất!\n\nBạn muốn tìm laptop gì?';
        }

        // === HỎI VỀ KHẢ NĂNG ===
        if (lowerMessage.includes('bạn có thể') || lowerMessage.includes('bạn làm được gì') || 
            lowerMessage.includes('chức năng')) {
            return '💪 Tôi có thể giúp bạn:\n\n🔍 TÌM KIẾM & SO SÁNH:\n- Tìm laptop theo giá, hãng, cấu hình\n- So sánh sản phẩm chi tiết\n- Xem sản phẩm tương tự\n\n💡 TƯ VẤN THÔNG MINH:\n- Gợi ý theo ngân sách\n- Tư vấn theo nhu cầu (gaming, văn phòng...)\n- So sánh thương hiệu\n\n🛒 MUA SẮM:\n- Thêm vào giỏ hàng\n- Xem giỏ hàng\n- Kiểm tra đơn hàng\n\n📊 THÔNG TIN:\n- Flash Sale, khuyến mãi\n- Tin tức công nghệ\n- Thông tin cửa hàng\n\n🎯 Hãy thử hỏi tôi bất cứ điều gì!';
        }

        // === GIỜ MỞ CỬA ===
        if (lowerMessage.includes('giờ mở cửa') || lowerMessage.includes('giờ làm việc') || lowerMessage.includes('mở cửa lúc')) {
            return '🕐 Laptop World mở cửa:\n- Thứ 2 - Thứ 6: 8:00 - 20:00\n- Thứ 7 - CN: 9:00 - 21:00\nChúng tôi luôn sẵn sàng phục vụ bạn!';
        }

        // === THÔNG TIN CỬA HÀNG TỔNG QUAN ===
        if ((lowerMessage.includes('cửa hàng') || lowerMessage.includes('laptop world')) && 
            !lowerMessage.includes('địa chỉ') && !lowerMessage.includes('giờ') && 
            !lowerMessage.includes('liên hệ') && !lowerMessage.includes('bảo hành') &&
            !lowerMessage.includes('sản phẩm') && !lowerMessage.includes('có những') &&
            !lowerMessage.includes('có gì') && !lowerMessage.includes('có bao nhiêu')) {
            return '🏪 LAPTOP WORLD - Cửa hàng laptop uy tín\n\n📍 Địa chỉ: 227 Nguyễn Văn Cừ, P.4, Q.5, TP.HCM\n📞 Hotline: 0123 456 789\n📧 Email: laptopworld@gmail.com\n🕐 Giờ mở cửa:\n   • T2-T6: 8:00 - 20:00\n   • T7-CN: 9:00 - 21:00\n\n💼 Chuyên cung cấp:\n• Laptop Gaming, Văn phòng, Đồ họa\n• Thương hiệu: Dell, HP, Asus, Lenovo, MSI, Acer\n• Bảo hành chính hãng 12-24 tháng\n• Giao hàng toàn quốc, trả góp 0%\n\nBạn cần tư vấn gì thêm?';
        }

        // === ĐỊA CHỈ ===
        if (lowerMessage.includes('địa chỉ') || lowerMessage.includes('ở đâu') || lowerMessage.includes('chỗ nào')) {
            return '📍 Địa chỉ cửa hàng:\n227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM\n\nBạn có thể đến trực tiếp hoặc gọi hotline 0123 456 789 để được tư vấn!';
        }

        // === LIÊN HỆ ===
        if (lowerMessage.includes('liên hệ') || lowerMessage.includes('số điện thoại') || lowerMessage.includes('hotline') || lowerMessage.includes('email')) {
            return '📞 Thông tin liên hệ:\n- Hotline: 0123 456 789\n- Email: laptopworld@gmail.com\n- Website: laptopworld.vn\n\nChúng tôi luôn sẵn sàng hỗ trợ 24/7!';
        }

        // === BẢO HÀNH ===
        if (lowerMessage.includes('bảo hành')) {
            return '🛡️ Chính sách bảo hành:\n- Bảo hành chính hãng: 12-24 tháng\n- Đổi mới trong 7 ngày nếu lỗi NSX\n- Hỗ trợ kỹ thuật miễn phí trọn đời\n- Bảo hành tận nơi cho laptop cao cấp\n\nYên tâm mua sắm!';
        }

        // === THANH TOÁN ===
        if (lowerMessage.includes('thanh toán') || lowerMessage.includes('trả góp')) {
            return '💳 Hình thức thanh toán:\n- Tiền mặt (COD)\n- Chuyển khoản ngân hàng\n- Thẻ tín dụng/ghi nợ\n- Trả góp 0% qua thẻ tín dụng (3-12 tháng)\n- Trả góp qua công ty tài chính\n\nLinh hoạt, tiện lợi!';
        }

        // === GIAO HÀNG ===
        if (lowerMessage.includes('giao hàng') || lowerMessage.includes('ship') || lowerMessage.includes('vận chuyển')) {
            return '🚚 Chính sách giao hàng:\n- Giao hàng toàn quốc 1-3 ngày\n- Miễn phí ship nội thành TP.HCM (đơn >20 triệu)\n- Kiểm tra hàng trước khi thanh toán\n- Đóng gói cẩn thận, bảo hiểm hàng hóa\n\nGiao nhanh, an toàn!';
        }

        // === PHỤ KIỆN ===
        if (lowerMessage.includes('phụ kiện') || lowerMessage.includes('chuột') || lowerMessage.includes('balo')) {
            return '🎒 Phụ kiện laptop:\n- Chuột không dây: 200k-500k\n- Balo laptop: 300k-800k\n- Đế tản nhiệt: 250k-600k\n- Sạc dự phòng: 500k-1.5 triệu\n\nChất lượng tốt, giá hợp lý!';
        }

        // ============================================
        // PRIORITY 2: QUERY DATABASE (DYNAMIC)
        // ============================================

        // === KIỂM TRA TÀI KHOẢN & ĐƠN HÀNG (Yêu cầu đăng nhập) ===
        if (lowerMessage.includes('đơn hàng của tôi') || lowerMessage.includes('đơn hàng của mình') || 
            lowerMessage.includes('kiểm tra đơn') || lowerMessage.includes('tra đơn')) {
            // Check if user is logged in
            const token = localStorage.getItem('token');
            if (!token) {
                return '🔐 Bạn cần đăng nhập để xem đơn hàng!\n\nVui lòng đăng nhập tại trang Tài khoản hoặc click vào biểu tượng người dùng ở góc trên.';
            }
            try {
                const response = await api.get('/orders/my-orders');
                if (response.success && response.data && response.data.length > 0) {
                    let result = `📦 Bạn có ${response.data.length} đơn hàng:\n\n`;
                    response.data.slice(0, 5).forEach((order, i) => {
                        result += `${i + 1}. Đơn #${order.IdDonHang}\n`;
                        result += `   💰 ${formatCurrency(order.TongTien)}\n`;
                        result += `   📍 ${order.TrangThaiDonHang}\n`;
                        result += `   📅 ${new Date(order.NgayDatHang).toLocaleDateString('vi-VN')}\n\n`;
                    });
                    result += `Xem chi tiết tại trang Tài khoản > Đơn hàng!`;
                    return result;
                } else {
                    return '📦 Bạn chưa có đơn hàng nào.\n\nHãy khám phá các sản phẩm tuyệt vời của chúng tôi!';
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
                return '❌ Không thể lấy thông tin đơn hàng. Vui lòng thử lại sau!';
            }
        }

        // === COUPON & MÃ GIẢM GIÁ ===
        if (lowerMessage.includes('mã giảm giá') || lowerMessage.includes('coupon') || 
            lowerMessage.includes('voucher') || lowerMessage.includes('mã khuyến mãi')) {
            const token = localStorage.getItem('token');
            if (!token) {
                return '🎟️ Mã giảm giá dành cho thành viên!\n\nVui lòng đăng nhập để xem các mã giảm giá có sẵn.';
            }
            try {
                const response = await api.get('/coupons/active');
                if (response.success && response.data && response.data.length > 0) {
                    let result = `🎟️ Mã giảm giá khả dụng:\n\n`;
                    response.data.forEach((coupon, i) => {
                        const discount = coupon.LoaiGiamGia === 'Phan tram' 
                            ? `${coupon.GiaTriGiam}%` 
                            : formatCurrency(coupon.GiaTriGiam);
                        result += `${i + 1}. ${coupon.MaCoupon}\n`;
                        result += `   🎁 Giảm: ${discount}\n`;
                        result += `   💵 Đơn tối thiểu: ${formatCurrency(coupon.GiaTriDonHangToiThieu)}\n`;
                        result += `   📅 HSD: ${new Date(coupon.NgayKetThuc).toLocaleDateString('vi-VN')}\n\n`;
                    });
                    result += `Áp dụng mã khi thanh toán!`;
                    return result;
                } else {
                    return '😔 Hiện tại không có mã giảm giá nào.\n\nHãy theo dõi để không bỏ lỡ!';
                }
            } catch (error) {
                console.error('Error fetching coupons:', error);
                return '❌ Không thể lấy thông tin mã giảm giá. Vui lòng thử lại!';
            }
        }

        // === DANH MỤC SẢN PHẨM ===
        if ((lowerMessage.includes('có những danh mục') || lowerMessage.includes('loại laptop') || 
             lowerMessage.includes('phân loại')) && !lowerMessage.includes('sản phẩm')) {
            try {
                const response = await api.get('/categories');
                if (response.success && response.data && response.data.length > 0) {
                    let result = `📂 Danh mục sản phẩm:\n\n`;
                    response.data.forEach((cat, i) => {
                        result += `${i + 1}. ${cat.TenDanhMuc}\n`;
                    });
                    result += `\nBạn muốn xem sản phẩm danh mục nào?`;
                    return result;
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        }

        // === SẢN PHẨM THEO DANH MỤC ===
        if (lowerMessage.includes('danh mục') && (lowerMessage.includes('có gì') || 
            lowerMessage.includes('có những') || lowerMessage.includes('sản phẩm'))) {
            // Extract category name
            const categories = ['gaming', 'văn phòng', 'đồ họa', 'mỏng nhẹ', 'cao cấp', 'phổ thông'];
            let foundCategory = null;
            
            for (const cat of categories) {
                if (lowerMessage.includes(cat)) {
                    foundCategory = cat;
                    break;
                }
            }
            
            if (foundCategory) {
                try {
                    const categoriesResponse = await api.get('/categories');
                    if (categoriesResponse.success) {
                        const categoryObj = categoriesResponse.data.find(c => 
                            c.TenDanhMuc.toLowerCase().includes(foundCategory)
                        );
                        
                        if (categoryObj) {
                            const response = await api.get(`/products?danhMuc=${categoryObj.IdDanhMuc}&limit=5`);
                            if (response.success && response.data.products && response.data.products.length > 0) {
                                let result = `📂 Danh mục ${categoryObj.TenDanhMuc}:\n\n`;
                                response.data.products.forEach((p, i) => {
                                    result += `${i + 1}. ${p.TenSanPham}\n   💰 ${formatCurrency(p.GiaSanPham)}\n   🏢 ${p.TenThuongHieu}\n\n`;
                                });
                                result += `Tổng: ${response.data.pagination.totalProducts} sản phẩm`;
                                return result;
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching category products:', error);
                }
            }
        }

        // === TẤT CẢ THƯƠNG HIỆU ===
        if (lowerMessage.includes('có những hãng') || lowerMessage.includes('có hãng nào') || 
            lowerMessage.includes('thương hiệu nào')) {
            try {
                const response = await api.get('/brands');
                if (response.success && response.data && response.data.length > 0) {
                    let result = `🏢 Thương hiệu laptop:\n\n`;
                    response.data.forEach((brand, i) => {
                        result += `${i + 1}. ${brand.TenThuongHieu}\n`;
                    });
                    result += `\nBạn muốn xem sản phẩm hãng nào?`;
                    return result;
                }
            } catch (error) {
                console.error('Error fetching brands:', error);
            }
        }

        // === QUERY DATABASE - SẢN PHẨM ĐẮT NHẤT ===
        if (lowerMessage.includes('đắt nhất') || lowerMessage.includes('cao nhất') || lowerMessage.includes('đắt tiền nhất')) {
            try {
                const response = await api.get('/products?limit=1&sort=price_desc');
                if (response.success && response.data.products && response.data.products.length > 0) {
                    const product = response.data.products[0];
                    return `💎 Sản phẩm đắt nhất hiện tại:\n\n📱 ${product.TenSanPham}\n💰 Giá: ${formatCurrency(product.GiaSanPham)}\n🏢 Hãng: ${product.TenThuongHieu || 'N/A'}\n📦 Còn: ${product.SoLuongSanPham} sản phẩm\n\nBạn có muốn xem chi tiết không?`;
                }
            } catch (error) {
                console.error('Error fetching expensive product:', error);
            }
        }

        // === QUERY DATABASE - SẢN PHẨM RẺ NHẤT ===
        if (lowerMessage.includes('rẻ nhất') || lowerMessage.includes('giá rẻ nhất') || lowerMessage.includes('thấp nhất')) {
            try {
                const response = await api.get('/products?limit=1&sort=price_asc');
                if (response.success && response.data.products && response.data.products.length > 0) {
                    const product = response.data.products[0];
                    return `💵 Sản phẩm rẻ nhất hiện tại:\n\n📱 ${product.TenSanPham}\n💰 Giá: ${formatCurrency(product.GiaSanPham)}\n🏢 Hãng: ${product.TenThuongHieu || 'N/A'}\n📦 Còn: ${product.SoLuongSanPham} sản phẩm\n\nPhù hợp cho học sinh, sinh viên!`;
                }
            } catch (error) {
                console.error('Error fetching cheap product:', error);
            }
        }

        // === QUERY DATABASE - SẢN PHẨM MỚI NHẤT ===
        if (lowerMessage.includes('mới nhất') || lowerMessage.includes('hàng mới') || lowerMessage.includes('sản phẩm mới')) {
            try {
                const response = await api.get('/products?limit=5&sort=newest');
                if (response.success && response.data.products && response.data.products.length > 0) {
                    let result = `✨ Top 5 sản phẩm mới nhất:\n\n`;
                    response.data.products.forEach((p, i) => {
                        result += `${i + 1}. ${p.TenSanPham}\n   💰 ${formatCurrency(p.GiaSanPham)}\n   🏢 ${p.TenThuongHieu}\n\n`;
                    });
                    result += `Xem thêm tại trang Sản phẩm!`;
                    return result;
                }
            } catch (error) {
                console.error('Error fetching new products:', error);
            }
        }

        // === QUERY DATABASE - SẢN PHẨM THEO HÃNG ===
        if ((lowerMessage.includes('có những') || lowerMessage.includes('có gì') || lowerMessage.includes('laptop')) && 
            (lowerMessage.includes('dell') || lowerMessage.includes('hp') || lowerMessage.includes('asus') || 
             lowerMessage.includes('lenovo') || lowerMessage.includes('msi') || lowerMessage.includes('acer'))) {
            
            let brand = '';
            if (lowerMessage.includes('dell')) brand = 'Dell';
            else if (lowerMessage.includes('hp')) brand = 'HP';
            else if (lowerMessage.includes('asus')) brand = 'Asus';
            else if (lowerMessage.includes('lenovo')) brand = 'Lenovo';
            else if (lowerMessage.includes('msi')) brand = 'MSI';
            else if (lowerMessage.includes('acer')) brand = 'Acer';

            try {
                const brandsResponse = await api.get('/brands');
                if (brandsResponse.success) {
                    const brandObj = brandsResponse.data.find(b => b.TenThuongHieu.toLowerCase() === brand.toLowerCase());
                    if (brandObj) {
                        const response = await api.get(`/products?thuongHieu=${brandObj.IdThuongHieu}&limit=5`);
                        if (response.success && response.data.products && response.data.products.length > 0) {
                            let result = `💻 Có ${response.data.pagination.totalProducts} sản phẩm ${brand}:\n\n`;
                            response.data.products.forEach((p, i) => {
                                result += `${i + 1}. ${p.TenSanPham}\n   💰 ${formatCurrency(p.GiaSanPham)}\n   📦 Còn: ${p.SoLuongSanPham}\n\n`;
                            });
                            result += `Xem thêm tại trang Sản phẩm!`;
                            return result;
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching brand products:', error);
            }
        }

        // === QUERY DATABASE - SẢN PHẨM GAMING ===
        if ((lowerMessage.includes('gaming') || lowerMessage.includes('chơi game')) && 
            (lowerMessage.includes('có những') || lowerMessage.includes('có gì') || lowerMessage.includes('nào'))) {
            try {
                const response = await api.get('/products?search=gaming&limit=5');
                if (response.success && response.data.products && response.data.products.length > 0) {
                    let result = `🎮 Laptop Gaming hiện có:\n\n`;
                    response.data.products.forEach((p, i) => {
                        result += `${i + 1}. ${p.TenSanPham}\n   💰 ${formatCurrency(p.GiaSanPham)}\n   🏢 ${p.TenThuongHieu}\n\n`;
                    });
                    result += `Xem thêm tại trang Sản phẩm!`;
                    return result;
                }
            } catch (error) {
                console.error('Error fetching gaming products:', error);
            }
        }

        // === QUERY DATABASE - TỔNG SỐ SẢN PHẨM ===
        if (lowerMessage.includes('có bao nhiêu') && lowerMessage.includes('sản phẩm')) {
            try {
                const response = await api.get('/products?limit=1');
                if (response.success && response.data.pagination) {
                    return `📊 Hiện tại cửa hàng có:\n- ${response.data.pagination.totalProducts} sản phẩm laptop\n- Đang bán: ${response.data.pagination.totalProducts} sản phẩm\n\nBạn muốn xem sản phẩm nào? (Gaming, văn phòng, đồ họa...)`;
                }
            } catch (error) {
                console.error('Error fetching product count:', error);
            }
        }

        // === QUERY DATABASE - SẢN PHẨM THEO GIÁ ===
        if ((lowerMessage.includes('dưới') || lowerMessage.includes('từ') || lowerMessage.includes('khoảng')) && 
            (lowerMessage.includes('triệu') || lowerMessage.includes('tr'))) {
            
            let minPrice = 0;
            let maxPrice = 100000000;
            
            // Parse price from message
            if (lowerMessage.includes('dưới 20')) {
                maxPrice = 20000000;
            } else if (lowerMessage.includes('20') && lowerMessage.includes('30')) {
                minPrice = 20000000;
                maxPrice = 30000000;
            } else if (lowerMessage.includes('30') && lowerMessage.includes('40')) {
                minPrice = 30000000;
                maxPrice = 40000000;
            } else if (lowerMessage.includes('trên 40') || lowerMessage.includes('trên 50')) {
                minPrice = 40000000;
            }
            
            try {
                const response = await api.get(`/products?minPrice=${minPrice}&maxPrice=${maxPrice}&limit=5`);
                if (response.success && response.data.products && response.data.products.length > 0) {
                    let result = `💰 Laptop trong khoảng giá ${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}:\n\n`;
                    response.data.products.forEach((p, i) => {
                        result += `${i + 1}. ${p.TenSanPham}\n   💰 ${formatCurrency(p.GiaSanPham)}\n   🏢 ${p.TenThuongHieu}\n\n`;
                    });
                    result += `Tổng: ${response.data.pagination.totalProducts} sản phẩm`;
                    return result;
                }
            } catch (error) {
                console.error('Error fetching products by price:', error);
            }
        }

        // === QUERY DATABASE - FLASH SALE ===
        if (lowerMessage.includes('flash sale') || lowerMessage.includes('giảm giá') || lowerMessage.includes('khuyến mãi')) {
            try {
                const response = await api.get('/flashsale/active');
                if (response.success && response.data && response.data.products) {
                    let result = `🔥 Flash Sale đang diễn ra:\n\n`;
                    response.data.products.slice(0, 5).forEach((p, i) => {
                        const discount = Math.round((1 - p.GiaFlashSale / p.GiaGoc) * 100);
                        result += `${i + 1}. ${p.TenSanPham}\n   ❌ ${formatCurrency(p.GiaGoc)}\n   ✅ ${formatCurrency(p.GiaFlashSale)} (-${discount}%)\n\n`;
                    });
                    result += `Xem thêm tại trang chủ!`;
                    return result;
                } else {
                    return '😔 Hiện tại không có Flash Sale nào đang diễn ra. Hãy theo dõi để không bỏ lỡ!';
                }
            } catch (error) {
                console.error('Error fetching flash sale:', error);
            }
        }

        // === QUERY DATABASE - TIN TỨC ===
        if (lowerMessage.includes('tin tức') || lowerMessage.includes('bài viết') || lowerMessage.includes('tin mới')) {
            try {
                const response = await api.get('/news?limit=3');
                if (response.success && response.data && response.data.length > 0) {
                    let result = `📰 Tin tức mới nhất:\n\n`;
                    response.data.forEach((n, i) => {
                        result += `${i + 1}. ${n.TieuDe}\n   👁️ ${n.LuotXem} lượt xem\n\n`;
                    });
                    result += `Xem thêm tại trang Tin tức!`;
                    return result;
                }
            } catch (error) {
                console.error('Error fetching news:', error);
            }
        }

        // === SO SÁNH 2 SẢN PHẨM ===
        if (lowerMessage.includes('so sánh') || lowerMessage.includes('khác nhau') || lowerMessage.includes('nên chọn')) {
            // Try to extract product names or IDs
            // For now, guide user to provide product names
            if (!lowerMessage.includes('và') && !lowerMessage.includes('với')) {
                return `🔍 Để so sánh 2 sản phẩm, hãy hỏi theo cú pháp:\n"So sánh [tên sản phẩm 1] và [tên sản phẩm 2]"\n\nVí dụ:\n- "So sánh Dell XPS 15 và HP Pavilion 15"\n- "So sánh Asus ROG và MSI Stealth"\n\nHoặc cho tôi biết 2 sản phẩm bạn muốn so sánh!`;
            }
            
            // Extract product names (simple approach)
            const parts = lowerMessage.split(/\s+và\s+|\s+với\s+/);
            if (parts.length >= 2) {
                const product1Name = parts[0].replace(/so sánh|so sanh/gi, '').trim();
                const product2Name = parts[1].trim();
                
                try {
                    // Search for both products
                    const [response1, response2] = await Promise.all([
                        api.get(`/products?search=${encodeURIComponent(product1Name)}&limit=1`),
                        api.get(`/products?search=${encodeURIComponent(product2Name)}&limit=1`)
                    ]);
                    
                    if (response1.success && response2.success && 
                        response1.data.products.length > 0 && response2.data.products.length > 0) {
                        
                        const p1 = response1.data.products[0];
                        const p2 = response2.data.products[0];
                        
                        let result = `⚖️ SO SÁNH SẢN PHẨM:\n\n`;
                        result += `📱 ${p1.TenSanPham}\n`;
                        result += `   💰 Giá: ${formatCurrency(p1.GiaSanPham)}\n`;
                        result += `   🏢 Hãng: ${p1.TenThuongHieu}\n`;
                        result += `   📦 Còn: ${p1.SoLuongSanPham} sản phẩm\n`;
                        result += `   📂 Danh mục: ${p1.TenDanhMuc || 'N/A'}\n\n`;
                        
                        result += `🆚\n\n`;
                        
                        result += `📱 ${p2.TenSanPham}\n`;
                        result += `   💰 Giá: ${formatCurrency(p2.GiaSanPham)}\n`;
                        result += `   🏢 Hãng: ${p2.TenThuongHieu}\n`;
                        result += `   📦 Còn: ${p2.SoLuongSanPham} sản phẩm\n`;
                        result += `   📂 Danh mục: ${p2.TenDanhMuc || 'N/A'}\n\n`;
                        
                        // Price comparison
                        const priceDiff = Math.abs(p1.GiaSanPham - p2.GiaSanPham);
                        if (p1.GiaSanPham > p2.GiaSanPham) {
                            result += `💡 ${p1.TenSanPham} đắt hơn ${formatCurrency(priceDiff)}\n`;
                        } else if (p2.GiaSanPham > p1.GiaSanPham) {
                            result += `💡 ${p2.TenSanPham} đắt hơn ${formatCurrency(priceDiff)}\n`;
                        } else {
                            result += `💡 Cả 2 có giá bằng nhau\n`;
                        }
                        
                        // Stock comparison
                        if (p1.SoLuongSanPham > p2.SoLuongSanPham) {
                            result += `📦 ${p1.TenSanPham} còn nhiều hàng hơn\n`;
                        } else if (p2.SoLuongSanPham > p1.SoLuongSanPham) {
                            result += `📦 ${p2.TenSanPham} còn nhiều hàng hơn\n`;
                        }
                        
                        result += `\nBạn cần thêm thông tin gì?`;
                        return result;
                    } else {
                        return `😔 Không tìm thấy một hoặc cả 2 sản phẩm. Vui lòng kiểm tra lại tên sản phẩm!\n\nGợi ý: Hãy dùng tên ngắn gọn như "Dell XPS", "HP Pavilion", "Asus ROG"...`;
                    }
                } catch (error) {
                    console.error('Error comparing products:', error);
                    return `❌ Có lỗi khi so sánh sản phẩm. Vui lòng thử lại!`;
                }
            }
        }

        // === TÌM KIẾM SẢN PHẨM THEO TÊN ===
        if ((lowerMessage.includes('tìm') || lowerMessage.includes('tìm kiếm') || lowerMessage.includes('có không')) && 
            !lowerMessage.includes('có bao nhiêu')) {
            // Extract search term (remove common words)
            const searchTerm = lowerMessage
                .replace(/tìm|tìm kiếm|có không|laptop|sản phẩm|cho tôi|giúp tôi/gi, '')
                .trim();
            
            if (searchTerm.length > 2) {
                try {
                    const response = await api.get(`/products?search=${encodeURIComponent(searchTerm)}&limit=5`);
                    if (response.success && response.data.products && response.data.products.length > 0) {
                        let result = `🔍 Tìm thấy ${response.data.pagination.totalProducts} sản phẩm:\n\n`;
                        response.data.products.forEach((p, i) => {
                            result += `${i + 1}. ${p.TenSanPham}\n   💰 ${formatCurrency(p.GiaSanPham)}\n   🏢 ${p.TenThuongHieu}\n   📦 Còn: ${p.SoLuongSanPham}\n\n`;
                        });
                        result += `Xem thêm tại trang Sản phẩm!`;
                        return result;
                    } else {
                        return `😔 Không tìm thấy sản phẩm nào với từ khóa "${searchTerm}".\n\nThử tìm với từ khóa khác hoặc xem tất cả sản phẩm tại trang Sản phẩm!`;
                    }
                } catch (error) {
                    console.error('Error searching products:', error);
                }
            }
        }

        // === GỢI Ý THEO NGÂN SÁCH CỤ THỂ ===
        if ((lowerMessage.includes('ngân sách') || lowerMessage.includes('có') || lowerMessage.includes('khoảng')) && 
            (lowerMessage.includes('triệu') || lowerMessage.includes('tr')) && 
            (lowerMessage.includes('nên mua') || lowerMessage.includes('gợi ý') || lowerMessage.includes('tư vấn'))) {
            
            // Parse budget
            const numbers = lowerMessage.match(/\d+/g);
            if (numbers && numbers.length > 0) {
                const budget = parseInt(numbers[0]);
                let minPrice = (budget - 2) * 1000000;
                let maxPrice = (budget + 2) * 1000000;
                
                // Save to context
                this.conversationContext.lastBudget = { min: minPrice, max: maxPrice };
                
                try {
                    const response = await api.get(`/products?minPrice=${minPrice}&maxPrice=${maxPrice}&limit=5&sort=popular`);
                    if (response.success && response.data.products && response.data.products.length > 0) {
                        let result = `💡 Gợi ý laptop trong ngân sách ${budget} triệu:\n\n`;
                        response.data.products.forEach((p, i) => {
                            result += `${i + 1}. ${p.TenSanPham}\n   💰 ${formatCurrency(p.GiaSanPham)}\n   🏢 ${p.TenThuongHieu}\n   ⭐ Phù hợp: ${p.TenDanhMuc || 'Đa năng'}\n\n`;
                            this.conversationContext.viewedProducts.push(p.IdSanPham);
                        });
                        result += `💬 Bạn có thể:\n- "Chi tiết sản phẩm 1" để xem thêm\n- "Còn sản phẩm nào khác" để xem thêm\n- "So sánh 1 và 2" để so sánh`;
                        return result;
                    }
                } catch (error) {
                    console.error('Error fetching products by budget:', error);
                }
            }
        }

        // === TƯ VẤN THEO CẤU HÌNH (CPU) ===
        if ((lowerMessage.includes('i3') || lowerMessage.includes('i5') || lowerMessage.includes('i7') || 
             lowerMessage.includes('i9') || lowerMessage.includes('ryzen')) && 
            (lowerMessage.includes('có những') || lowerMessage.includes('có gì') || lowerMessage.includes('nào'))) {
            
            let cpu = '';
            if (lowerMessage.includes('i3')) cpu = 'i3';
            else if (lowerMessage.includes('i5')) cpu = 'i5';
            else if (lowerMessage.includes('i7')) cpu = 'i7';
            else if (lowerMessage.includes('i9')) cpu = 'i9';
            else if (lowerMessage.includes('ryzen')) cpu = 'Ryzen';
            
            try {
                const response = await api.get(`/products?search=${cpu}&limit=5`);
                if (response.success && response.data.products && response.data.products.length > 0) {
                    let result = `🔧 Laptop CPU ${cpu.toUpperCase()}:\n\n`;
                    response.data.products.forEach((p, i) => {
                        result += `${i + 1}. ${p.TenSanPham}\n   💰 ${formatCurrency(p.GiaSanPham)}\n   🏢 ${p.TenThuongHieu}\n\n`;
                    });
                    result += `Tổng: ${response.data.pagination.totalProducts} sản phẩm`;
                    return result;
                } else {
                    return `😔 Hiện tại không có sản phẩm ${cpu.toUpperCase()} nào.\n\nBạn có thể xem các sản phẩm khác!`;
                }
            } catch (error) {
                console.error('Error fetching products by CPU:', error);
            }
        }

        // === TƯ VẤN THEO RAM ===
        if ((lowerMessage.includes('ram') || lowerMessage.includes('8gb') || lowerMessage.includes('16gb') || 
             lowerMessage.includes('32gb')) && 
            (lowerMessage.includes('có những') || lowerMessage.includes('có gì') || lowerMessage.includes('nào'))) {
            
            let ram = '';
            if (lowerMessage.includes('8gb') || lowerMessage.includes('8 gb')) ram = '8GB';
            else if (lowerMessage.includes('16gb') || lowerMessage.includes('16 gb')) ram = '16GB';
            else if (lowerMessage.includes('32gb') || lowerMessage.includes('32 gb')) ram = '32GB';
            
            if (ram) {
                try {
                    const response = await api.get(`/products?search=${ram}&limit=5`);
                    if (response.success && response.data.products && response.data.products.length > 0) {
                        let result = `💾 Laptop RAM ${ram}:\n\n`;
                        response.data.products.forEach((p, i) => {
                            result += `${i + 1}. ${p.TenSanPham}\n   💰 ${formatCurrency(p.GiaSanPham)}\n   🏢 ${p.TenThuongHieu}\n\n`;
                        });
                        result += `Tổng: ${response.data.pagination.totalProducts} sản phẩm`;
                        return result;
                    }
                } catch (error) {
                    console.error('Error fetching products by RAM:', error);
                }
            } else {
                return '💾 RAM phổ biến:\n- 8GB: Văn phòng, học tập\n- 16GB: Gaming, đa nhiệm\n- 32GB: Đồ họa, render\n\nBạn cần RAM bao nhiêu?';
            }
        }

        // === SO SÁNH GIÁ GIỮA CÁC HÃNG ===
        if ((lowerMessage.includes('so sánh giá') || lowerMessage.includes('giá nào rẻ hơn')) && 
            (lowerMessage.includes('hãng') || lowerMessage.includes('thương hiệu'))) {
            try {
                const brandsResponse = await api.get('/brands');
                if (brandsResponse.success && brandsResponse.data) {
                    let result = `💰 So sánh giá trung bình các hãng:\n\n`;
                    
                    // Get average price for each brand
                    for (const brand of brandsResponse.data.slice(0, 6)) {
                        const productsResponse = await api.get(`/products?thuongHieu=${brand.IdThuongHieu}&limit=100`);
                        if (productsResponse.success && productsResponse.data.products.length > 0) {
                            const avgPrice = productsResponse.data.products.reduce((sum, p) => sum + p.GiaSanPham, 0) / productsResponse.data.products.length;
                            result += `🏢 ${brand.TenThuongHieu}: ${formatCurrency(Math.round(avgPrice))}\n`;
                        }
                    }
                    
                    result += `\n💡 Giá chỉ mang tính tham khảo, phụ thuộc vào cấu hình!`;
                    return result;
                }
            } catch (error) {
                console.error('Error comparing brand prices:', error);
            }
        }

        // === TÌM KIẾM SẢN PHẨM THEO TÊN ===
        if ((lowerMessage.includes('tìm') || lowerMessage.includes('tìm kiếm') || lowerMessage.includes('có không')) && 
            !lowerMessage.includes('có bao nhiêu')) {
            // Extract search term (remove common words)
            const searchTerm = lowerMessage
                .replace(/tìm|tìm kiếm|có không|laptop|sản phẩm|cho tôi|giúp tôi/gi, '')
                .trim();
            
            if (searchTerm.length > 2) {
                try {
                    const response = await api.get(`/products?search=${encodeURIComponent(searchTerm)}&limit=5`);
                    if (response.success && response.data.products && response.data.products.length > 0) {
                        let result = `🔍 Tìm thấy ${response.data.pagination.totalProducts} sản phẩm:\n\n`;
                        response.data.products.forEach((p, i) => {
                            result += `${i + 1}. ${p.TenSanPham}\n   💰 ${formatCurrency(p.GiaSanPham)}\n   🏢 ${p.TenThuongHieu}\n   📦 Còn: ${p.SoLuongSanPham}\n\n`;
                        });
                        result += `Xem thêm tại trang Sản phẩm!`;
                        return result;
                    } else {
                        return `😔 Không tìm thấy sản phẩm nào với từ khóa "${searchTerm}".\n\nThử tìm với từ khóa khác hoặc xem tất cả sản phẩm tại trang Sản phẩm!`;
                    }
                } catch (error) {
                    console.error('Error searching products:', error);
                }
            }
        }

        // === GIÁ CẢ & SẢN PHẨM (GENERAL) ===
        if (lowerMessage.includes('giá') || lowerMessage.includes('bao nhiêu tiền')) {
            return '💰 Giá laptop tại Laptop World:\n- Phổ thông: 10-20 triệu\n- Trung cấp: 20-35 triệu\n- Cao cấp: 35-50 triệu\n- Gaming/Workstation: 40-80 triệu\n\nBạn muốn tìm laptop trong khoảng giá nào?';
        }

        if (lowerMessage.includes('rẻ nhất') || lowerMessage.includes('giá rẻ')) {
            return '💵 Laptop giá rẻ nhất:\n- HP 15s: ~15 triệu (i3, 8GB RAM, 256GB SSD)\n- Acer Aspire 3: ~16 triệu (i5, 8GB RAM, 512GB SSD)\n\nPhù hợp cho học tập, văn phòng cơ bản!';
        }

        // === GAMING ===
        if (lowerMessage.includes('gaming') || lowerMessage.includes('chơi game')) {
            return '🎮 Laptop Gaming HOT:\n- ASUS ROG Strix G15: 42 triệu (RTX 3060, i7)\n- MSI Stealth 15M: 48 triệu (RTX 3070 Ti, i7)\n- Acer Nitro 5: 35 triệu (RTX 3050, i5)\n\nChơi mượt AAA games, streaming tốt!';
        }

        // === VĂN PHÒNG ===
        if (lowerMessage.includes('văn phòng') || lowerMessage.includes('office') || lowerMessage.includes('làm việc')) {
            return '💼 Laptop văn phòng phổ biến:\n- HP Pavilion 15: 22 triệu (i5, 16GB, 512GB)\n- Lenovo ThinkPad E14: 25 triệu (i5, 8GB, 256GB)\n- Acer Swift 3: 20 triệu (i5, 8GB, 512GB)\n\nNhẹ, pin trâu, phù hợp làm việc di động!';
        }

        // === ĐỒ HỌA - THIẾT KẾ ===
        if (lowerMessage.includes('đồ họa') || lowerMessage.includes('thiết kế') || lowerMessage.includes('render')) {
            return '🎨 Laptop cho đồ họa/thiết kế:\n- Dell XPS 15: 55 triệu (i7, RTX 3050 Ti, 32GB)\n- MacBook Pro 16": 65 triệu (M1 Pro, 16GB)\n- ASUS ProArt: 48 triệu (i7, RTX 3060, 32GB)\n\nMàn hình đẹp, hiệu năng mạnh cho Photoshop, Premiere!';
        }

        // === THƯƠNG HIỆU ===
        if (lowerMessage.includes('dell')) {
            return '💻 Dell tại Laptop World:\n- Dell XPS 13/15: Cao cấp, thiết kế đẹp\n- Dell Inspiron: Phổ thông, giá tốt\n- Dell Vostro: Doanh nghiệp\n\nGiá từ 18-55 triệu. Bảo hành 12 tháng!';
        }

        if (lowerMessage.includes('hp')) {
            return '💻 HP tại Laptop World:\n- HP Pavilion: Đa năng, giá tốt (20-25 triệu)\n- HP Envy: Cao cấp, mỏng nhẹ (30-40 triệu)\n- HP Omen: Gaming (35-50 triệu)\n\nChất lượng tốt, bảo hành uy tín!';
        }

        if (lowerMessage.includes('asus')) {
            return '💻 ASUS tại Laptop World:\n- ASUS ROG: Gaming đỉnh cao (40-80 triệu)\n- ASUS TUF: Gaming giá tốt (25-35 triệu)\n- ASUS Vivobook: Phổ thông (15-25 triệu)\n\nĐa dạng, từ sinh viên đến game thủ!';
        }

        if (lowerMessage.includes('lenovo')) {
            return '💻 Lenovo tại Laptop World:\n- ThinkPad: Doanh nghiệp, bền bỉ (25-45 triệu)\n- IdeaPad: Đa năng (18-30 triệu)\n- Legion: Gaming (35-55 triệu)\n\nBàn phím tốt nhất, độ bền cao!';
        }

        if (lowerMessage.includes('msi')) {
            return '💻 MSI tại Laptop World:\n- MSI Stealth: Gaming mỏng nhẹ (45-65 triệu)\n- MSI Katana: Gaming giá tốt (30-40 triệu)\n- MSI Creator: Sáng tạo nội dung (50-70 triệu)\n\nChuyên gaming, tản nhiệt tốt!';
        }

        if (lowerMessage.includes('acer')) {
            return '💻 Acer tại Laptop World:\n- Acer Nitro: Gaming giá rẻ (25-35 triệu)\n- Acer Swift: Văn phòng mỏng nhẹ (20-30 triệu)\n- Acer Aspire: Phổ thông (15-22 triệu)\n\nGiá tốt, phù hợp sinh viên!';
        }

        if (lowerMessage.includes('macbook') || lowerMessage.includes('apple')) {
            return '🍎 MacBook tại Laptop World:\n- MacBook Air M1: 28 triệu\n- MacBook Pro 14" M1 Pro: 52 triệu\n- MacBook Pro 16" M1 Max: 75 triệu\n\nPin trâu, hiệu năng mạnh, phù hợp sáng tạo!';
        }

        // === BẢO HÀNH ===
        if (lowerMessage.includes('bảo hành')) {
            return '🛡️ Chính sách bảo hành:\n- Bảo hành chính hãng: 12-24 tháng\n- Đổi mới trong 7 ngày nếu lỗi NSX\n- Hỗ trợ kỹ thuật miễn phí trọn đời\n- Bảo hành tận nơi cho laptop cao cấp\n\nYên tâm mua sắm!';
        }

        // === THANH TOÁN ===
        if (lowerMessage.includes('thanh toán') || lowerMessage.includes('trả góp')) {
            return '💳 Hình thức thanh toán:\n- Tiền mặt (COD)\n- Chuyển khoản ngân hàng\n- Thẻ tín dụng/ghi nợ\n- Trả góp 0% qua thẻ tín dụng (3-12 tháng)\n- Trả góp qua công ty tài chính\n\nLinh hoạt, tiện lợi!';
        }

        // === GIAO HÀNG ===
        if (lowerMessage.includes('giao hàng') || lowerMessage.includes('ship') || lowerMessage.includes('vận chuyển')) {
            return '🚚 Chính sách giao hàng:\n- Giao hàng toàn quốc 1-3 ngày\n- Miễn phí ship nội thành TP.HCM (đơn >20 triệu)\n- Kiểm tra hàng trước khi thanh toán\n- Đóng gói cẩn thận, bảo hiểm hàng hóa\n\nGiao nhanh, an toàn!';
        }

        // === KHUYẾN MÃI ===
        if (lowerMessage.includes('khuyến mãi') || lowerMessage.includes('giảm giá') || lowerMessage.includes('sale')) {
            return '🎁 Khuyến mãi HOT:\n- Flash Sale cuối tuần: Giảm 10-30%\n- Tặng chuột + balo khi mua laptop\n- Giảm thêm 500k khi thanh toán online\n- Tích điểm đổi quà\n\nXem thêm tại mục Flash Sale!';
        }

        // === HỌC SINH - SINH VIÊN ===
        if (lowerMessage.includes('học sinh') || lowerMessage.includes('sinh viên') || lowerMessage.includes('học tập')) {
            return '🎓 Laptop cho học sinh/sinh viên:\n- HP 15s: 15 triệu (i3, 8GB)\n- Acer Aspire 5: 18 triệu (i5, 8GB)\n- Lenovo IdeaPad: 20 triệu (i5, 16GB)\n\nNhẹ, pin trâu, giá phải chăng. Tặng kèm balo + chuột!';
        }

        // === LẬP TRÌNH ===
        if (lowerMessage.includes('lập trình') || lowerMessage.includes('code') || lowerMessage.includes('developer')) {
            return '💻 Laptop cho lập trình:\n- MacBook Pro M1: 52 triệu (16GB, 512GB)\n- Dell XPS 15: 45 triệu (i7, 32GB)\n- ThinkPad X1: 42 triệu (i7, 16GB)\n\nRAM lớn, CPU mạnh, màn hình đẹp!';
        }

        // === TƯ VẤN ===
        if (lowerMessage.includes('tư vấn') || lowerMessage.includes('chọn') || lowerMessage.includes('nên mua')) {
            // Check for specific needs
            if (lowerMessage.includes('gaming') || lowerMessage.includes('chơi game')) {
                return '🎮 Tư vấn laptop Gaming:\n\n💡 Ngân sách:\n- 25-35 triệu: Acer Nitro, ASUS TUF (RTX 3050)\n- 35-45 triệu: ASUS ROG, MSI Katana (RTX 3060)\n- 45-60 triệu: MSI Stealth, Lenovo Legion (RTX 3070)\n- >60 triệu: ASUS ROG Strix, MSI Raider (RTX 3080)\n\n⚙️ Cấu hình tối thiểu:\n- CPU: i5/Ryzen 5 trở lên\n- RAM: 16GB\n- VGA: RTX 3050 trở lên\n\nBạn có ngân sách bao nhiêu?';
            }
            
            if (lowerMessage.includes('văn phòng') || lowerMessage.includes('office')) {
                return '💼 Tư vấn laptop Văn phòng:\n\n💡 Ngân sách:\n- 15-20 triệu: HP 15s, Acer Aspire (i3, 8GB)\n- 20-25 triệu: HP Pavilion, Lenovo IdeaPad (i5, 16GB)\n- 25-35 triệu: Dell Inspiron, ASUS Vivobook (i7, 16GB)\n\n⚙️ Cấu hình đề xuất:\n- CPU: i5 trở lên\n- RAM: 8-16GB\n- SSD: 256-512GB\n- Pin: >8 giờ\n\nBạn cần di động nhiều không?';
            }
            
            if (lowerMessage.includes('đồ họa') || lowerMessage.includes('thiết kế') || lowerMessage.includes('render')) {
                return '🎨 Tư vấn laptop Đồ họa/Thiết kế:\n\n💡 Ngân sách:\n- 35-45 triệu: ASUS ProArt, Dell Inspiron 15 (i7, 16GB)\n- 45-55 triệu: Dell XPS 15, ASUS ProArt (i7, RTX 3050 Ti, 32GB)\n- >55 triệu: MacBook Pro, Dell Precision (M1 Pro/i9, 32GB)\n\n⚙️ Cấu hình tối thiểu:\n- CPU: i7/Ryzen 7 trở lên\n- RAM: 16-32GB\n- VGA: RTX 3050 Ti trở lên\n- Màn hình: 100% sRGB\n\nBạn dùng phần mềm gì chủ yếu?';
            }
            
            if (lowerMessage.includes('học sinh') || lowerMessage.includes('sinh viên')) {
                return '🎓 Tư vấn laptop Học sinh/Sinh viên:\n\n💡 Ngân sách:\n- 12-15 triệu: HP 15s, Acer Aspire 3 (i3, 8GB)\n- 15-20 triệu: Acer Aspire 5, Lenovo IdeaPad (i5, 8GB)\n- 20-25 triệu: HP Pavilion, ASUS Vivobook (i5, 16GB)\n\n⚙️ Cấu hình đề xuất:\n- CPU: i3/i5\n- RAM: 8GB\n- SSD: 256-512GB\n- Nhẹ: <2kg\n\n🎁 Tặng kèm: Balo + Chuột\n\nBạn học ngành gì?';
            }
            
            if (lowerMessage.includes('lập trình') || lowerMessage.includes('code')) {
                return '💻 Tư vấn laptop Lập trình:\n\n💡 Ngân sách:\n- 25-35 triệu: Lenovo ThinkPad E14, Dell Inspiron (i5, 16GB)\n- 35-45 triệu: Dell XPS 13, ThinkPad X1 (i7, 16GB)\n- >45 triệu: MacBook Pro M1, Dell XPS 15 (i7, 32GB)\n\n⚙️ Cấu hình đề xuất:\n- CPU: i5/i7 trở lên\n- RAM: 16-32GB (quan trọng!)\n- SSD: 512GB-1TB\n- Màn hình: Full HD trở lên\n\nBạn code ngôn ngữ gì?';
            }
            
            return '🤔 Để tư vấn chính xác, cho tôi biết:\n1. Mục đích sử dụng? (học tập/gaming/văn phòng/đồ họa/lập trình)\n2. Ngân sách? (15-20tr / 20-30tr / >30tr)\n3. Thương hiệu ưa thích?\n4. Yêu cầu đặc biệt? (nhẹ, pin trâu, màn hình đẹp...)\n\nHoặc gọi hotline 0123 456 789 để được tư vấn chi tiết!';
        }

        // === SO SÁNH THƯƠNG HIỆU ===
        if ((lowerMessage.includes('nên chọn') || lowerMessage.includes('khác nhau')) && 
            (lowerMessage.includes('dell') || lowerMessage.includes('hp') || lowerMessage.includes('asus') || 
             lowerMessage.includes('lenovo') || lowerMessage.includes('msi') || lowerMessage.includes('acer'))) {
            
            let brands = [];
            if (lowerMessage.includes('dell')) brands.push('Dell');
            if (lowerMessage.includes('hp')) brands.push('HP');
            if (lowerMessage.includes('asus')) brands.push('Asus');
            if (lowerMessage.includes('lenovo')) brands.push('Lenovo');
            if (lowerMessage.includes('msi')) brands.push('MSI');
            if (lowerMessage.includes('acer')) brands.push('Acer');
            
            if (brands.length >= 2) {
                let result = `⚖️ SO SÁNH ${brands[0].toUpperCase()} vs ${brands[1].toUpperCase()}:\n\n`;
                
                // Dell
                if (brands.includes('Dell')) {
                    result += `🏢 DELL:\n`;
                    result += `   ✅ Thiết kế đẹp, chất lượng cao\n`;
                    result += `   ✅ Màn hình sắc nét\n`;
                    result += `   ✅ Bảo hành tốt\n`;
                    result += `   ❌ Giá cao hơn\n\n`;
                }
                
                // HP
                if (brands.includes('HP')) {
                    result += `🏢 HP:\n`;
                    result += `   ✅ Đa dạng sản phẩm\n`;
                    result += `   ✅ Giá cả hợp lý\n`;
                    result += `   ✅ Phổ biến, dễ tìm phụ kiện\n`;
                    result += `   ❌ Thiết kế trung bình\n\n`;
                }
                
                // Asus
                if (brands.includes('Asus')) {
                    result += `🏢 ASUS:\n`;
                    result += `   ✅ Gaming mạnh (ROG)\n`;
                    result += `   ✅ Tản nhiệt tốt\n`;
                    result += `   ✅ Đa dạng phân khúc\n`;
                    result += `   ❌ Nặng hơn (gaming)\n\n`;
                }
                
                // Lenovo
                if (brands.includes('Lenovo')) {
                    result += `🏢 LENOVO:\n`;
                    result += `   ✅ Bàn phím tốt nhất\n`;
                    result += `   ✅ Độ bền cao (ThinkPad)\n`;
                    result += `   ✅ Phù hợp doanh nghiệp\n`;
                    result += `   ❌ Thiết kế cổ điển\n\n`;
                }
                
                // MSI
                if (brands.includes('MSI')) {
                    result += `🏢 MSI:\n`;
                    result += `   ✅ Gaming chuyên nghiệp\n`;
                    result += `   ✅ Hiệu năng cao\n`;
                    result += `   ✅ Tản nhiệt xuất sắc\n`;
                    result += `   ❌ Giá cao, nặng\n\n`;
                }
                
                // Acer
                if (brands.includes('Acer')) {
                    result += `🏢 ACER:\n`;
                    result += `   ✅ Giá rẻ nhất\n`;
                    result += `   ✅ Phù hợp sinh viên\n`;
                    result += `   ✅ Gaming giá tốt (Nitro)\n`;
                    result += `   ❌ Chất lượng trung bình\n\n`;
                }
                
                result += `💡 Kết luận:\n`;
                if (brands.includes('Dell') && brands.includes('HP')) {
                    result += `Dell: Cao cấp, đẹp | HP: Đa năng, giá tốt`;
                } else if (brands.includes('Asus') && brands.includes('MSI')) {
                    result += `Asus: Đa dạng | MSI: Gaming thuần`;
                } else if (brands.includes('Lenovo') && brands.includes('Dell')) {
                    result += `Lenovo: Bền bỉ | Dell: Thiết kế đẹp`;
                } else if (brands.includes('Acer') && brands.includes('HP')) {
                    result += `Acer: Rẻ nhất | HP: Cân bằng hơn`;
                } else {
                    result += `Tùy nhu cầu và ngân sách!`;
                }
                
                return result;
            }
        }

        // === DEFAULT ===
        return '🤖 Tôi có thể giúp bạn:\n\n📱 SẢN PHẨM:\n- Tìm laptop theo giá, hãng, cấu hình\n- So sánh sản phẩm, thương hiệu\n- Xem Flash Sale, tin tức\n\n💡 TƯ VẤN:\n- Gaming, văn phòng, đồ họa, lập trình\n- Học sinh/sinh viên\n- Theo ngân sách, CPU, RAM\n\n🏪 CỬA HÀNG:\n- Địa chỉ, giờ mở cửa, liên hệ\n- Bảo hành, thanh toán, giao hàng\n- Mã giảm giá, khuyến mãi\n\n👤 TÀI KHOẢN:\n- Kiểm tra đơn hàng (cần đăng nhập)\n- Xem mã giảm giá\n\n💬 Hỏi tôi bất cứ điều gì!\nVí dụ: "Laptop gaming 30 triệu", "So sánh Dell và HP", "Địa chỉ cửa hàng"';
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
