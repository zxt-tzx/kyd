// Mock implementation of node-html-parser
export const HTMLElement = class HTMLElement {
  constructor() {
    this.childNodes = [];
  }
  querySelector() {
    return null;
  }
  querySelectorAll() {
    return [];
  }
};

export const parse = () => {
  return new HTMLElement();
};

export default { parse, HTMLElement };
