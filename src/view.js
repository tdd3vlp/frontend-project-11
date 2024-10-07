import onChange from 'on-change';
import { has } from 'lodash';

export default (elements, i18next, initialState) => {
  // Handle functions
  const changeLanguage = (language) => {
    // eslint-disable-next-line consistent-return
    i18next.changeLanguage(language, (err, t) => {
      const {
        heading,
        subheading,
        button,
        label,
      } = elements;

      if (err) return console.log(err);

      label.textContent = t('label');
      button.textContent = t('button');
      heading.textContent = t('heading');
      subheading.textContent = t('subheading');
    });
  };

  const handleFormState = (value) => {
    const { input } = elements;
    switch (value) {
      case true:
        input.classList.remove('is-invalid');

        break;
      case false:
        input.classList.add('is-invalid');

        break;
      default:
        break;
    }
  };

  const handleFormErrors = (error) => {
    const { feedback } = elements;

    // Define class
    if (initialState.form.isValid) {
      feedback.classList.add('text-success');
      feedback.classList.remove('text-danger');
    } else {
      feedback.classList.add('text-danger');
      feedback.classList.remove('text-success');
    }

    // Show error message
    if (Object.keys(error).length === 0) {
      feedback.textContent = '';
    } else {
      feedback.textContent = error;
    }
  };

  const handleSeenPosts = (seenPosts) => {
    const { postsContainer, modalTitle, modalBody } = elements;
    const links = postsContainer.querySelectorAll('a');

    links.forEach((link) => {
      const { id } = link.dataset;
      const currentPost = seenPosts.find((post) => post.id === id);

      if (currentPost) {
        link.classList.add('fw-normal');
        link.classList.add('link-secondary');
        link.classList.remove('fw-bold');
        modalTitle.textContent = currentPost.title;
        modalBody.textContent = currentPost.description;
      } else {
        link.classList.add('fw-bold');
      }
    });
  };

  const renderPosts = (posts) => {
    const { postsContainer } = elements;

    let card = postsContainer.querySelector('.card');

    if (!card) {
      card = document.createElement('div');
      card.classList.add('card', 'border-0');

      const cardBody = document.createElement('div');
      cardBody.classList.add('card-body');

      const cardTitle = document.createElement('h2');
      cardTitle.classList.add('card-title', 'h4');
      cardTitle.textContent = 'Посты';
      cardBody.append(cardTitle);

      card.append(cardBody);
      postsContainer.append(card);
    }

    let ul = card.querySelector('ul');

    if (!ul) {
      ul = document.createElement('ul');
      ul.classList.add('list-group', 'border-0', 'rounded-0');
      card.append(ul);
    }

    ul.innerHTML = '';

    posts.forEach((post) => {
      const li = document.createElement('li');
      li.classList.add(
        'list-group-item',
        'd-flex',
        'justify-content-between',
        'align-items-start',
        'border-0',
        'border-end-0',
      );

      const link = document.createElement('a');
      link.setAttribute('href', post.link);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.dataset.id = post.id;
      link.textContent = post.title;

      const button = document.createElement('button');
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.setAttribute('type', 'button');
      button.dataset.id = post.id;
      button.dataset.bsToggle = 'modal';
      button.dataset.bsTarget = '#modal';
      button.textContent = 'Просмотр';

      li.append(link, button);
      ul.append(li);
    });

    handleSeenPosts(initialState.uiState.seenPosts);
  };

  const renderFeeds = (feeds) => {
    const { feedsContainer } = elements;

    let card = feedsContainer.querySelector('.card');

    if (!card) {
      card = document.createElement('div');
      card.classList.add('card', 'border-0');

      const cardBody = document.createElement('div');
      cardBody.classList.add('card-body');

      const cardTitle = document.createElement('h2');
      cardTitle.classList.add('card-title', 'h4');
      cardTitle.textContent = 'Фиды';
      cardBody.append(cardTitle);

      card.append(cardBody);
      feedsContainer.append(card);
    }

    let ul = card.querySelector('ul');

    if (!ul) {
      ul = document.createElement('ul');
      ul.classList.add('list-group', 'border-0', 'rounded-0');
      card.append(ul);
    }

    ul.innerHTML = '';

    feeds.forEach((feed) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'border-0', 'border-end-0');
      const h3 = document.createElement('h3');
      h3.classList.add('h6', 'm-0');
      h3.textContent = feed.title;
      const p = document.createElement('p');
      p.classList.add('m-0', 'small', 'text-black-50');
      p.textContent = feed.description;

      li.append(h3, p);
      ul.append(li);
    });
  };

  const handleLoading = (value) => {
    const { button, input } = elements;
    switch (value) {
      case 'loading':
        button.disabled = true;
        input.disabled = true;
        break;
      case 'success':
        button.disabled = false;
        input.disabled = false;
        break;
      case 'fail':
        button.disabled = false;
        input.disabled = false;
        break;
      default:
        break;
    }
  };

  //  Render
  const render = () => (path, value) => {
    switch (path) {
      case 'form.isValid':
        handleFormState(value);
        break;
      case 'form.errors':
        handleFormErrors(value);
        break;
      case 'loadingProcess.currentStatus':
        handleLoading(value);
        break;
      case 'form.activeLanguage':
        changeLanguage(value);
        break;
      case 'uiState.seenPosts':
        handleSeenPosts(value);
        break;
      case 'posts':
        renderPosts(value);
        break;
      case 'feeds':
        renderFeeds(value);
        break;
      default:
        break;
    }
  };

  return onChange(initialState, render(elements, initialState));
};
