# NATS connector. Class wrapper for https://github.com/nats-io/nats.js

#### Install
`yarn add yarn add https://github.com/intellectual-urban-systems/node-nats-connector`

#### Usage
```js
const nats = require('nats-connector')({
  address: 'nats://localhost:4222',
  logger: console,
  group: 'current_service_name'
})

nats.subscribe('foo', msg => {
      console.log('Received a message: ' + msg)
    })

nats.publish('foo', 'Hello World!')
```

#### API
- `subscribe(name<string>, callback<func>}, group<string>)` - Subscribe on nats event
- `publish(name<string>, payload<string>})` - Publish nats event
