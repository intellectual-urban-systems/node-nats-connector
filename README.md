# NATS connector. Class wrapper for https://github.com/nats-io/nats.js

#### Install
`yarn add yarn add https://github.com/intellectual-urban-systems/node-nats-connector`

#### Usage
```js
const handlers = {
   'current_service_name.some_event': msg => {
     console.log(`Received event: ${msg}`)
   }
 }
const nats = require('nats-connector')({
  address: 'nats://localhost:4222',
  logger: console,
  group: 'current_service_name',
  handlers
})

nats.subscribe('some_event', msg => {
      console.log('Received a message: ' + msg)
    })

nats.publish('some_event', 'Hello World!')
```

#### API
- `subscribe(name<string>, callback<func>}, group<string>)` - Subscribe on nats event
- `publish(name<string>, payload<string>})` - Publish nats event
