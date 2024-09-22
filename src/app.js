import * as yup from 'yup';
import watch from './view.js';
import './styles.scss';
import 'bootstrap';

export default () => {
  //   ELEMENTS
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
  };

  // STATE
  const initialState = {
    form: {
      isValid: true,
      fields: {
        url: '',
      },
      error: '',
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

  const state = watch(elements, initialState);

  //   CONTROLLER
  const { form, input, feedback } = elements;

  function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const value = formData.get('url');

    state.form.fields.url = value;

    const validateUrl = (url, feeds) => {
      const schema = yup.object().shape({
        url: yup.string().url('Enter correct URL').notOneOf(feeds, 'URL already used...'),
      });

      return schema.validate({ url });
    };

    validateUrl(state.form.fields.url, state.feeds)
      .then(() => {
        const { url } = state.form.fields;
        state.feeds.push(url);
        // Я так понимаю, мы управляем отображением в зависимости от результата валидации
        state.isValid = true;

        // Но как тогда выполнить код ниже через render в случае успеха и ошибки?
        // Проверь, пожалуйста, наверное, я запустался из-за того,
        // что неправильно написана функция во View, пока не совсем понимаю,
        // как это все работает. То же самое было в Архитектуре Фронтенда.

        input.classList.remove('is-invalid');
        feedback.textContent = '';
      })
      .catch((error) => {
        state.isValid = false;
        state.form.error = error;

        // Тут должен быть render, наверное
        input.classList.add('is-invalid');
        feedback.textContent = state.form.error;
      });

    form.reset();
    input.focus();
  }

  form.addEventListener('submit', handleSubmit);
};
