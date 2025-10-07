export async function bootstrapPage({ sectionId, pageTitle, intro }) {
  const navRoot = document.getElementById('nav-root');
  const sectionRoot = document.getElementById('section-root');
  const footerRoot = document.getElementById('footer-root');
  const introRoot = document.getElementById('intro-root');

  if (!sectionId) {
    throw new Error('Не указан идентификатор секции для загрузки.');
  }

  try {
    const response = await fetch('../index.html', { credentials: 'same-origin' });
    if (!response.ok) {
      throw new Error(`Не удалось загрузить index.html: ${response.status}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const nav = doc.getElementById('site-nav');
    if (nav && navRoot) {
      const navClone = nav.cloneNode(true);
      normalizeNavLinks(navClone, sectionId);
      navRoot.replaceChildren(navClone);
    }

    const section = doc.getElementById(sectionId);
    if (sectionRoot && !section) {
      throw new Error(`Секция с id="${sectionId}" не найдена в index.html.`);
    }
    if (sectionRoot && section) {
      const sectionClone = section.cloneNode(true);
      sectionRoot.replaceChildren(sectionClone);
    }

    if (introRoot && intro) {
      introRoot.textContent = intro;
    }

    const footer = doc.getElementById('site-footer');
    if (footer && footerRoot) {
      footerRoot.replaceChildren(footer.cloneNode(true));
    }

    if (pageTitle) {
      document.title = pageTitle;
    }
  } catch (error) {
    if (sectionRoot) {
      const message = document.createElement('div');
      message.className =
        'rounded-3xl border border-rose-200 bg-rose-50/70 p-6 text-sm font-medium text-rose-600 shadow-lg';
      message.textContent =
        'Не удалось загрузить содержимое страницы. Проверьте, что сервер запущен и index.html доступен.';
      sectionRoot.replaceChildren(message);
    }
    console.error(error);
  }
}

function normalizeNavLinks(navElement, sectionId) {
  const links = navElement.querySelectorAll('a[href]');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) {
      return;
    }

    if (href === '/') {
      link.setAttribute('href', '../index.html');
      return;
    }

    if (href.startsWith('#')) {
      link.setAttribute('href', `../index.html${href}`);
    }
  });

  const activeLink = navElement.querySelector(`a[href="../index.html#${sectionId}"]`);
  if (activeLink) {
    activeLink.classList.add('text-indigo-600');
    activeLink.classList.add('font-semibold');
  }
}
