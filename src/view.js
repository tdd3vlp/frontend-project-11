import onChange from 'on-change';

export default (elements, i18n, initialState) => {
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

  const handleFormErrors = (value) => {
    const { feedback } = elements;
    const { message } = value;

    feedback.textContent = message;
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
      default:
        break;
    }
  };

  return onChange(initialState, render(elements, initialState));
};
