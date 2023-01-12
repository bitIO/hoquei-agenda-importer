import { readFileSync } from 'fs';
import { join } from 'path';

import { processHTML } from '../lambdas/process';

describe('process downloaded html', () => {
  let html = '';

  beforeEach(() => {
    html = readFileSync(join(__dirname, './fakes/sample.html')).toString();
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
