/* eslint-disable no-param-reassign */
/* eslint no-useless-escape: "off" */

const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;

export const create = function (tagName: string, className?: string, container?: HTMLElement, id?: string) {
  const el = document.createElement(tagName);
  el.className = className || '';
  if (id) {
    el.id = id;
  }
  if (container) {
    container.appendChild(el);
  }
  return el;
};

export const getElement = function (id: string) {
  return typeof id === 'string' ? document.getElementById(id) : id;
};

export const remove = function (el: HTMLElement, p?: HTMLElement) {
  const parent = el.parentNode;
  if (parent) {
    parent.removeChild(el);
  }
};

export const empty = function (el: HTMLElement) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
};

export const createHidden = function (tagName: string, parent: HTMLElement, id: string) {
  const element = document.createElement(tagName);
  element.style.display = 'none';
  if (id) {
    element.id = id;
  }
  if (parent) {
    parent.appendChild(element);
  }
  return element;
};

const trim = function (string: string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
};

const camelCase = function (name: string) {
  return name
    .replace(SPECIAL_CHARS_REGEXP, (_, separator, letter, offset) => (offset ? letter.toUpperCase() : letter))
    .replace(MOZ_HACK_REGEXP, 'Moz$1');
};

type eventFn = (element: HTMLElement, event: string, handler: any) => void;

export const on = (function () {
  if (document) {
    return function (element: HTMLElement, event: string, handler: any) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    };
  }
})() as eventFn;

export const off = (function () {
  if (document) {
    return function (element: HTMLElement, event: string, handler: any) {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    };
  }
})() as eventFn;

export const once = function (el: HTMLElement, event: string, fn: any) {
  const listener = function (...args) {
    if (fn) {
      fn.apply(this, args);
    }
    off(el, event, listener);
  };
  on(el, event, listener);
};

export function hasClass(el: HTMLElement, cls: string) {
  if (!el || !cls) return false;
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
  if (el.classList) {
    return el.classList.contains(cls);
  }
  return ` ${el.className} `.indexOf(` ${cls} `) > -1;
}

export function addClass(el: HTMLElement, cls: string) {
  if (!el) return;
  let curClass = el.className;
  const classes = (cls || '').split(' ');
  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i];
    if (!clsName) continue;
    if (el.classList) {
      el.classList.add(clsName);
    } else if (!hasClass(el, clsName)) {
      curClass += ` ${clsName}`;
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
}

export function removeClass(el: HTMLElement, cls: string) {
  if (!el || !cls) return;
  const classes = cls.split(' ');
  let curClass = ` ${el.className} `;
  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i];
    if (!clsName) continue;
    if (el.classList) {
      el.classList.remove(clsName);
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(` ${clsName} `, ' ');
    }
  }
  if (!el.classList) {
    el.className = trim(curClass);
  }
}

export function getStyle(element: HTMLElement, styleName: string) {
  if (!element || !styleName) return null;
  styleName = camelCase(styleName);
  if (styleName === 'float') {
    styleName = 'cssFloat';
  }
  try {
    const computed = document.defaultView?.getComputedStyle(element, '');
    return element.style[styleName] || computed ? computed?.[styleName] : null;
  } catch (e) {
    return element.style[styleName];
  }
}

export function setStyle(element: HTMLElement, styleName: string | Object, value: any) {
  if (!element || !styleName) return;
  if (typeof styleName === 'object') {
    // eslint-disable-next-line no-restricted-syntax
    for (const prop in styleName) {
      if (styleName.hasOwnProperty(prop)) {
        setStyle(element, prop, styleName[prop]);
      }
    }
  } else {
    styleName = camelCase(styleName) as string;
    if (styleName === 'opacity') {
      // eslint-disable-next-line no-restricted-globals
      element.style.filter = isNaN(value) ? '' : `alpha(opacity=${value * 100})`;
    } else {
      element.style[styleName as string] = value;
    }
  }
}
