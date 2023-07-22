export default function px(n: number) {
  if (!(n && (typeof n === 'number'))) {
    return 0;
  }
  return `${Math.round(n)}px`
}
