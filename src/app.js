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
  const feedUrls = feeds.map((feed) => feed.url);
  const schema = yup.object().shape({
    url: yup.string().url().notOneOf(feedUrls),
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
          currentStatus: '',
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

      // Functions
      const loadPosts = (url) => {
        const { loadingProcess } = state;
        const origins = 'https://allorigins.hexlet.app/get?url=';
        // Start loading
        try {
          const response = axios.get(`${origins}${encodeURIComponent(url)}`);
          const data = response.then((content) => content.data);
          return data;
        } catch (loadError) {
          // Loading failed
          loadingProcess.errors.push(error.message);
          throw loadError;
        }
      };

      // Controller
      const { form, input } = elements;

      const handleSubmit = (e) => {
        e.preventDefault();

        const value = new FormData(e.target).get('url');
        state.form.fields.url = value;

        validateUrl(state.form.fields.url, state.feeds)
          .then(() => {
            // Validation successful
            state.form.isValid = true;
            state.form.errors = {};

            // Load posts
            loadPosts(state.form.fields.url).then((content) => {
              const contentType = content.status.content_type;

              if (contentType.startsWith('application/rss+xml')) {
                state.form.errors = i18nInstance.t(`errors.rssLoaded`);

                // If type is correct then parse
                const parsedFeed = parse(content, state.form.fields.url);
                const { feed, posts } = parsedFeed;

                state.feeds.push(feed);
                state.posts.push(...posts);
              } else {
                state.form.isValid = false;
                state.form.errors = i18nInstance.t(`errors.noValidRss`);
              }
            });
          })
          .catch((validationError) => {
            // Validation failed
            state.form.isValid = false;
            const message = validationError.errors[0].key;
            state.form.errors = i18nInstance.t(`errors.${message}`);
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
