import * as yup from 'yup';
import watch from './view.js';
import './styles.scss';
import 'bootstrap';

const validateUrl = (url, feeds) => {
  const schema = yup.object().shape({
    url: yup.string().url('Enter correct URL').notOneOf(feeds, 'URL already used...'),
  });

  return schema.validate({ url });
};

export default () => {
  //   ELEMENTS
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
  };

  // STATE
  const initialState = {
    form: {
      isValid: true,
      fields: {
        url: '',
      },
      errors: {},
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

  const state = watch(elements, initialState);

  //   CONTROLLER
  const { form, input } = elements;

  function handleSubmit(e) {
    e.preventDefault();

    const value = new FormData(e.target).get('url');
    state.form.fields.url = value;

    validateUrl(state.form.fields.url, state.feeds)
      .then(() => {
        state.form.errors = {};
        state.form.isValid = true;
        state.feeds.push(state.form.fields.url);
      })
      .catch((validationError) => {
        state.form.errors = validationError;
        state.form.isValid = false;
      });

    form.reset();
    input.focus();
  }

  form.addEventListener('submit', handleSubmit);
};
