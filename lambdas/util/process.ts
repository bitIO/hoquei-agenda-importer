import * as cheerio from 'cheerio';

type Record = {
  id: string;
  name: string;
};
type Competition = Record;
type Team = Record;
type Venue = Record;
type Match = {
  awayTeam: string;
  category: string;
  date: string;
  homeTeam: string;
  hour: string;
  venue: string;
};

function getNodeText($: cheerio.CheerioAPI, element: cheerio.Element) {
  if (element.firstChild) {
    const textNode = element.children.find((child) => child.type === 'text');
    const textValue = $(textNode).text();

    return textValue;
  }

  return '';
}

function processSelectOptions<T>($: cheerio.CheerioAPI, selector: string): T[] {
  const data: Record[] = [];

  $(`${selector} option`).each((index, element) => {
    const record = {
      id: (element as cheerio.Element).attributes[0].value,
      name: (
        ((element as cheerio.Element).firstChild as any).data as string
      ).trim(),
    };
    if (Number(record.id) !== 0) {
      data.push(record);
    }
  });

  return data as T[];
}

function processMatchesTable($: cheerio.CheerioAPI, selector: string): Match[] {
  const rows = $(`${selector} tr`);
  const matches: Match[] = [];

  rows.each((index, element) => {
    if (index > 0) {
      const tds = $(element).find('td').toArray();
      const [, category, date, hour, , homeTeam, , awayTeam, , venue] = tds;
      const matchData: Match = {
        awayTeam: getNodeText($, awayTeam),
        category: getNodeText($, category.children[0] as cheerio.Element),
        date: getNodeText($, date),
        homeTeam: getNodeText($, homeTeam),
        hour: getNodeText($, hour),
        venue: getNodeText($, venue),
      };
      matches.push(matchData);
    }
  });

  return matches;
}

function processHTML(html: string) {
  const $ = cheerio.load(html);

  const competitions: Competition[] = processSelectOptions<Competition>(
    $,
    '#filtrocompeticion1',
  ).concat(processSelectOptions<Competition>($, '#filtrocompeticion2'));

  const teams: Team[] = processSelectOptions<Team>($, '#agenda_club_select');

  const venues: Venue[] = processSelectOptions<Venue>(
    $,
    '#agenda_pista_select',
  );

  const matches = processMatchesTable($, '#agenda_tabla');

  return { competitions, matches, teams, venues };
}

export { Competition, Team, Venue, Match, processHTML };
