// eslint-disable-next-line consistent-return
export default (content, url, generateId) => {
  const { contents } = content;
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(contents, 'application/xml');

  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error(parseError.textContent);
  }

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
      id: generateId(),
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
};
