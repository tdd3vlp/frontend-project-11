import onChange from 'on-change';

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

  const buildCard = (type) => {
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    const cardTitle = document.createElement('h2');
    cardTitle.classList.add('card-title', 'h4');

    switch (type) {
      case 'post':
        cardTitle.textContent = 'Посты';
        break;
      case 'feed':
        cardTitle.textContent = 'Фиды';
        break;
      default:
        break;
    }
    cardBody.append(cardTitle);
    card.append(cardBody);

    return card;
  };

  const buildList = () => {
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    return ul;
  };

  const buildListItem = (type) => {
    const li = document.createElement('li');

    switch (type) {
      case ('post'):
        li.classList.add(
          'list-group-item',
          'd-flex',
          'justify-content-between',
          'align-items-start',
          'border-0',
          'border-end-0',
        );
        break;
      case 'feed':
        li.classList.add(
          'list-group-item',
          'border-0',
          'border-end-0',
        );
        break;
      default:
        break;
    }

    return li;
  };

  const buildLink = (post) => {
    const link = document.createElement('a');
    link.classList.add('fw-bold');
    link.setAttribute('href', post.link);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.dataset.id = post.id;
    link.textContent = post.title;

    return link;
  };

  const buildButton = (post) => {
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.dataset.id = post.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = 'Просмотр';

    return button;
  };

  const buildTitle = (feed) => {
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;

    return h3;
  };

  const buildDescription = (feed) => {
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;

    return p;
  };

  const renderNewPosts = (posts) => {
    const { postsContainer } = elements;
    postsContainer.innerHTML = '';
    const isCardRendered = postsContainer.querySelector('.card');
    const card = buildCard('post');
    if (!isCardRendered) {
      postsContainer.append(card);
    }
    const isListGroupRendered = card.querySelector('ul');
    const ul = buildList();
    if (!isListGroupRendered) {
      card.append(ul);
    }
    ul.innerHTML = '';
    posts.forEach((post) => {
      const li = buildListItem('post');
      const link = buildLink(post);
      const button = buildButton(post);
      li.append(link, button);
      ul.append(li);
    });
  };

  const renderNewFeeds = (feeds) => {
    const { feedsContainer } = elements;
    feedsContainer.innerHTML = '';
    const isCardRendered = feedsContainer.querySelector('.card');
    const card = buildCard('feed');
    if (!isCardRendered) {
      feedsContainer.append(card);
    }
    const isListGroupRendered = card.querySelector('ul');
    const ul = buildList();
    if (!isListGroupRendered) {
      card.append(ul);
    }
    ul.innerHTML = '';
    feeds.forEach((feed) => {
      const li = buildListItem('feed');
      const h3 = buildTitle(feed);
      const p = buildDescription(feed);
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

  const renderSeenPosts = (seenPosts) => {
    const { postsContainer, modalTitle, modalBody } = elements;
    const links = postsContainer.querySelectorAll('a');

    if (seenPosts.length > 0) {
      const currentPostId = seenPosts.at(-1);
      const currentPost = initialState.posts.find((post) => post.id === currentPostId);
      modalTitle.textContent = currentPost.title;
      modalBody.textContent = currentPost.description;

      links.forEach((link) => {
        const { id } = link.dataset;
        if (seenPosts.includes(id)) {
          link.classList.remove('fw-bold');
          link.classList.add('fw-normal', 'link-secondary');
        } else {
          link.classList.add('fw-bold');
        }
      });
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
        renderSeenPosts(value);
        break;
      case 'posts':
        renderNewPosts(value);
        renderSeenPosts(initialState.uiState.seenPosts);
        break;
      case 'feeds':
        renderNewFeeds(value);
        break;
      default:
        break;
    }
  };

  return onChange(initialState, render(elements, initialState));
};
