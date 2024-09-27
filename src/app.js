import * as yup from 'yup';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import watchedState from './view.js';
import resources from './locales/index.js';
import './styles.scss';
import 'bootstrap';

// Yup rules
yup.setLocale({
  string: {
    url: ({ url }) => ({ key: 'invalidRss', values: { url } }),
  },
  mixed: {
    notOneOf: ({ values }) => ({ key: 'rssExists', values: { values } }),
  },
});

const validateUrl = (url, feeds) => {
  const schema = yup.object().shape({
    url: yup.string().url().notOneOf(feeds),
  });

  return schema.validate({ url });
};

// App
export default () => {
  const elements = {
    form: document.querySelector('form'),
    heading: document.querySelector('h1'),
    input: document.querySelector('input'),
    label: document.querySelector('label'),
    subheading: document.querySelector('.lead'),
    feedback: document.querySelector('.feedback'),
    button: document.querySelector('button[type="submit"]'),
  };

  // Locales
  const i18nInstance = i18next.createInstance();

  i18nInstance
    .use(LanguageDetector)
    .init({
      resources,
      fallbackLng: 'ru',
      debug: false,
    })
    .then(() => {
      // State
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
      // Watched state
      const state = watchedState(elements, i18nInstance, initialState);

      // Controller
      const { form, input } = elements;

      const handleSubmit = (e) => {
        e.preventDefault();

        const value = new FormData(e.target).get('url');
        state.form.fields.url = value;

        validateUrl(state.form.fields.url, state.feeds)
          .then(() => {
            // Validation successful
            state.form.errors = {};
            state.form.isValid = true;
            state.feeds.push(state.form.fields.url);
          })
          .catch((validationError) => {
            // Validation failed
            const message = validationError.errors[0].key;
            state.form.errors = i18nInstance.t(`errors.${message}`);
            state.form.isValid = false;
          });

        form.reset();
        input.focus();
      };

      form.addEventListener('submit', handleSubmit);
    })
    .catch((error) => {
      console.log('i18next initialization error', error);
    });
};
