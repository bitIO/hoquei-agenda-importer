# Hoquei Events Importer

This projects aims to help you importing hoquei matches for the given teams and
categories. It will do it automatically every week or on demand from the web app.

## Useful commands

* `npm run build`       compile typescript to js
* `npm run watch`       watch for changes and compile
* `npm run test`        perform the jest unit tests
* `npm run cdk:deploy`  deploy this stack to your default AWS account/region
* `npm run cdk:destroy` removes the stack from your default AWS account/region
* `cdk diff`            compare deployed stack with current state
* `cdk synth`           emits the synthesized CloudFormation template

## TODO
<!-- markdownlint-disable MD004 -->
- [ ] Store imported data for a week (S3, ElasticCache, Dynamo)
- [ ] Generate .ics file for calendar
- [ ] Store in Google directly - API key
- [ ] Solve environment variables (CDK Context?)
- [ ] Bundle without test files
- [ ] Deploy using github actions
- [ ] On demand actions
  - [ ] Load data
  - [ ] Filter / List
  - [ ] Create calendar files
  - [ ] Create calendar events
<!-- markdownlint-enable MD004 -->