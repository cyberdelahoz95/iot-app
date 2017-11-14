# iot-app-db

## Modo de Uso

```js
 const setupData = require('iot-app-db')

 setupData(config)
   .then(db => {
     const {Agent, Metric} = db
   })
   .catch(err => console.error(err) )

```