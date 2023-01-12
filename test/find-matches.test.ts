import { readFileSync } from 'fs';
import { join } from 'path';

import { findMatches } from '../lambdas/util/find-matches';
import { FMPData, processHTML } from '../lambdas/util/process';

describe('find matching entries', () => {
  let html = '';
  let htmlOutput: FMPData;

  beforeEach(() => {
    html = readFileSync(join(__dirname, './fakes/sample.html')).toString();
  });

  beforeEach(() => {
    htmlOutput = processHTML(html);
  });

  it('should find one match', () => {
    const matches = findMatches(htmlOutput.matches, [
      {
        category: 'CTO AUT SUB - 15 FEMENINO',
        team: 'CP RIVAS LAS LAGUNAS',
      },
    ]);
    expect(matches).toBeDefined();
    expect(matches.length).toEqual(1);
    expect(matches[0].match).toBeDefined();
    expect(matches[0].match?.homeTeam).toEqual('CP RIVAS LAS LAGUNAS');
  });

  it('should find two match', () => {
    const matches = findMatches(htmlOutput.matches, [
      {
        category: 'CTO AUT SUB - 15 FEMENINO',
        team: 'CP RIVAS LAS LAGUNAS',
      },
      {
        category: 'CTO AUT JUNIOR',
        team: 'CP ALCORCON',
      },
    ]);
    expect(matches).toBeDefined();
    expect(matches.length).toEqual(2);
    expect(matches[0].match).toBeDefined();
    expect(matches[0].match?.homeTeam).toEqual('CP RIVAS LAS LAGUNAS');
    expect(matches[1].match).toBeDefined();
    expect(matches[1].match?.awayTeam).toEqual('CP ALCORCON');
  });
});
