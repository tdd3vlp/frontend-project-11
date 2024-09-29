import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import parse from './parse.js';
import './styles.scss';
import 'bootstrap';
import resources from './locales/index.js';
import watchedState from './view.js';
import elements from '../utils/elements.js';

// Functions
const loadFeed = (url) => {
  try {
    const response = axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`);
    const data = response.then((content) => content.data);
    return data;
  } catch (loadError) {
    console.log('Load error:', loadError);
    throw loadError;
  }
};

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
        usedLinks: [],
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

        validateUrl(state.form.fields.url, state.usedLinks)
          .then(() => {
            // Validation successful
            state.form.errors = {};
            // * Set url as valid
            state.form.isValid = true;
            // * Write url to state
            state.usedLinks.push(state.form.fields.url);
            // * Handle successful validation
            loadFeed(state.form.fields.url)
              .then((content) => {
                const parsedFeeds = parse(content);
                state.feeds.push(...parsedFeeds);
              })
              .catch((parseError) => {
                console.log('Parse error:', parseError);
                throw parseError;
              });
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

// https://lorem-rss.hexlet.app/feed
