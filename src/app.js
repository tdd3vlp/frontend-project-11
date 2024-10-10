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

let timerId;

const startTimer = (fn) => {
  const updateTime = 5000;
  timerId = setTimeout(fn, updateTime);
};

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

const handleSuccessfulSubmit = (state) => {
  const newState = state;
  newState.form.isValid = true;
  newState.form.errors = {};
  newState.loadingProcess.currentStatus = state.loadingProcess.status.loading;
};

const handleFailedSubmit = (error, state, i18nInstance) => {
  const newState = state;
  newState.form.isValid = false;
  const { key } = error.errors[0];
  newState.form.errors = i18nInstance.t(`errors.${key}`);
};

const { form, input } = elements;
const resetForm = () => {
  form.reset();
  input.focus();
};

const handleSuccessfulFetch = (content, url, state, i18nInstance) => {
  const newState = state;
  newState.loadingProcess.currentStatus = state.loadingProcess.status.success;
  resetForm();
  const { feed, posts } = parse(content.data, url, uniqueId);
  const newFeed = { ...feed, id: uniqueId() };
  newState.form.errors = i18nInstance.t('errors.validRss');
  state.feeds.unshift(newFeed);
  state.posts.unshift(...posts);
};

const handleFailedFetch = (error, state, i18nInstance) => {
  const newState = state;
  newState.loadingProcess.currentStatus = state.loadingProcess.status.fail;
  newState.form.isValid = false;
  if (newState.form.errors.isNetworkError) {
    newState.form.errors = i18nInstance.t('errors.networkError');
  } else {
    newState.form.errors = i18nInstance.t('errors.invalidRss');
    console.log('Parsing error: ', error);
  }
};

const fetchPosts = (url, state) => {
  const newState = state;
  return axios
    .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((content) => content)
    .catch((networkError) => {
      newState.form.isValid = false;
      newState.form.errors = { error: networkError, isNetworkError: true };
      console.log('Response error: ', networkError.message);
    });
};

const updatePosts = (state) => {
  if (timerId) {
    clearTimeout(timerId);
  }

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
      startTimer(() => updatePosts(state));
    })
    .catch((updateError) => {
      console.log(updateError);
    });
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
          updatePosts(state);
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
    })
    .catch((error) => {
      console.log('i18next initialization error', error);
    });
};
