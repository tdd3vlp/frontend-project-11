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
  // ! LOCALES
  const i18n = i18next.createInstance();

  i18n.init({
    use: LanguageDetector,
    resources,
    fallbackLng: 'en',
    debug: true,
  });

  //   ! ELEMENTS
  const elements = {
    form: document.querySelector('form'),
    heading: document.querySelector('h1'),
    label: document.querySelector('label'),
    button: document.querySelector('button[type="submit"]'),
    subheading: document.querySelector('.lead'),
    feedback: document.querySelector('.feedback'),
  };

  i18n.changeLanguage('ru', (err, t) => {
    const { heading, subheading, button, label } = elements;

    if (err) return console.log(err);

    heading.textContent = t('heading');
    subheading.textContent = t('subheading');
    button.textContent = t('button');
    label.textContent = t('label');
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

  const state = watchedState(elements, i18n, initialState);

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
        console.log(state.form.errors);
        state.form.isValid = false;
      });

    form.reset();
    input.focus();
  }

  form.addEventListener('submit', handleSubmit);
};
