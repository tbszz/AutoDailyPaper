/**
 * Format news items into Markdown
 * @param {Array} news - News items
 * @returns {string}
 */
export function formatNews(news) {
  if (!news || news.length === 0) {
    return '暂无新闻\n';
  }

  let markdown = '## 📰 今日头条\n\n';

  news.forEach((item, index) => {
    markdown += `### ${index + 1}. ${item.title}\n\n`;
    markdown += `🔗 原文链接：${item.link}\n\n`;

    if (item.summary) {
      markdown += `${item.summary}\n\n`;
    } else if (item.content) {
      // Truncate content if no summary
      const content = item.content.slice(0, 300).replace(/\n+/g, ' ');
      markdown += `**摘要**：\n\n${content}...\n\n`;
    }

    markdown += '---\n\n';
  });

  return markdown;
}

/**
 * Format GitHub repositories into Markdown
 * @param {string} category - Category name (AI/ML or DevTools)
 * @param {Array} repos - Repository list
 * @returns {string}
 */
export function formatRepos(category, repos) {
  if (!repos || repos.length === 0) {
    return `### ${category}\n\n暂无项目\n\n`;
  }

  let markdown = `### ${category}\n\n`;

  repos.forEach((repo, index) => {
    const rank = category.includes('AI') ? index + 1 : index + 6;
    const stars = repo.stars.toLocaleString();

    markdown += `#### **${rank}. ${repo.name}**\n\n`;
    markdown += `🔥 今日 +${stars} stars`;

    if (repo.language) {
      markdown += ` | 🐙 ${repo.language}`;
    }

    markdown += '\n\n';

    if (repo.analysis) {
      markdown += `${repo.analysis}\n\n`;
    } else if (repo.description) {
      markdown += `**简介**：${repo.description}\n\n`;
    }

    markdown += `🔗 [查看项目](${repo.url})\n\n---\n\n`;
  });

  return markdown;
}

/**
 * Format all data into a complete Markdown report
 * @param {Object} data - Collected and summarized data
 * @returns {string}
 */
export function formatReport(data) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');

  const timeStr = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Shanghai'
  });

  let markdown = `# 🤖 AI 每日热点 - ${dateStr}\n\n`;
  markdown += `> 自动生成于 ${dateStr} ${timeStr}\n\n`;
  markdown += `---\n\n`;

  // News section
  markdown += formatNews(data.news);

  // GitHub Trending section
  markdown += `---\n\n## 🚀 GitHub 今日热门榜\n\n`;
  markdown += `> 今日新增 stars 最多的项目\n\n`;

  markdown += formatRepos('🤖 AI/ML 项目', data.aiProjects);
  markdown += formatRepos('💻 开发工具', data.devTools);

  // Statistics
  const newsCount = data.news?.length || 0;
  const aiCount = data.aiProjects?.length || 0;
  const devCount = data.devTools?.length || 0;

  markdown += `---\n\n`;
  markdown += `## 📊 今日统计\n\n`;
  markdown += `- 📰 AI 新闻：${newsCount} 条\n`;
  markdown += `- 🤖 AI 项目：${aiCount} 个\n`;
  markdown += `- 💻 开发工具：${devCount} 个\n`;
  markdown += `\n---\n\n`;
  markdown += `💡 由 AI 自动生成 | 来源：[GitHub](https://github.com) • [AI News](https://openai.com/blog)\n`;

  return markdown;
}

/**
 * Convert Markdown to HTML (basic)
 * @param {string} markdown - Markdown content
 * @returns {string} - HTML content
 */
export function markdownToHTML(markdown) {
  let html = markdown;

  // Headers
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

  // Links
  html = html.replace(/🔗 (.*$)/gim, '<a href="$1">$1</a>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');

  // Line breaks and horizontal rules
  html = html.replace(/---/gim, '<hr>');
  html = html.replace(/\n\n/gim, '</p><p>');
  html = html.replace(/\n/gim, '<br>');

  // Wrap in HTML structure
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; }
    h3 { color: #1e3a8a; }
    h4 { color: #1e3a8a; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
  </style>
</head>
<body>
  <div>${html}</div>
</body>
</html>
  `;
}
