import * as yup from 'yup';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import axios from 'axios';
import { uniqueId } from 'lodash';
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
          seenPosts: [],
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
        state.loadingProcess.currentStatus = state.loadingProcess.status.loading;
      };

      const handleFailedSubmit = (urlValidationError) => {
        state.form.isValid = false;
        const { key } = urlValidationError.errors[0];
        state.form.errors = i18nInstance.t(`errors.${key}`);
      };

      const fetchPosts = (url) => axios
        .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
        .then((content) => content)
        .catch((networkError) => {
          state.form.isValid = false;
          state.form.errors = { error: networkError, isNetworkError: true };
          console.log('Response error: ', networkError.message);
        });

      const updatePosts = () => {
        const promises = state.feeds.map((feed) => fetchPosts(feed.url)
          .then((content) => {
            const { posts } = parse(content.data, feed.url, uniqueId);
            const updatedPosts = posts.map((p) => ({
              ...p,
              feedId: feed.id,
            }));

            const newPosts = updatedPosts.filter((post) => !state.posts
              .some((existingPost) => existingPost.title === post.title));

            if (newPosts.length > 0) {
              state.posts.unshift(...newPosts);
            }
          })
          .catch((parseError) => {
            console.log('Error fetching posts:', parseError);
          }));

        Promise.all(promises)
          .then(() => {
            setTimeout(updatePosts, 5000);
          })
          .catch((updateError) => {
            console.log(updateError);
          });
      };

      const resetForm = () => {
        form.reset();
        input.focus();
      };

      const handleSuccessfulFetch = (content, url) => {
        state.loadingProcess.currentStatus = state.loadingProcess.status.success;
        resetForm();
        const { feed, posts } = parse(content.data, url, uniqueId);
        const newFeed = { ...feed, id: uniqueId() };
        state.form.errors = i18nInstance.t('errors.validRss');
        state.feeds.push(newFeed);
        state.posts.unshift(...posts);
      };

      const handleFailedFetch = (error) => {
        state.loadingProcess.currentStatus = state.loadingProcess.status.fail;
        state.form.isValid = false;
        if (state.form.errors.isNetworkError) {
          state.form.errors = i18nInstance.t('errors.networkError');
        } else {
          state.form.errors = i18nInstance.t('errors.invalidRss');
          console.log('Parsing error: ', error);
        }
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        const currentUrl = new FormData(e.target).get('url');
        validateUrl(currentUrl, state.feeds)
          .then(() => {
            handleSuccessfulSubmit();
            fetchPosts(currentUrl)
              .then((content) => {
                handleSuccessfulFetch(content, currentUrl);
                setTimeout(updatePosts, 5000);
              })
              .catch((parseError) => {
                handleFailedFetch(parseError);
              });
          })
          .catch((urlValidationError) => handleFailedSubmit(urlValidationError));
      };

      form.addEventListener('submit', handleSubmit);
      const { postsContainer } = elements;

      postsContainer.addEventListener('click', (event) => {
        if (event.target.matches('button')) {
          const { id } = event.target.dataset;
          state.uiState.seenPosts.push(id);
        }
      });
    })
    .catch((error) => {
      console.log('i18next initialization error', error);
    });
};
