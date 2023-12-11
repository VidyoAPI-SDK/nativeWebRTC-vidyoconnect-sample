const STORE = "VIDYO_CONNECT";

const storage = {
  getItem(key) {
    const data = localStorage.getItem(STORE);
    return data && JSON.parse(data) ? JSON.parse(data)[key] : undefined;
  },
  getStore() {
    const data = localStorage.getItem(STORE);
    return data && JSON.parse(data) ? JSON.parse(data) : undefined;
  },
  addItem(key, value) {
    let data = localStorage.getItem(STORE) || "{}";
    data = JSON.parse(data);
    Object.assign(data, { [key]: value });
    localStorage.setItem(STORE, JSON.stringify(data));
  },
  removeItem(key) {
    let data = localStorage.getItem(STORE) || "{}";
    data = JSON.parse(data);
    delete data[key];
    localStorage.setItem(STORE, JSON.stringify(data));
  },
  addObject(object) {
    Object.keys(object).forEach((key) => this.addItem(key, object[key]));
  },
};

export default storage;
