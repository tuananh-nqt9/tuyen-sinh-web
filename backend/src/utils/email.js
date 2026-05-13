const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Skip if email is not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured, skipping email send');
      return { success: true, message: 'Email skipped (not configured)' };
    }

    const info = await transporter.sendMail({
      from: `"Hệ thống Tuyển sinh" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || subject
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

exports.sendApplicationConfirmation = async (user, application) => {
  return this.sendEmail({
    to: user.email,
    subject: `Xác nhận đăng ký xét tuyển - ${application.applicationCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎓 Hệ thống Tuyển sinh</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Xin chào ${user.fullName}!</h2>
          <p>Cảm ơn bạn đã đăng ký xét tuyển. Hồ sơ của bạn đã được ghi nhận.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Thông tin hồ sơ</h3>
            <p><strong>Mã hồ sơ:</strong> ${application.applicationCode}</p>
            <p><strong>Ngày đăng ký:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
            <p><strong>Trạng thái:</strong> Đang chờ xét duyệt</p>
          </div>
          
          <p>Bạn có thể theo dõi trạng thái hồ sơ tại website của chúng tôi.</p>
          <p>Chúc bạn may mắn!</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Email này được gửi tự động từ Hệ thống Tuyển sinh Đại học Trực tuyến</p>
        </div>
      </div>
    `
  });
};

exports.sendStatusUpdate = async (user, application, newStatus, notes) => {
  const statusText = {
    pending: 'đang được xem xét',
    reviewing: 'đang trong quá trình xét duyệt',
    approved: 'đã được chấp nhận - Chúc mừng bạn!',
    rejected: 'không được chấp nhận',
    waitlist: 'nằm trong danh sách chờ'
  };

  return this.sendEmail({
    to: user.email,
    subject: `Thông báo cập nhật hồ sơ - ${application.applicationCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎓 Hệ thống Tuyển sinh</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Xin chào ${user.fullName}!</h2>
          <p>Hồ sơ đăng ký xét tuyển của bạn đã được cập nhật.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Thông tin cập nhật</h3>
            <p><strong>Mã hồ sơ:</strong> ${application.applicationCode}</p>
            <p><strong>Trạng thái mới:</strong> <span style="color: ${newStatus === 'approved' ? 'green' : newStatus === 'rejected' ? 'red' : '#667eea'}; font-weight: bold;">${statusText[newStatus] || newStatus}</span></p>
            ${notes ? `<p><strong>Ghi chú:</strong> ${notes}</p>` : ''}
          </div>
          
          ${newStatus === 'approved' ? `
          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #155724; margin-top: 0;">🎉 Chúc mừng bạn!</h3>
            <p>Hồ sơ của bạn đã được chấp nhận. Vui lòng làm theo hướng dẫn để hoàn tất thủ tục nhập học.</p>
          </div>
          ` : ''}
          
          <p>Để biết thêm chi tiết, vui lòng truy cập website của chúng tôi.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Email này được gửi tự động từ Hệ thống Tuyển sinh Đại học Trực tuyến</p>
        </div>
      </div>
    `
  });
};
