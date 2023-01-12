import { readFileSync } from 'fs';
import { join } from 'path';

import { ScheduledEvent } from 'aws-lambda';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { handler } from './importer';
import { downloadHTML } from './util/download';
import { findMatches } from './util/find-matches';
import { FMPData, processHTML } from './util/process';

describe('importer', () => {
  let axiosMock: MockAdapter;
  let html = '';

  beforeAll(() => {
    html = readFileSync(
      join(__dirname, '../test/fakes/sample.html'),
    ).toString();

    axiosMock = new MockAdapter(axios);
  });

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    axiosMock.reset();
  });

  describe('download', () => {
    it('should download the html from the server', async () => {
      axiosMock.onPost(/.*agenda_portales.php$/).reply(200, html);
      const downloadedHTML = await downloadHTML(
        process.env.URL || '',
        process.env.CLIENT || '',
        Number(process.env.IDM || '1'),
        Number(process.env.TEMP_ID || '21'),
      );
      expect(downloadedHTML).toBeDefined();
      expect(downloadedHTML?.length).toBeGreaterThan(100);
    });
  });

  describe('process downloaded html', () => {
    it('should obtain all the clubs', () => {
      const { teams } = processHTML(html);

      expect(teams).toBeDefined();
      expect(teams.length).toBeGreaterThan(0);
      expect(teams.find((t) => t.id === '0')).toBeUndefined();
      expect(teams.find((t) => t.name.indexOf('ALUCHE HP'))).not.toBe(-1);
      expect(teams.find((t) => t.name.indexOf('FMP'))).not.toBe(-1);
      expect(teams.find((t) => t.name.indexOf('VIRGEN DE EUROPA'))).not.toBe(
        -1,
      );
    });

    it('should obtain all the competitions', () => {
      const { competitions } = processHTML(html);
      expect(competitions).toBeDefined();
      expect(competitions.length).toBeGreaterThan(0);
      expect(competitions.find((t) => t.id === '0')).toBeUndefined();
      expect(
        competitions.find((t) => t.name.indexOf('CTO AUT JUVENIL')),
      ).not.toBe(-1);
      expect(
        competitions.find((t) => t.name.indexOf('CTO AUT JUNIOR')),
      ).not.toBe(-1);
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
      expect(venues.find((t) => t.name.indexOf('VIRGEN DE EUROPA'))).not.toBe(
        -1,
      );
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
    let htmlOutput: FMPData;

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

  describe('handler', () => {
    const cronEvent: ScheduledEvent = {
      account: '123456789012',
      detail: {},
      'detail-type': 'Scheduled Event',
      id: 'xxxxxxxx-aea9-11e3-9d5a-835b769c0d9c',
      region: 'us-east-1',
      resources: ['arn:aws:events:us-east-1:123456789012:rule/ExampleRule'],
      source: 'aws.events',
      time: '1970-01-01T00:00:00Z',
      version: '',
    };

    const OLD_ENV = process.env;

    beforeEach(() => {
      jest.resetModules();

      process.env = {
        ...OLD_ENV,
      };
    });

    afterEach(() => {
      process.env = OLD_ENV;
    });

    afterAll(() => {
      process.env = OLD_ENV;
    });

    it('should obtain 200', async () => {
      axiosMock.onPost(/.*agenda_portales.php$/).reply(200, html);
      const response = await handler(cronEvent);
      expect(response.statusCode).toEqual(200);
    });

    it('should obtain 500', async () => {
      axiosMock.onPost(/.*agenda_portales.php$/).reply(500);
      const response = await handler(cronEvent);
      expect(response.statusCode).toEqual(500);
    });

    describe('invalid configuration', () => {
      it('should fail on missing URL', async () => {
        delete process.env.URL;
        const response = await handler(cronEvent);
        expect(response.statusCode).toEqual(500);
        expect(response.body).toEqual('Invalid configuration. No URL defined');
      });

      it('should fail on missing CLIENT', async () => {
        delete process.env.CLIENT;
        const response = await handler(cronEvent);
        expect(response.statusCode).toEqual(500);
        expect(response.body).toEqual(
          'Invalid configuration. No CLIENT defined',
        );
      });

      it('should fail on missing IDM', async () => {
        delete process.env.IDM;
        const response = await handler(cronEvent);
        expect(response.statusCode).toEqual(500);
        expect(response.body).toEqual('Invalid configuration. No IDM defined');
      });

      it('should fail on bad IDM', async () => {
        process.env.IDM = 'a';
        const response = await handler(cronEvent);
        expect(response.statusCode).toEqual(500);
        expect(response.body).toEqual(
          'Invalid configuration. IDM is not a number',
        );
      });

      it('should fail on missing TEMP_ID', async () => {
        delete process.env.TEMP_ID;
        const response = await handler(cronEvent);
        expect(response.statusCode).toEqual(500);
        expect(response.body).toEqual(
          'Invalid configuration. No TEMP_ID defined',
        );
      });

      it('should fail on bad TEMP_ID', async () => {
        process.env.TEMP_ID = 'a';
        const response = await handler(cronEvent);
        expect(response.statusCode).toEqual(500);
        expect(response.body).toEqual(
          'Invalid configuration. TEMP_ID is not a number',
        );
      });
    });
  });
});
