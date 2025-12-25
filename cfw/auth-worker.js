export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/verify-google") {
      return new Response("Not Found", {status:404});
  }
};
