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

      // take the last message (which is the most recent one), extract the url, and redirect there!!!!
      const lastMessage = blogMessages[blogMessages.length - 1];
      const url = lastMessage.content.match(/<a href="([^"]+)">/)[1];
      setTimeout(() => {
        window.location.href = url;
      }, 2000);
    });
  });
});
