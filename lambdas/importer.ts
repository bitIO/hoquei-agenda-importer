import { ScheduledEvent } from 'aws-lambda';

exports.handler = async function (event: ScheduledEvent) {
  console.log('request:', JSON.stringify(event, undefined, 2));

  return {
    body: `Hello, CDK! You've hit ${event.source} - ${event.time}\n`,
    headers: { 'Content-Type': 'text/plain' },
    statusCode: 200,
  };
};
