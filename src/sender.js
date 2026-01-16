import nodemailer from 'nodemailer';

/**
 * Create email transporter
 * @param {Object} config - Email configuration
 * @returns {Object} - Nodemailer transporter
 */
export function createTransporter(config) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465, // true for 465, false for other ports
    auth: {
      user: config.user,
      pass: config.password
    }
  });
}

/**
 * Send email report
 * @param {Object} config - Email configuration
 * @param {string} markdown - Markdown content
 * @param {string} html - HTML content
 * @returns {Promise<boolean>} - Success status
 */
export async function sendEmail(config, markdown, html) {
  try {
    console.log('📧 准备发送邮件...');
    console.log(`   发件人: ${config.user}`);
    console.log(`   收件人: ${config.to}`);
    console.log(`   SMTP服务器: ${config.host}:${config.port}`);

    const transporter = createTransporter(config);

    // Verify connection
    console.log('   正在验证SMTP连接...');
    await transporter.verify();
    console.log('✓ SMTP连接验证成功');

    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');

    const mailOptions = {
      from: config.user,
      to: config.to,
      subject: `🤖 AI 每日热点 - ${dateStr}`,
      text: markdown,
      html: html
    };

    console.log('   正在发送邮件...');
    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ 邮件发送成功！`);
    console.log(`   消息ID: ${info.messageId}`);

    return true;
  } catch (error) {
    console.error('❌ 邮件发送失败:', error.message);

    // 提供更详细的错误提示
    if (error.message.includes('invalid login')) {
      console.error('   提示：用户名或密码错误');
      console.error('   Gmail用户需要使用"应用专用密码"，不是普通密码');
    } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      console.error('   提示：连接超时，可能是网络问题或防火墙阻止');
    } else if (error.message.includes('Self-signed certificate')) {
      console.error('   提示：SSL证书问题');
    }

    return false;
  }
}

/**
 * Save report to Obsidian vault
 * @param {string} vaultPath - Path to vault inbox directory
 * @param {string} markdown - Markdown content
 * @returns {Promise<boolean>} - Success status
 */
export async function saveToObsidian(vaultPath, markdown) {
  try {
    const fs = await import('fs');
    const path = await import('path');

    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');

    const filename = `AI日报-${dateStr}.md`;
    const targetPath = path.join(vaultPath, filename);

    // Create directory if it doesn't exist
    if (!fs.existsSync(vaultPath)) {
      fs.mkdirSync(vaultPath, { recursive: true });
    }

    fs.writeFileSync(targetPath, markdown, 'utf8');
    console.log(`✓ Saved to Obsidian: ${targetPath}`);

    return true;
  } catch (error) {
    console.error('❌ Error saving to Obsidian:', error.message);
    return false;
  }
}
