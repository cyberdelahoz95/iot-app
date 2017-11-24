# iot-app-mqtt

## `agent/connected`
```JS
{
    agent: {
        uuid, // auto generate
        username, // define by config
        name,  // define by config
        hostname,  // get from OS
        pid  // get from process
    }
}
```
## `agent/disconnected`
```JS
{
    agent: {
        uuid, // auto generate
    }
}
```
## `agent/message`
```JS
{
    agent,
    metrics: [{
        type,
        value
    }],
    timestamp
}
```
```
for sending message to test the mqtt server you can use the command
npx mqtt pub -t ‘agent/message’ -h localhost -m ‘{“hello”;“platziverse”}’
```