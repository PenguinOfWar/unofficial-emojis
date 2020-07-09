import isClient from '@bagofholding/is-client';
import debounce from 'lodash.debounce';

export default class Core {
  constructor(items = []) {
    this.library = {};

    if (isClient()) {
      window.__UNOFFICIAL_EMOJIS_DEBUG = this;
      this.monitor(items);
    }
  }

  get cached() {
    return this.library;
  }

  async monitor(items = []) {
    const context = this;
    const scan = this.scan;

    const mutationObserver = new MutationObserver(
      debounce(() => scan(context), 100, {
        leading: true,
        trailing: false,
        maxWait: 1000
      })
    );

    mutationObserver.observe(document.documentElement, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
      attributeOldValue: true,
      characterDataOldValue: true
    });
  }

  async get(emoji) {
    return this.library[emoji] ? this.library[emoji] : null;
  }

  async scan(context) {
    if (!isClient()) {
      return;
    }

    const icons = document.querySelectorAll('[data-ue-icon]');

    for (const icon of icons) {
      const ueIcon = icon.dataset.ueIcon;

      if (!ueIcon) return;

      const emoji = await context.get(ueIcon);

      if (!emoji || typeof emoji !== 'object') {
        return;
      }

      const { filename, base64 } = emoji;
      const split = filename.split('.');

      const ext = split[split.length - 1] || 'gif';

      icon.classList.add(...['ue', `ue-${ueIcon}`]);

      const accessibility = document.createElement('span');
      const textNode = document.createTextNode(`Image emoji for: ${ueIcon}`);

      accessibility.appendChild(textNode);
      accessibility.classList.add('ue-sr');

      const image = document.createElement('span');
      image.classList.add('ue-emoji');
      image.style.backgroundImage = `url(data:image/${ext};base64,${base64})`;

      const placeholderNode = document.createTextNode('\u25A1');

      image.appendChild(placeholderNode);

      icon.innerHTML = '';
      icon.appendChild(image);
      icon.appendChild(accessibility);
      icon.removeAttribute('data-ue-icon');
    }
  }
}
