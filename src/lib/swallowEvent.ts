export default function swallowEvent(e: MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
}
