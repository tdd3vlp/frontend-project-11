import * as yup from 'yup';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import parse from './parse.js';
import './styles.scss';
import 'bootstrap';
import resources from './locales/index.js';
import watchedState from './view.js';
import elements from '../utils/elements.js';
import loadPosts from '../utils/loadPosts.js';

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

      // Controller
      const { form, input } = elements;

      const handleSubmit = (e) => {
        e.preventDefault();

        const currentUrl = new FormData(e.target).get('url');

        validateUrl(currentUrl, state.feeds)
          .then(() => {
            // Validation successful
            state.form.isValid = true;
            state.form.errors = {};

            // Load posts
            loadPosts(currentUrl)
              .then((responseResult) => {
                // If query is in error
                if (responseResult instanceof Error) {
                  state.form.isValid = false;
                  state.form.errors = i18nInstance.t('errors.responseError');
                  console.log('Response error: ', responseResult.message);
                }
                // If query is successful
                const parsedFeed = parse(responseResult, currentUrl);
                const { feed, posts } = parsedFeed;
                state.form.errors = i18nInstance.t('errors.rssLoaded');

                // Change state
                state.feeds.push(feed);
                state.posts.push(...posts);
              })
              .catch((loadError) => {
                state.form.isValid = false;
                // If query wasn't in error and tried to load the data
                if (Object.keys(state.form.errors).length === 0) {
                  state.form.errors = i18nInstance.t('errors.noValidRss');
                  console.log('Load error: ', loadError);
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