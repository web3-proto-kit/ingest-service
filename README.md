## ingest-service
This service is responsible for consuming messages from the mock-blockchain-swagger-ui and publishing each message returned to the NewMessageQueue.

```
MessageExchange outgoing message payload = {
  "sender-id": "uuid",
  "reciever-id": "uuid",
  "message-id": "uuid",
  "message-payload: "message as string here..."
}
```

The ingest-service communicates with other microservices on the network via rabbit-mq. The protocol used to consume messages is amqp.

# Usage
View the quickstart repo for a step by step guide.

 
