import { readFileSync } from 'fs';
import { join } from 'path';

import { downloadHTML } from './util/download';
import { findMatches } from './util/find-matches';
import { FMPData, processHTML } from './util/process';

describe('download', () => {
  it('should download the html from the server', async () => {
    const html = await downloadHTML(
      'https://ns3104249.ip-54-37-85.eu/shared/portales_files/agenda_portales.php',
      'fmp',
      1,
      21,
    );
    expect(html).toBeDefined();
    expect(html?.length).toBeGreaterThan(100);
  });
});

describe('process downloaded html', () => {
  let html = '';

  beforeEach(() => {
    html = readFileSync(
      join(__dirname, '../test/fakes/sample.html'),
    ).toString();
  });

  it('should obtain all the clubs', () => {
    const { teams } = processHTML(html);

    expect(teams).toBeDefined();
    expect(teams.length).toBeGreaterThan(0);
    expect(teams.find((t) => t.id === '0')).toBeUndefined();
    expect(teams.find((t) => t.name.indexOf('ALUCHE HP'))).not.toBe(-1);
    expect(teams.find((t) => t.name.indexOf('FMP'))).not.toBe(-1);
    expect(teams.find((t) => t.name.indexOf('VIRGEN DE EUROPA'))).not.toBe(-1);
  });

  it('should obtain all the competitions', () => {
    const { competitions } = processHTML(html);
    expect(competitions).toBeDefined();
    expect(competitions.length).toBeGreaterThan(0);
    expect(competitions.find((t) => t.id === '0')).toBeUndefined();
    expect(
      competitions.find((t) => t.name.indexOf('CTO AUT JUVENIL')),
    ).not.toBe(-1);
    expect(competitions.find((t) => t.name.indexOf('CTO AUT JUNIOR'))).not.toBe(
      -1,
    );
    expect(competitions.find((t) => t.name.indexOf('LIGA JUVENIL'))).not.toBe(
      -1,
    );
    expect(competitions.find((t) => t.name.indexOf('LIGA JUNIOR'))).not.toBe(
      -1,
    );
  });

  it('should obtain all the venues', () => {
    const { venues } = processHTML(html);
    expect(venues).toBeDefined();
    expect(venues.length).toBeGreaterThan(0);
    expect(venues.find((t) => t.id === '0')).toBeUndefined();
    expect(venues.find((t) => t.name.indexOf('VIRGEN DE EUROPA'))).not.toBe(-1);
    expect(
      venues.find((t) => t.name.indexOf('PRADO DE SANTO DOMINGO')),
    ).not.toBe(-1);
  });

  it('should obtain all the matches', () => {
    const { matches } = processHTML(html);
    expect(matches).toBeDefined();
    expect(matches.length).toBeGreaterThan(0);
  });
});

describe('find matching entries', () => {
  let html = '';
  let htmlOutput: FMPData;

  beforeEach(() => {
    html = readFileSync(
      join(__dirname, '../test/fakes/sample.html'),
    ).toString();
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
