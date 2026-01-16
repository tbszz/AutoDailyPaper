import 'dotenv/config';
import { collectAllData } from './collector.js';
import { summarizeAll } from './summarizer.js';
import { formatReport, markdownToHTML } from './formatter.js';
import { sendEmail, saveToObsidian } from './sender.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load configuration from sources.json
 * @returns {Object}
 */
function loadConfig() {
  try {
    const configPath = join(__dirname, '../config/sources.json');
    const configData = readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('❌ Error loading config:', error.message);
    throw error;
  }
}

/**
 * Load environment variables
 * @returns {Object}
 */
function loadEnv() {
  return {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    anthropicBaseURL: process.env.ANTHROPIC_BASE_URL,
    githubToken: process.env.GITHUB_TOKEN,
    email: {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      to: process.env.EMAIL_TO
    },
    vaultPath: process.env.VAULT_PATH || 'D:\\Obsidian\\skills\\second-brain\\草稿箱'
  };
}

/**
 * Main function
 */
export async function main() {
  try {
    console.log('🚀 AI Daily News Generator\n');

    // Load configuration
    const config = loadConfig();
    const env = loadEnv();

    console.log(`📁 Vault path: ${env.vaultPath}\n`);

    // Add GitHub token to config
    config.githubToken = env.githubToken;

    // Step 1: Collect data
    const data = await collectAllData(config);

    // Step 2: Summarize with AI (if API key provided)
    const summarizedData = await summarizeAll(env.anthropicApiKey, data, env.anthropicBaseURL);

    // Step 3: Format report
    const markdown = formatReport(summarizedData);
    const html = markdownToHTML(markdown);

    console.log('\n✓ Report generated');

    // Step 4: Send email (if configured)
    if (env.email.user && env.email.password && env.email.to) {
      const emailSent = await sendEmail(env.email, markdown, html);
      if (emailSent) {
        console.log('✓ Email sent successfully');
      } else {
        console.log('✗ Email sending failed');
      }
    } else {
      console.log('⚠️ Email not configured, skipping email sending');
    }

    // Step 5: Save to Obsidian (always enabled with default path)
    const saved = await saveToObsidian(env.vaultPath, markdown);
    if (saved) {
      console.log('✓ Saved to Obsidian 草稿箱');
    }

    console.log('\n✅ All done!');

    return {
      success: true,
      newsCount: data.news.length,
      aiProjectsCount: data.aiProjects.length,
      devToolsCount: data.devTools.length
    };
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run if called directly
main();
