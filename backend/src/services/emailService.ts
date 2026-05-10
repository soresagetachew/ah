import nodemailer from 'nodemailer';
import { settingsService } from './settingsService';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const wrapWithBrandLayout = async (content: string) => {
  const settings = await settingsService.getAllSettings();
  const logoUrl = settings['brand_logo_url'];
  const companyName = settings['brand_company_name'] || 'African Holding';
  const primaryColor = settings['theme_color_primary'] || '#0F172A';

  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: ${primaryColor}; padding: 24px; text-align: center;">
        ${logoUrl ? `<img src="${logoUrl}" height="40" alt="${companyName}" style="max-height: 40px; width: auto;" />` : `<h2 style="color: white; margin: 0;">${companyName}</h2>`}
      </div>
      <div style="padding: 40px; background-color: #ffffff; line-height: 1.6; color: #334155;">
        ${content}
      </div>
      <div style="padding: 24px; background-color: #f8fafc; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.
      </div>
    </div>
  `;
};

export const sendEmail = async (to: string, subject: string, html: string, wrapped: boolean = true) => {
  try {
    const finalHtml = wrapped ? await wrapWithBrandLayout(html) : html;
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@africanholding.com',
      to,
      subject,
      html: finalHtml,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};
