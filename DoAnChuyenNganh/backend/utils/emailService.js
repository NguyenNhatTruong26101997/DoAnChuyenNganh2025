const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('Email service error:', error);
    } else {
        console.log('Email service ready');
    }
});

// Send password reset email
const sendPasswordResetEmail = async (email, resetCode, userName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Đặt lại mật khẩu - LaptopWorld',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f9f9f9;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .reset-code {
                            background: white;
                            border: 2px dashed #667eea;
                            padding: 20px;
                            text-align: center;
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 5px;
                            color: #667eea;
                            margin: 20px 0;
                            border-radius: 5px;
                        }
                        .warning {
                            background: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Đặt lại mật khẩu</h1>
                            <p>LaptopWorld</p>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>${userName || 'bạn'}</strong>,</p>
                            
                            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                            
                            <p>Mã xác nhận của bạn là:</p>
                            
                            <div class="reset-code">${resetCode}</div>
                            
                            <div class="warning">
                                <strong>⚠️ Lưu ý:</strong>
                                <ul>
                                    <li>Mã này có hiệu lực trong <strong>15 phút</strong></li>
                                    <li>Chỉ sử dụng được <strong>1 lần</strong></li>
                                    <li>Không chia sẻ mã này với bất kỳ ai</li>
                                </ul>
                            </div>
                            
                            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                            
                            <p>Trân trọng,<br><strong>Đội ngũ LaptopWorld</strong></p>
                        </div>
                        <div class="footer">
                            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                            <p>&copy; 2024 LaptopWorld. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Send email error:', error);
        return { success: false, error: error.message };
    }
};

// Send welcome email
const sendWelcomeEmail = async (email, userName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Chào mừng đến với LaptopWorld!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f9f9f9;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .button {
                            display: inline-block;
                            background: #667eea;
                            color: white;
                            padding: 12px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Chào mừng!</h1>
                            <p>LaptopWorld</p>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>${userName}</strong>,</p>
                            
                            <p>Cảm ơn bạn đã đăng ký tài khoản tại LaptopWorld!</p>
                            
                            <p>Chúng tôi rất vui được đồng hành cùng bạn trong hành trình tìm kiếm chiếc laptop hoàn hảo.</p>
                            
                            <p style="text-align: center;">
                                <a href="http://127.0.0.1:5500/frontend/index.html" class="button">Khám phá ngay</a>
                            </p>
                            
                            <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.</p>
                            
                            <p>Trân trọng,<br><strong>Đội ngũ LaptopWorld</strong></p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2024 LaptopWorld. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Send welcome email error:', error);
        return { success: false, error: error.message };
    }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (email, orderData) => {
    try {
        const { maDonHang, hoTenNguoiNhan, tongTien, items, diaChiGiao } = orderData;

        // Format items list
        const itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.TenSanPham}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.SoLuongChiTietGioHang}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.GiaSanPham)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.GiaSanPham * item.SoLuongChiTietGioHang)}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Xác nhận đơn hàng #${maDonHang} - LaptopWorld`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f9f9f9;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .order-info {
                            background: white;
                            padding: 20px;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                        .order-code {
                            background: #667eea;
                            color: white;
                            padding: 15px;
                            text-align: center;
                            font-size: 24px;
                            font-weight: bold;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                        }
                        th {
                            background: #f0f0f0;
                            padding: 10px;
                            text-align: left;
                        }
                        .total {
                            background: #fff3cd;
                            padding: 15px;
                            text-align: right;
                            font-size: 18px;
                            font-weight: bold;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Đặt hàng thành công!</h1>
                            <p>LaptopWorld</p>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>${hoTenNguoiNhan}</strong>,</p>
                            
                            <p>Cảm ơn bạn đã đặt hàng tại LaptopWorld! Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>
                            
                            <div class="order-code">
                                Mã đơn hàng: ${maDonHang}
                            </div>
                            
                            <div class="order-info">
                                <h3>📦 Chi tiết đơn hàng</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th style="text-align: center;">Số lượng</th>
                                            <th style="text-align: right;">Đơn giá</th>
                                            <th style="text-align: right;">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsHtml}
                                    </tbody>
                                </table>
                                
                                <div class="total">
                                    Tổng cộng: ${formatCurrency(tongTien)}
                                </div>
                                
                                <h3>🚚 Địa chỉ giao hàng</h3>
                                <p>${diaChiGiao}</p>
                            </div>
                            
                            <p><strong>Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận đơn hàng.</strong></p>
                            
                            <p>Bạn có thể theo dõi trạng thái đơn hàng trong trang <a href="http://127.0.0.1:5500/frontend/profile.html">Hồ sơ cá nhân</a>.</p>
                            
                            <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.</p>
                            
                            <p>Trân trọng,<br><strong>Đội ngũ LaptopWorld</strong></p>
                        </div>
                        <div class="footer">
                            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                            <p>&copy; 2024 LaptopWorld. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Send order confirmation email error:', error);
        return { success: false, error: error.message };
    }
};

// Send contact reply email
const sendContactReplyEmail = async (email, contactData) => {
    try {
        const { hoTen, tieuDe, noiDungGoc, phanHoi, adminName } = contactData;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Phản hồi: ${tieuDe} - LaptopWorld`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f9f9f9;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .message-box {
                            background: white;
                            padding: 20px;
                            border-radius: 5px;
                            margin: 20px 0;
                            border-left: 4px solid #667eea;
                        }
                        .original-message {
                            background: #f0f0f0;
                            padding: 15px;
                            border-radius: 5px;
                            margin: 20px 0;
                            font-size: 14px;
                        }
                        .reply-box {
                            background: #e8f5e9;
                            padding: 20px;
                            border-radius: 5px;
                            margin: 20px 0;
                            border-left: 4px solid #4caf50;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>💬 Phản hồi từ LaptopWorld</h1>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>${hoTen}</strong>,</p>
                            
                            <p>Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi đã nhận được tin nhắn của bạn và xin gửi phản hồi như sau:</p>
                            
                            <div class="original-message">
                                <h4>📝 Tin nhắn của bạn:</h4>
                                <p><strong>Chủ đề:</strong> ${tieuDe}</p>
                                <p style="white-space: pre-line;">${noiDungGoc}</p>
                            </div>
                            
                            <div class="reply-box">
                                <h4>✉️ Phản hồi từ ${adminName || 'Admin'}:</h4>
                                <p style="white-space: pre-line;">${phanHoi}</p>
                            </div>
                            
                            <p>Nếu bạn có thêm câu hỏi, vui lòng liên hệ lại với chúng tôi hoặc trả lời email này.</p>
                            
                            <p>Trân trọng,<br><strong>Đội ngũ LaptopWorld</strong></p>
                        </div>
                        <div class="footer">
                            <p>Bạn nhận được email này vì đã gửi liên hệ đến LaptopWorld.</p>
                            <p>&copy; 2024 LaptopWorld. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Contact reply email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Send contact reply email error:', error);
        return { success: false, error: error.message };
    }
};

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

module.exports = {
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendContactReplyEmail
};
