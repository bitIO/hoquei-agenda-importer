import { ScheduledEvent } from 'aws-lambda';

import { downloadHTML } from './util/download';
import { processHTML } from './util/process';
import { fileExists, fileRead, fileSave, generateKey } from './util/s3';

async function handler(event: ScheduledEvent) {
  console.log('request:', JSON.stringify(event, undefined, 2));

  try {
    if (!process.env.URL) {
      throw new Error('Invalid configuration. No URL defined');
    }
    if (!process.env.CLIENT) {
      throw new Error('Invalid configuration. No CLIENT defined');
    }
    if (!process.env.IDM) {
      throw new Error('Invalid configuration. No IDM defined');
    }
    if (isNaN(Number(process.env.IDM))) {
      throw new Error('Invalid configuration. IDM is not a number');
    }
    if (!process.env.TEMP_ID) {
      throw new Error('Invalid configuration. No TEMP_ID defined');
    }
    if (isNaN(Number(process.env.TEMP_ID))) {
      throw new Error('Invalid configuration. TEMP_ID is not a number');
    }
    if (!process.env.BUCKET_NAME) {
      throw new Error('Invalid configuration. No BUCKET_NAME defined');
    }

    let data: FMPData;

    const key = generateKey();
    const fileAlreadyCreated = await fileExists(process.env.BUCKET_NAME, key);
    if (!fileAlreadyCreated) {
      console.log('Downloading html from', process.env.URL);
      const html = await downloadHTML(
        process.env.URL,
        process.env.CLIENT,
        Number(process.env.IDM),
        Number(process.env.TEMP_ID),
      );
      if (!html) {
        throw new Error('Cannot obtain data from url');
      }

      console.log('Processing HTML', html.length);
      data = processHTML(html);
      console.log('Saving to S3', process.env.BUCKET_NAME);
      await fileSave(process.env.BUCKET_NAME, key, data);
    } else {
      data = await fileRead(process.env.BUCKET_NAME, key);
    }

    console.log('All done!');

    return {
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'text/json' },
      statusCode: 200,
    };
  } catch (error) {
    return {
      body: (error as Error).message,
      headers: { 'Content-Type': 'text/plain' },
      statusCode: 500,
    };
  }
}

export { handler };
