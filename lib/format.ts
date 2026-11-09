const oneDecimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

/** Format a number with at most one decimal place. */
export function formatNumber(value: number): string {
  return oneDecimal.format(value);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}
