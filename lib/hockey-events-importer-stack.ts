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
          CLIENT: 'fmp',
          IDM: '1',
          TEMP_ID: '21',
          URL: 'https://ns3104249.ip-54-37-85.eu/shared/portales_files/agenda_portales.php',
        },
        functionName: 'hoquei-events-importer',
        logRetention: RetentionDays.THREE_DAYS,
        runtime: Runtime.NODEJS_18_X,
        timeout: Duration.seconds(60),
      },
    );

    const rule = new Rule(this, 'HoqueiImporterCronRule', {
      description: 'Launches a lambda to import hockey matches',
      ruleName: 'hoqueiImporterCron',
      schedule: Schedule.expression('cron(0 18 ? * 3 *)'),
    });
    rule.addTarget(new LambdaFunction(lambdaImporter));
  }
}
