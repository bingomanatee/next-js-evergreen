
export type Ordered = {order: number};

export default function sortByOrder (a: Ordered, b: Ordered) {
  return a.order - b.order;
}

