import { uniqueId } from 'lodash';

// eslint-disable-next-line consistent-return
export default (content, url) => {
  const { contents } = content;

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(contents, 'application/xml');

  const contentType = content.status.content_type;

  if (contentType.startsWith('application/rss+xml')) {
    // Feed
    const feedTitle = xmlDoc.querySelector('title');
    const feedDescription = xmlDoc.querySelector('description');
    const feedId = uniqueId();

    // Posts
    const items = xmlDoc.querySelectorAll('item');
    const posts = Array.from(items).map((item, index) => {
      const title = item.querySelector('title');
      const description = item.querySelector('description');
      const link = item.querySelector('link');

      return {
        feedId,
        id: index,
        title: title.textContent,
        description: description.textContent,
        link: link.textContent,
      };
    });

    return {
      feed: {
        id: feedId,
        title: feedTitle.textContent,
        description: feedDescription.textContent,
        url,
      },
      posts: [...posts],
    };
  }
};
