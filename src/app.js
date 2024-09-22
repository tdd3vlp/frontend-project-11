import * as yup from 'yup';
// import watch from './view.js';
import './styles.scss';
import 'bootstrap';

export default () => {
  // STATE
  const initialState = {
    form: {
      isValid: true,
      fields: {
        url: '',
      },
      error: '',
    },
    loadingProcess: {
      status: { loading: 'loading', success: 'success', fail: 'fail' },
      errors: [],
    },
    uiState: {
      seenPosts: {},
    },
    feeds: [],
    posts: [],
  };

  //   ELEMENTS
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    button: document.querySelector('button'),
    feedback: document.querySelector('.feedback'),
  };

  //   CONTROLLER
  const { form, input, feedback } = elements;

  function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const value = formData.get('url');

    initialState.form.fields.url = value;

    const validateUrl = (url, feeds) => {
      const schema = yup.object().shape({
        url: yup.string().url('Enter correct URL').notOneOf(feeds, 'URL already used...'),
      });

      return schema.validate({ url });
    };

    validateUrl(initialState.form.fields.url, initialState.feeds)
      .then(() => {
        initialState.feeds.push(initialState.form.fields.url);
        input.classList.remove('is-invalid');
        feedback.textContent = '';
      })
      .catch((error) => {
        initialState.form.error = error;
        input.classList.add('is-invalid');
        feedback.textContent = initialState.form.error;
      });

    form.reset();
    input.focus();
  }

  form.addEventListener('submit', handleSubmit);
};
