import Parser from 'rss-parser';
import { Octokit } from 'octokit';
import githubTrending from 'github-trending-api';

const parser = new Parser();

/**
 * Fetch RSS feeds from configured sources
 * @param {Array<string>} feeds - List of RSS feed URLs
 * @returns {Promise<Array<{title, link, pubDate, contentSnippet}>>}
 */
export async function fetchRSSFeeds(feeds) {
  const allItems = [];

  for (const feedUrl of feeds) {
    try {
      console.log(`📡 Fetching RSS: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);

      // Get items from the last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const recentItems = feed.items
        .filter(item => {
          const pubDate = new Date(item.pubDate);
          return pubDate > oneDayAgo;
        })
        .slice(0, 5) // Max 5 items per feed
        .map(item => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          content: item.contentSnippet || item.content || '',
          source: feed.title || feedUrl
        }));

      allItems.push(...recentItems);
    } catch (error) {
      console.error(`❌ Error fetching ${feedUrl}:`, error.message);
    }
  }

  // Sort by date and return latest 12
  return allItems
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, 12);
}

/**
 * Fetch trending repositories from GitHub
 * @param {Object} octokit - Octokit instance
 * @param {string} query - Search query
 * @param {number} count - Number of results to return
 * @returns {Promise<Array>}
 */
export async function fetchGitHubTrending(octokit, query, count = 5) {
  try {
    console.log(`🔍 GitHub search query: ${query}`);

    const response = await octokit.rest.search.repos({
      q: query,
      sort: 'stars',
      order: 'desc',
      per_page: count
    });

    return response.data.items.map(repo => ({
      name: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language,
      createdAt: repo.created_at,
      topics: repo.topics || []
    }));
  } catch (error) {
    console.error(`❌ Error fetching GitHub trending:`, error.message);
    return [];
  }
}

/**
 * Fetch trending repositories from GitHub Trending (unofficial API)
 * @param {string} language - Programming language (empty for all)
 * @returns {Promise<Array>}
 */
export async function fetchGithubTrendingDaily(language = '') {
  try {
    console.log(`🔍 Fetching GitHub trending: ${language || 'all languages'}`);

    // 获取今日 trending
    const repos = await githubTrending({
      language: language,
      since: 'daily'  // daily, weekly, monthly
    });

    return repos.map(repo => ({
      name: repo.author + '/' + repo.name,
      description: repo.description,
      url: `https://github.com/${repo.author}/${repo.name}`,
      stars: repo.currentPeriodStars || 0, // 今日新增 stars
      language: repo.language,
      createdAt: null,  // trending API 不提供创建时间
      topics: []
    }));
  } catch (error) {
    console.error(`❌ Error fetching GitHub trending:`, error.message);
    return [];
  }
}

/**
 * Fetch all trending repositories (AI/ML + DevTools)
 * 使用真正的 GitHub Trending，获取今日热门
 * @param {string} token - GitHub token (optional，这里不需要)
 * @returns {Promise<{aiProjects: Array, devTools: Array}>}
 */
export async function fetchAllTrending(token) {
  console.log('🔍 获取今日 GitHub Trending（真正的热门榜）');

  // 获取 Python AI 项目
  const pythonRepos = await fetchGithubTrendingDaily('python');

  // 获取 JavaScript/TypeScript 开发工具
  const jsRepos = await fetchGithubTrendingDaily('javascript');

  // 从 Python repos 中筛选 AI/ML 相关
  const aiKeywords = ['machine learning', 'deep learning', 'ai', 'llm', 'nlp', 'transformer', 'tensorflow', 'pytorch', 'hugging'];
  const aiProjects = pythonRepos
    .filter(repo => {
      const desc = (repo.description || '').toLowerCase();
      const name = repo.name.toLowerCase();
      return aiKeywords.some(keyword =>
        desc.includes(keyword) || name.includes(keyword)
      );
    })
    .slice(0, 5);  // 取前 5 个

  // JavaScript/TypeScript 作为开发工具
  const devTools = jsRepos.slice(0, 5);

  console.log(`✓ Fetched ${aiProjects.length} AI trending projects`);
  console.log(`✓ Fetched ${devTools.length} dev tool trending projects`);

  return { aiProjects, devTools };
}

/**
 * Main collector function
 * @param {Object} config - Configuration object
 * @returns {Promise<{news: Array, aiProjects: Array, devTools: Array}>}
 */
export async function collectAllData(config) {
  console.log('🚀 Starting data collection...');

  // Fetch RSS feeds
  const news = await fetchRSSFeeds(config.rssFeeds);
  console.log(`✓ Fetched ${news.length} news items`);

  // Fetch GitHub trending
  const { aiProjects, devTools } = await fetchAllTrending(config.githubToken);
  console.log(`✓ Fetched ${aiProjects.length} AI projects`);
  console.log(`✓ Fetched ${devTools.length} dev tools`);

  return {
    news,
    aiProjects,
    devTools
  };
}
