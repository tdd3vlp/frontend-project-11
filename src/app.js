/* eslint-disable no-param-reassign */
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

const startTimer = (updatePosts, state, interval = 5000) => {
  const recursiveTimeout = () => {
    updatePosts(state)
      .then(() => {
        setTimeout(recursiveTimeout, interval);
      })
      .catch((error) => {
        console.log('Update error:', error);
        setTimeout(recursiveTimeout, interval);
      });
  };

  setTimeout(recursiveTimeout, interval);
};

const handleSuccessfulSubmit = (state) => {
  state.form.isValid = true;
  state.form.errors = {};
  state.loadingProcess.currentStatus = state.loadingProcess.status.loading;
};

const handleFailedSubmit = (error, state, i18nInstance) => {
  state.form.isValid = false;
  const { key } = error.errors[0];
  state.form.errors = i18nInstance.t(`errors.${key}`);
};

const { form, input } = elements;
const resetForm = () => {
  form.reset();
  input.focus();
};

const handleSuccessfulFetch = (content, url, state, i18nInstance) => {
  state.loadingProcess.currentStatus = state.loadingProcess.status.success;
  resetForm();
  const { feed, posts } = parse(content.data, url, uniqueId);
  state.form.errors = i18nInstance.t('errors.validRss');
  state.feeds.unshift({ ...feed, id: uniqueId() });
  state.posts.unshift(...posts);
};

const handleFailedFetch = (error, state, i18nInstance) => {
  state.loadingProcess.currentStatus = state.loadingProcess.status.fail;
  state.form.isValid = false;
  if (state.form.errors.isNetworkError) {
    state.form.errors = i18nInstance.t('errors.networkError');
  } else {
    state.form.errors = i18nInstance.t('errors.invalidRss');
    console.log('Parsing error: ', error);
  }
};

const fetchPosts = (url, state) => axios
  .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
  .then((content) => content)
  .catch((networkError) => {
    state.form.isValid = false;
    state.form.errors = { error: networkError, isNetworkError: true };
    console.log('Response error: ', networkError.message);
  });

const updatePosts = (state) => {
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

  return Promise.all(promises);
};

const handleSubmit = (event, state, i18nInstance) => {
  event.preventDefault();
  const currentUrl = new FormData(event.target).get('url');
  validateUrl(currentUrl, state.feeds)
    .then(() => {
      handleSuccessfulSubmit(state);
      fetchPosts(currentUrl, state)
        .then((content) => {
          handleSuccessfulFetch(content, currentUrl, state, i18nInstance);
        })
        .catch((parseError) => {
          handleFailedFetch(parseError, state, i18nInstance);
        });
    })
    .catch((urlValidationError) => handleFailedSubmit(
      urlValidationError,
      state,
      i18nInstance,
    ));
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
      form.addEventListener('submit', (event) => {
        handleSubmit(event, state, i18nInstance);
      });

      const { postsContainer } = elements;
      postsContainer.addEventListener('click', (event) => {
        if (event.target.matches('button') || event.target.matches('a')) {
          const { id } = event.target.dataset;
          state.uiState.seenPosts.push(id);
        }
      });

      startTimer(updatePosts, state, 5000);
    })
    .catch((error) => {
      console.log('i18next initialization error', error);
    });
};
