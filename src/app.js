import * as yup from 'yup';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import watchedState from './view.js';
import resources from './locales/index.js';
import './styles.scss';
import 'bootstrap';

const validateUrl = (url, feeds) => {
  const schema = yup.object().shape({
    url: yup.string().url('Enter correct URL').notOneOf(feeds, 'URL already used...'),
  });

  return schema.validate({ url });
};

export default () => {
  //   ! ELEMENTS
  const elements = {
    form: document.querySelector('form'),
    heading: document.querySelector('h1'),
    input: document.querySelector('input'),
    label: document.querySelector('label'),
    subheading: document.querySelector('.lead'),
    feedback: document.querySelector('.feedback'),
    button: document.querySelector('button[type="submit"]'),
  };

  // ! LOCALES
  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    use: LanguageDetector,
    resources,
    fallbackLng: 'ru',
    debug: true,
  });

  // ! STATE
  const initialState = {
    form: {
      activeLanguage: 'ru',
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

  const state = watchedState(elements, i18nInstance, initialState);

  //   ! CONTROLLER
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
