const UrlParser = {
  parseActiveUrlWithCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    const splittedUrl = this._urlSplitter(url);
    return this._urlCombiner(splittedUrl);
  },

  _urlSplitter(url) {
    const urlWithoutHash = url.replace('#', '');
    const urlParts = urlWithoutHash.split('/');
    // Filter out empty strings that result from multiple slashes or trailing slash
    return urlParts.filter(part => part.length > 0);
  },

  _urlCombiner(splittedUrl) {
    if (splittedUrl.length === 0) {
      return '/';
    }
    return `/${splittedUrl[0]}`; // Hanya mengambil bagian utama route (e.g., /add, /about)
  },
};

export default UrlParser;