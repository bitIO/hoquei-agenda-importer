#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { HockeyEventsImporterStack } from '../lib/hockey-events-importer-stack';

const app = new cdk.App();
new HockeyEventsImporterStack(app, 'HockeyEventsImporterStack');
