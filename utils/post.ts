import { allPosts, Post } from 'contentlayer2/generated';
import { compareDesc, format, parseISO } from 'date-fns';
import { filterVisiblePosts } from './post-visibility';

export const getPostTimeLine = (tag = '') => {
  const posts = filterVisiblePosts(allPosts).sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  const dateMap = {} as Record<string, Post[]>;

  // 解析多个 tag（逗号分割）
  const tags = tag
    ? tag
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    : [];

  posts.forEach((post) => {
    // 如果指定了 tags，文章必须包含所有指定的 tags
    if (tags.length > 0) {
      const hasAllTags = tags.every((t) => post.tags.includes(t));
      if (!hasAllTags) {
        return;
      }
    }
    const year = format(parseISO(post.date), 'yyyy');
    if (!dateMap[year]) {
      dateMap[year] = [];
    }
    dateMap[year].push(post);
  });

  return {
    length: Object.values(dateMap).reduce((acc, arr) => acc + arr.length, 0),
    value: dateMap,
  };
};

/**
 * 计算文章的字数和阅读时间
 * @param raw 文章的 markdown 正文（contentlayer 的 body.raw，已不含 frontmatter）
 * @returns { words: number, readingTime: number } 字数和阅读时间（分钟）
 */
export const calculateReadingStats = (raw: string) => {
  // 从 markdown 正文中提取纯文本
  let text = raw
    // 移除代码块和行内代码（其中的代码不计入正文字数）
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    // 移除图片 ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    // 链接 [text](url) 只保留显示文字，丢弃 url
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // 移除 HTML / JSX 标签
    .replace(/<[^>]+>/g, ' ')
    // 移除特殊字符，保留中英文和基本标点
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s，。！？、；：""''（）【】《》]/g, ' ')
    // 合并空格
    .replace(/\s+/g, ' ')
    .trim();

  // 中文字符按字计算
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;

  // 英文按单词计算（移除中文后）
  const englishText = text.replace(/[\u4e00-\u9fa5]/g, ' ').trim();
  const englishWords = englishText
    ? englishText.split(/\s+/).filter((word) => word.length > 0).length
    : 0;

  // 总字数：中文字符数 + 英文单词数
  const words = chineseChars + englishWords;

  // 阅读速度：
  // - 中文：300 字/分钟
  // - 英文：200 词/分钟
  // 分别计算后取较大值，更符合实际阅读体验
  const chineseTime = chineseChars > 0 ? Math.ceil(chineseChars / 300) : 0;
  const englishTime = englishWords > 0 ? Math.ceil(englishWords / 200) : 0;

  // 阅读时间取两者之和（因为阅读时会同时处理中英文）
  const readingTime = Math.max(1, chineseTime + englishTime);

  return { words, readingTime };
};
