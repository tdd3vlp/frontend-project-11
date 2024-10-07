import { uniqueId } from 'lodash';

// eslint-disable-next-line consistent-return
export default (content, url) => {
  const { contents, status } = content;

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(contents, 'application/xml');

  if (status.content_type.startsWith('application/rss+xml')) {
    // Feed
    const feedTitle = xmlDoc.querySelector('title');
    const feedDescription = xmlDoc.querySelector('description');

    // Posts
    const items = xmlDoc.querySelectorAll('item');
    const posts = Array.from(items).map((item) => {
      const title = item.querySelector('title');
      const description = item.querySelector('description');
      const link = item.querySelector('link');

      return {
        id: uniqueId(),
        title: title.textContent,
        description: description.textContent,
        link: link.textContent,
      };
    });

    return {
      feed: {
        title: feedTitle.textContent,
        description: feedDescription.textContent,
        url,
      },
      posts: [...posts],
    };
  }
};
