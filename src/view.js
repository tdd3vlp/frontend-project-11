import onChange from 'on-change';

export default (elements, i18next, initialState) => {
  // Handle functions
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

  const handleFormState = (value) => {
    const { input, feedback } = elements;
    switch (value) {
      case true:
        input.classList.remove('is-invalid');
        feedback.classList.add('text-success');
        feedback.classList.remove('text-danger');
        break;
      case false:
        input.classList.add('is-invalid');
        feedback.classList.add('text-danger');
        feedback.classList.remove('text-success');
        break;
      default:
        break;
    }
  };

  const handleFormErrors = (error) => {
    console.log();
    const { feedback } = elements;

    if (Object.keys(error).length === 0) {
      feedback.textContent = '';
    } else {
      feedback.textContent = error;
    }
  };

  const createList = () => {};

  //  Render
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
      case 'feeds':
        createList(value);
        break;
      default:
        break;
    }
  };

  return onChange(initialState, render(elements, initialState));
};
