import onChange from 'on-change';
import state from '../index.js';

// ----- VIEW -----
const render = () => {};
const watchedState = onChange(state, (path, value) => {});

export default watchedState;
