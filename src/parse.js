export default ({ contents }) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(contents, 'application/xml');

  const items = xmlDoc.querySelectorAll('item');

  return Array.from(items).map((item, index) => {
    const title = item.querySelector('title');
    const description = item.querySelector('description');

    return { id: index, title: title.textContent, description: description.textContent };
  });
};
