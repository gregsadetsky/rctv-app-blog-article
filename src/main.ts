import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <h1>FETCHING A RECENT BLOG ARTICLE</h1>

  <h2>REDIRECTING YOU.... PLEASE STANDBY ...........</h2>
`;

document.addEventListener("DOMContentLoaded", function () {
  window.RC.onLoad(() => {
    window.RC.getZulipStreamMessages({
      stream: "blogging",
      sender: "blaggregator-bot@students.hackerschool.com",
    }).then(({ messages: { messages } }) => {
      // all messages should be the "... has a new blog post..." but you never know.
      // filter messages for that format which we're expecting
      const blogMessages = messages.filter(
        (message) =>
          message.content.match(/has a new blog post/) &&
          // matches having a hyperlink (all posts are proxied via blaggregator.herokuapp.com right now)
          message.content.match(/<a href="https:\/\/[^"]+">/)
      );

      // did we find at least one message?
      if (blogMessages.length === 0) {
        document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
          <h1>NO BLOG POSTS FOUND (huh??)</h1>
        `;
        return;
      }

      // at this point, we have some blogMessages with some urls in them
      // some of them MIGHT lead to http urls. if we (as the iframed app) try
      // to set window.location.href but the URL is http, then the setting of the new url
      // will fail and we'll still be up and running...

      // filter out urls to get them in a list
      let allPotentialUrls = blogMessages.map(
        (message) => message.content.match(/<a href="([^"]+)">/)[1]
      );

      const tryingToSetUrlInterval = setInterval(() => {
        // if we're still here, we haven't redirected yet. let's try to redirect
        // to the first url in the list. if it's http, it'll fail and we'll keep trying
        // until we find a https url
        if (allPotentialUrls.length === 0) {
          clearInterval(tryingToSetUrlInterval);
          document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
            <h1>NO HTTPS URLS FOUND (huh??)</h1>
          `;
          return;
        }
        // get latest url from the list -- if we're not redirected to it,
        // this `window.location.href =` will not do anything
        window.location.href = allPotentialUrls.pop();
      }, 2000);
    });
  });
});
