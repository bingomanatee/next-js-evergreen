export default function shortId(st: string) {
  if (typeof st !== 'string') return '';
  if (st.length  < 10) return st;
  return `${st.substring(0, 5 )}...${st.substring(st.length - 2)}`;
}
