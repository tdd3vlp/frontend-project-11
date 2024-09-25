import onChange from 'on-change';

export default (elements, i18next, initialState) => {
  // ! FUNCTIONS
  const handleFormState = (value) => {
    const { input } = elements;
    switch (value) {
      case true:
        input.classList.remove('is-invalid');
        break;
      case false:
        input.classList.add('is-invalid');
        break;
      default:
        break;
    }
  };

  const handleFormErrors = (error) => {
    const { feedback } = elements;

    if (Object.keys(error).length === 0) {
      feedback.textContent = '';
    } else {
      feedback.textContent = error;
    }
  };

  const changeLanguage = (language) => {
    i18next.changeLanguage(language, (err, t) => {
      const { heading, subheading, button, label } = elements;

      if (err) return console.log(err);

      label.textContent = t('label');
      button.textContent = t('button');
      heading.textContent = t('heading');
      subheading.textContent = t('subheading');
    });
  };

  // ! RENDER
  const render = () => (path, value) => {
    switch (path) {
      case 'form.isValid':
        handleFormState(value);
        break;
      case 'form.errors':
        handleFormErrors(value);
        break;
      case 'form.activeLanguage':
        changeLanguage(value);
        break;
      default:
        break;
    }
  };

  return onChange(initialState, render(elements, initialState));
};
