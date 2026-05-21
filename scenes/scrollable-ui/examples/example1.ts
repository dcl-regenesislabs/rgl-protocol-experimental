type Item = { id: number; label: string }

const items: Item[] = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  label: `Item ${i + 1}`
}))

function format(item: Item): string {
  return `[#${item.id}] ${item.label}`
}

for (const item of items) {
  console.log(format(item))
}
