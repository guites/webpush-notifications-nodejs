# webpush-basics-nodejs

Interact with a nodejs backend via web push protocol.

## Features

- [x] allow user subscription and unsubscription from push messaging
- [x] persistently identify different devices and their state
- [x] send message to specific devices based on their identification
- [ ] allow users to program notifications to different devices with content and expected notification time
- [x] install https on express server to enable devices connecting from local network to receive push

### sources

- [Traversy media video on web-push](https://www.youtube.com/watch?v=HlYFW2zaYQM)
- [Mozilla PushManager API docs](https://developer.mozilla.org/en-US/docs/Web/API/PushManager/getSubscription)
- [Google chrome samples on push messaging](https://github.com/GoogleChrome/samples/blob/gh-pages/push-messaging-and-notifications/main.js)
- Express webserver https: [1](https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/) [2](https://medium.com/@nitinpatel_20236/how-to-create-an-https-server-on-localhost-using-express-366435d61f28)
