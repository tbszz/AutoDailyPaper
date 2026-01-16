import Anthropic from '@anthropic-ai/sdk';

/**
 * Summarize a news article using Claude API
 * @param {Anthropic} anthropic - Anthropic client
 * @param {Object} article - Article object with title, link, content
 * @returns {Promise<Object>} - Summarized article
 */
export async function summarizeNews(anthropic, article) {
  try {
    const prompt = `请用中文总结以下 AI 新闻，要求：
1. 用 50-100 字概括核心内容
2. 提取 3-5 个关键要点（用列表形式）
3. 保持专业但易懂的语气

标题：${article.title}
来源：${article.source || '未知'}
链接：${article.link}
内容：${article.content?.slice(0, 2000) || '无内容'}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const summary = message.content[0].text;

    return {
      ...article,
      summary
    };
  } catch (error) {
    console.error(`❌ Error summarizing news "${article.title}":`, error.message);
    // Return formatted Chinese version without AI
    return {
      ...article,
      summary: `**📰 新闻摘要**\n\n${article.title}\n\n${article.content?.slice(0, 300) || '暂无详细内容'}...\n\n🔗 [阅读原文](${article.link})`
    };
  }
}

/**
 * Summarize a GitHub project using Claude API
 * @param {Anthropic} anthropic - Anthropic client
 * @param {Object} repo - Repository object
 * @returns {Promise<Object>} - Summarized repository
 */
export async function summarizeRepo(anthropic, repo) {
  try {
    const prompt = `请用中文分析以下 GitHub 项目，要求：
1. 用 50-100 字概括这个项目的核心价值
2. 识别主要技术栈（编程语言、框架等）
3. 提炼 3-5 个创新点或亮点
4. 用一句话总结为什么值得关注

项目名称：${repo.name}
描述：${repo.description || '无描述'}
语言：${repo.language || '未知'}
Star 数：${repo.stars}
链接：${repo.url}
标签：${repo.topics.slice(0, 5).join(', ') || '无'}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const analysis = message.content[0].text;

    return {
      ...repo,
      analysis
    };
  } catch (error) {
    console.error(`❌ Error analyzing repo "${repo.name}":`, error.message);
    // Return original repo without analysis
    return {
      ...repo,
      analysis: `**${repo.description || '无描述'}**\n\n技术栈：${repo.language || '未知'}\nStar 数：${repo.stars}`
    };
  }
}

/**
 * Summarize all news articles
 * @param {string} apiKey - Anthropic API key
 * @param {Array} news - News articles
 * @param {string} baseURL - Optional custom base URL for API proxy
 * @returns {Promise<Array>} - Summarized news
 */
export async function summarizeAllNews(apiKey, news, baseURL) {
  if (!apiKey || news.length === 0) {
    console.log('⚠️ No API key or no news to summarize');
    return news;
  }

  console.log(`🤖 Summarizing ${news.length} news items...`);

  const anthropicConfig = { apiKey };
  if (baseURL) {
    anthropicConfig.baseURL = baseURL;
    console.log(`📡 Using custom base URL: ${baseURL}`);
  }

  const anthropic = new Anthropic(anthropicConfig);
  const summarized = [];

  // Process sequentially to avoid rate limits
  for (const article of news) {
    const summarizedArticle = await summarizeNews(anthropic, article);
    summarized.push(summarizedArticle);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('✓ All news summarized');
  return summarized;
}

/**
 * Analyze all GitHub repositories
 * @param {string} apiKey - Anthropic API key
 * @param {Array} repos - Repositories
 * @param {string} baseURL - Optional custom base URL for API proxy
 * @returns {Promise<Array>} - Analyzed repositories
 */
export async function analyzeAllRepos(apiKey, repos, baseURL) {
  if (!apiKey || repos.length === 0) {
    console.log('⚠️ No API key or no repos to analyze');
    return repos;
  }

  console.log(`🤖 Analyzing ${repos.length} repositories...`);

  const anthropicConfig = { apiKey };
  if (baseURL) {
    anthropicConfig.baseURL = baseURL;
  }

  const anthropic = new Anthropic(anthropicConfig);
  const analyzed = [];

  // Process sequentially to avoid rate limits
  for (const repo of repos) {
    const analyzedRepo = await summarizeRepo(anthropic, repo);
    analyzed.push(analyzedRepo);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('✓ All repositories analyzed');
  return analyzed;
}

/**
 * Main summarizer function
 * @param {string} apiKey - Anthropic API key
 * @param {Object} data - Collected data
 * @param {string} baseURL - Optional custom base URL for API proxy
 * @returns {Promise<Object>} - Summarized data
 */
export async function summarizeAll(apiKey, data, baseURL) {
  if (!apiKey) {
    console.log('⚠️ No Anthropic API key provided, skipping summarization');
    return data;
  }

  console.log('🤖 Starting AI summarization...');

  const [summarizedNews, analyzedAiProjects, analyzedDevTools] = await Promise.all([
    summarizeAllNews(apiKey, data.news, baseURL),
    analyzeAllRepos(apiKey, data.aiProjects, baseURL),
    analyzeAllRepos(apiKey, data.devTools, baseURL)
  ]);

  return {
    news: summarizedNews,
    aiProjects: analyzedAiProjects,
    devTools: analyzedDevTools
  };
}
