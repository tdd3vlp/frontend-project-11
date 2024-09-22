import onChange from 'on-change';

export default (elements, state) => {
  console.log('Elements: ', elements);
  console.log('State: ', state);

  const watchedState = onChange(state, (path, value) => {
    console.log('Path: ', path);
    console.log('Value: ', value);
  });

  return watchedState;
};
