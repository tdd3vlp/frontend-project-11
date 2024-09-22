import onChange from 'on-change';

export default (elements, state) => {
  const render = () => {};

  const watchedState = onChange(state, (path, value) => {
    console.log(path);
    console.log(value);
  });

  render();

  return watchedState;
};
