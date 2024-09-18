import * as yup from 'yup';
import './styles.scss';
import 'bootstrap';
import watchedState from './components/stateWatcher.js';

const schema = yup.object().shape({
  url: yup.string().url('Enter correct URL').notOneOf([]),
});

// ----- MODEL -----

const state = {
  form: {
    isValid: true,
    fields: {
      url: '',
    },
    errors: [],
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

const form = document.querySelector('form');
const input = document.querySelector('input');

// ----- CONTROLLER -----

// ----- EXPORTS -----

export default state;
