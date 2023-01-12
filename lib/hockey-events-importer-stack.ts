import { join } from 'path';

import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class HockeyEventsImporterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaImporter = new NodejsFunction(
      this,
      'HoqueiLambdaEventsImporter',
      {
        bundling: {
          externalModules: ['aws-sdk'],
          minify: true,
        },
        entry: join(__dirname, '../lambdas/importer.ts'),
        environment: {
          BUCKET_NAME: 'hoquei-importer-data',
          CLIENT: 'fmp',
          IDM: '1',
          TEMP_ID: '21',
          URL: 'https://ns3104249.ip-54-37-85.eu/shared/portales_files/agenda_portales.php',
        },
        functionName: 'hoquei-events-importer',
        logRetention: RetentionDays.THREE_DAYS,
        runtime: Runtime.NODEJS_16_X,
        timeout: Duration.seconds(60),
      },
    );

    const rule = new Rule(this, 'HoqueiImporterCronRule', {
      description: 'Launches a lambda to import hockey matches',
      ruleName: 'hoqueiImporterCron',
      schedule: Schedule.expression('cron(0 18 ? * 3 *)'),
    });
    rule.addTarget(new LambdaFunction(lambdaImporter));

    const bucket = new Bucket(this, 'HoqueiPersistenceS3', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      bucketName: 'hoquei-importer-data',
      lifecycleRules: [
        {
          // abortIncompleteMultipartUploadAfter: Duration.minutes(30),
          expiration: Duration.days(30),
          expiredObjectDeleteMarker: false,
          // transitions: [
          //   {
          //     storageClass: StorageClass.INFREQUENT_ACCESS,
          //   },
          // ],
        },
      ],
      removalPolicy: RemovalPolicy.DESTROY,
      versioned: false,
    });
    bucket.grantReadWrite(lambdaImporter);
  }
}
