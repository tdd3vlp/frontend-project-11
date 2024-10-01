import axios from 'axios';

export default (url) => {
  const origins = 'https://allorigins.hexlet.app/get?url=';
  const response = axios.get(`${origins}${encodeURIComponent(url)}`);
  return response
    .then((content) => content.data)
    .catch((responseError) => responseError);
};
