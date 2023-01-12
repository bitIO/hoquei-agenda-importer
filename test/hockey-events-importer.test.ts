import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import * as HockeyEventsImporter from '../lib/hockey-events-importer-stack';

/* eslint-disable jest/expect-expect */
test('Lambda and scheduled event are created', () => {
  const app = new cdk.App();

  const stack = new HockeyEventsImporter.HockeyEventsImporterStack(
    app,
    'MyTestStack',
  );

  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::Lambda::Function', {
    FunctionName: 'hoquei-events-importer',
    Runtime: 'nodejs18.x',
  });
  template.hasResourceProperties('AWS::Events::Rule', {
    Name: 'hoqueiImporterCron',
    ScheduleExpression: 'cron(0 18 ? * 3 *)',
  });
  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketName: 'hoquei-importer-data',
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    },
  });
});
/* eslint-enable jest/expect-expect */
