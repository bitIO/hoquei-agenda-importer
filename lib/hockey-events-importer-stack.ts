import { join } from 'path';

import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class HockeyEventsImporterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaImporter = new NodejsFunction(this, 'EventsImporter', {
      bundling: {
        externalModules: ['aws-sdk'],
        minify: true,
      },
      entry: join(__dirname, '../lambdas/importer.ts'),
      environment: {},
      functionName: 'events-importer',
      logRetention: RetentionDays.THREE_DAYS,
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(60),
    });

    const rule = new Rule(this, 'Rule', {
      description: 'Launches a lambda to import hockey matches',
      ruleName: 'hockeyMatchesImportCron',
      schedule: Schedule.expression('cron(0 18 ? * 3 *)'),
    });
    rule.addTarget(new LambdaFunction(lambdaImporter));
  }
}
