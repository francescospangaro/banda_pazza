export function getCurrentSemesters() {
  return getSemestersFor(new Date());
}

export function getSemestersFor(now: Date): { start: Date; end: Date }[] {
  let january: Date;
  let may: Date;
  let september: Date;
  let nextSeptember: Date;

  if (now.getMonth() <= 8) {
    january = new Date(now.getFullYear(), 0, 1);
    may = new Date(now.getFullYear(), 4, 1);
    september = new Date(now.getFullYear() - 1, 8, 1);
    nextSeptember = new Date(now.getFullYear(), 8, 1);
  } else {
    january = new Date(now.getFullYear() + 1, 0, 1);
    may = new Date(now.getFullYear() + 1, 4, 1);
    september = new Date(now.getFullYear(), 8, 1);
    nextSeptember = new Date(now.getFullYear() + 1, 8, 1);
  }

  return [
    { start: september, end: january },
    { start: january, end: may },
    { start: may, end: nextSeptember },
  ];
}

export function getCurrentScholasticYear() {
  return getScholasticYear(new Date());
}

export function getScholasticYear(now: Date): [Date, Date] {
  const semester = getSemestersFor(now);
  return [semester[0].start, semester[semester.length - 1].end];
}
