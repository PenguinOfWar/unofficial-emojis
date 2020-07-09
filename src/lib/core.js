import isClient from '@bagofholding/is-client';

import emojis, { ueSymLinks } from '../emojis/slackmojis';

export default class Core {
  constructor() {
    this.links = ueSymLinks || {};
    this.cache = {};

    if (isClient()) window.__UNOFFICIAL_EMOJIS_DEBUG = this;
  }

  get all() {
    return this.links;
  }

  get cached() {
    return this.cache;
  }

  async get(emoji) {
    const symLink = this.links[emoji];

    if (!symLink) {
      return;
    }

    return this.cache[symLink]
      ? this.cache[symLink]
      : await this.import(symLink);
  }

  async import(emoji) {
    const loader =
      emojis[emoji] && typeof emojis[emoji] === 'function'
        ? emojis[emoji]
        : null;

    if (!loader) {
      console.warn(
        `unofficial-emojis says: ${emoji} does not exist or is not a function. This usually indicates you've specified an emoji that does not exist.`
      );
      return {};
    }

    this.cache[emoji] = await loader();

    return this.cache[emoji];
  }

  async scan() {
    if (!isClient()) {
      return;
    }

    const icons = document.querySelectorAll('[data-ue-icon]');

    for (const icon of icons) {
      const ueIcon = icon.dataset.ueIcon;

      if (!ueIcon) return;

      const emoji = await this.get(ueIcon);

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
