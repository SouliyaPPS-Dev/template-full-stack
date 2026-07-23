if (typeof global.FormData === "undefined") {
  class FormDataPolyfill {
    _parts = [];

    append(name, value, filename) {
      this._parts.push([String(name), value]);
    }

    set(name, value, filename) {
      const idx = this._parts.findIndex((p) => p[0] === name);
      if (idx !== -1) this._parts.splice(idx, 1);
      this._parts.push([String(name), value]);
    }

    delete(name) {
      this._parts = this._parts.filter((p) => p[0] !== name);
    }

    get(name) {
      const found = this._parts.find((p) => p[0] === name);
      return found ? found[1] : null;
    }

    getAll(name) {
      return this._parts.filter((p) => p[0] === name).map((p) => p[1]);
    }

    has(name) {
      return this._parts.some((p) => p[0] === name);
    }

    entries() {
      return this._parts[Symbol.iterator]();
    }

    keys() {
      return this._parts.map((p) => p[0])[Symbol.iterator]();
    }

    values() {
      return this._parts.map((p) => p[1])[Symbol.iterator]();
    }

    forEach(callback, thisArg) {
      this._parts.forEach((p) => callback.call(thisArg, p[1], p[0], this));
    }

    [Symbol.iterator]() {
      return this._parts[Symbol.iterator]();
    }
  }

  global.FormData = FormDataPolyfill;
}
