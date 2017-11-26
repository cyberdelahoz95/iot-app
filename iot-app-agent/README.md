# iot-app-agent

## Usage

```js
const IotAppAgent = require('iot-app-agent')

const agent = new IotAppAgent ({
    name: 'myapp',
    username: 'admin',    
    interval: 2000
})

agent.addMetric('rss', function getRss() {
    return process.memoryUsage().rss
})

agent.addMetric('promiseMetric', function getRandomPromis() {
    return Promise.resolve(Math.random())
})

agent.addMetric('callbackMetric', function getRandomCallback(callback){
    setTimeout(()  =>  {
        callback(null, Math.random())
    }, 1000)
})

agent.connect()

//THIS AGENT EVENTS
agent.on('connected', handler)
agent.on('disconnected', handler)
agent.on('message', handler)

//OTHER AGENTS EVENTS
agent.on('agent/connected', handler)
agent.on('agent/disconnected', handler)
agent.on('agent/message', payload => {
    console.log(payload)
})

setTimeout(() => agent.disconnect(), 20000)
```