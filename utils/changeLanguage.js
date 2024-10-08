export default (language, i18next, elements) => {
  // eslint-disable-next-line consistent-return
  i18next.changeLanguage(language, (err, t) => {
    const {
      heading,
      subheading,
      button,
      label,
    } = elements;

    if (err) return console.log(err);

    label.textContent = t('label');
    button.textContent = t('button');
    heading.textContent = t('heading');
    subheading.textContent = t('subheading');
  });
};
