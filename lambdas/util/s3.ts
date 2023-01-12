import { S3 } from 'aws-sdk';
import format from 'date-fns/format';

import { FMPData } from './process';
function generateKey() {
  return `${format(new Date(), 'yyyy-MM-dd')}.json`;
}

async function fileExists(bucketName: string, key: string) {
  try {
    const s3Client = new S3();

    await s3Client
      .headObject({
        Bucket: bucketName,
        Key: key,
      })
      .promise();
    console.log(`Object ${key} exists in bucket ${bucketName}`);

    return true;
  } catch (error) {
    console.log(`Object ${key} does exists in bucket ${bucketName}`);

    return false;
  }
}

async function fileRead(bucketName: string, key: string) {
  const s3Client = new S3();
  const object = await s3Client
    .getObject({
      Bucket: bucketName,
      Key: key,
    })
    .promise();

  if (!object.Body) {
    throw new Error(`Object ${key} as no Body`);
  }

  return JSON.parse(object.Body.toString()) as FMPData;
}

async function fileSave(bucketName: string, key: string, data: FMPData) {
  console.log('Saving file as', key);

  const s3Client = new S3();
  await s3Client
    .putObject({
      Body: JSON.stringify(data),
      Bucket: bucketName,
      Key: key,
    })
    .promise();

  return true;
}

export { generateKey, fileExists, fileRead, fileSave };
