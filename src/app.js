import * as yup from 'yup';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import axios from 'axios';
import parse from './parse.js';
import './styles.scss';
import 'bootstrap';
import resources from './locales/index.js';
import watchedState from './view.js';
import elements from '../utils/elements.js';

// Yup rules
yup.setLocale({
  string: {
    url: ({ url }) => ({ key: 'invalidUrl', values: { url } }),
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

      const handleSuccessfulSubmit = () => {
        state.form.isValid = true;
        state.form.errors = {};
      };

      const handleFailedSubmit = (urlValidationError) => {
        state.form.isValid = false;
        const { key } = urlValidationError.errors[0];
        state.form.errors = i18nInstance.t(`errors.${key}`);
      };

      const fetchPosts = (url) => axios
        .get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`)
        .then((content) => content)
        .catch((networkError) => {
          state.form.isValid = false;
          state.form.errors = i18nInstance.t('errors.networkError');
          console.log('Response error: ', networkError.message);
        });

      const updatePosts = () => {
        const promises = state.feeds.map((feed) => fetchPosts(feed.url)
          .then((content) => {
            const { posts } = parse(content.data, feed.url);
            console.log(posts);
          }).catch((err) => {
            console.log(err);
          }));

        Promise.all(promises)
          .then(() => {
            // setTimeout(updatePosts, 5000);
            console.log('Posts updated');
          }).catch((err) => {
            console.log('Error occured', err);
          });
      };

      const handleSubmit = (e) => {
        e.preventDefault();

        const currentUrl = new FormData(e.target).get('url');

        validateUrl(currentUrl, state.feeds)
          .then(() => {
            handleSuccessfulSubmit();
            fetchPosts(currentUrl)
              .then((content) => {
                const { feed, posts } = parse(content.data, currentUrl);
                state.form.errors = i18nInstance.t('errors.validRss');

                state.feeds.push(feed);
                state.posts.push(...posts);

                setTimeout(updatePosts, 5000);
              })
              .catch((parseError) => {
                state.form.isValid = false;
                state.form.errors = i18nInstance.t('errors.invalidRss');
                console.log('Parsing error: ', parseError);
              });
          })
          .catch((urlValidationError) => handleFailedSubmit(urlValidationError));

        form.reset();
        input.focus();
      };
      form.addEventListener('submit', handleSubmit);
    })
    .catch((error) => {
      console.log('i18next initialization error', error);
    });
};
