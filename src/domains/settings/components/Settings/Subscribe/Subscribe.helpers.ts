export const formatDuration = (iso: string): string => {
  if (!iso) return '';
  const l = iso.length;
  const n = iso.slice(1, l - 1);
  if (n === '1') {
    return (
      ({ D: 'Day', W: 'Week', M: 'Month', Y: 'Year' } as any)[iso[l - 1]] ||
      iso[l - 1]
    );
  } else {
    const u =
      ({ D: 'Days', W: 'Weeks', M: 'Months', Y: 'Years' } as any)[iso[l - 1]] ||
      iso[l - 1];
    return `${n} ${u}`;
  }
};

export const formatTitle = (title: string): string => {
  if (!title) return '';
  return title.replace('(Komunicare AAC)', '').trim();
};
