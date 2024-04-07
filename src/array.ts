export function removeOne<T>(items: T[], callback: (it: any) => boolean): T | undefined {
  const index = items.findIndex(it => callback(it))
  if (index > -1) {
    const removed = items.splice(index, 1)
    return removed[0]
  } else {
    return undefined
  }
}
