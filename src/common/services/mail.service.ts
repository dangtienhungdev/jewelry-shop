import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: this.configService.get('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendResetPasswordEmail(email: string, token: string, fullName: string) {
    const resetUrl = `${this.configService.get('app.frontendUrl')}/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get('MAIL_FROM'),
      to: email,
      subject: '🔐 Đặt lại mật khẩu - Jewelry Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #d4af37; margin: 0; font-size: 28px;">💎 Jewelry Shop</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Cửa hàng trang sức cao cấp</p>
            </div>

            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">🔐 Đặt lại mật khẩu</h2>

            <p style="color: #555; font-size: 16px;">Xin chào <strong>${fullName}</strong>,</p>

            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
              Để tiếp tục, vui lòng nhấp vào nút bên dưới:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background-color: #d4af37; color: white; padding: 12px 30px; text-decoration: none;
                        border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                🔓 Đặt lại mật khẩu
              </a>
            </div>

            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                <strong>⚠️ Lưu ý quan trọng:</strong><br>
                • Link này chỉ có hiệu lực trong <strong>30 phút</strong><br>
                • Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này<br>
                • Không chia sẻ link này với bất kỳ ai
              </p>
            </div>

            <p style="color: #777; font-size: 14px; line-height: 1.6;">
              Nếu nút không hoạt động, bạn có thể copy và paste link sau vào trình duyệt:
            </p>
            <p style="color: #d4af37; font-size: 14px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              © 2024 Jewelry Shop. Tất cả quyền được bảo lưu.<br>
              Email này được gửi tự động, vui lòng không trả lời.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email đặt lại mật khẩu đã được gửi tới: ${email}`);
    } catch (error) {
      console.error('❌ Lỗi gửi email:', error);
      throw new Error('Không thể gửi email đặt lại mật khẩu');
    }
  }

  async sendPasswordResetSuccessEmail(email: string, fullName: string) {
    const mailOptions = {
      from: this.configService.get('MAIL_FROM'),
      to: email,
      subject: '✅ Mật khẩu đã được đặt lại thành công - Jewelry Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #d4af37; margin: 0; font-size: 28px;">💎 Jewelry Shop</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Cửa hàng trang sức cao cấp</p>
            </div>

            <h2 style="color: #28a745; text-align: center; margin-bottom: 20px;">✅ Đặt lại mật khẩu thành công</h2>

            <p style="color: #555; font-size: 16px;">Xin chào <strong>${fullName}</strong>,</p>

            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Mật khẩu của bạn đã được đặt lại thành công vào lúc <strong>${new Date().toLocaleString('vi-VN')}</strong>.
            </p>

            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #155724; font-size: 14px; margin: 0; line-height: 1.5;">
                <strong>🔒 Bảo mật tài khoản:</strong><br>
                • Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ<br>
                • Khuyến nghị đổi mật khẩu định kỳ để bảo mật tài khoản<br>
                • Nếu bạn không thực hiện thao tác này, vui lòng liên hệ với chúng tôi ngay
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.configService.get('app.frontendUrl')}/login"
                 style="background-color: #d4af37; color: white; padding: 12px 30px; text-decoration: none;
                        border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                🔑 Đăng nhập ngay
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              © 2024 Jewelry Shop. Tất cả quyền được bảo lưu.<br>
              Email này được gửi tự động, vui lòng không trả lời.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(
        `✅ Email xác nhận đặt lại mật khẩu đã được gửi tới: ${email}`,
      );
    } catch (error) {
      console.error('❌ Lỗi gửi email:', error);
      // Không throw error vì đây chỉ là email thông báo
    }
  }
}
