import { Match } from './process';

type Criteria = {
  category: string;
  team: string;
};

export function findMatches(matches: Match[], criteria: Criteria[]) {
  const foundMatches = criteria.map((criteriaItem) => {
    const match = matches.find(
      (match) =>
        (match.category === criteriaItem.category &&
          match.awayTeam === criteriaItem.team) ||
        match.homeTeam === criteriaItem.team,
    );

    return {
      criteria: criteriaItem,
      match,
    };
  });

  return foundMatches;
}
