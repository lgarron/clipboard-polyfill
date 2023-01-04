export function promiseRecordMap<T>(
  keys: string[],
  f: (key: string) => Promise<T>,
): Promise<Record<string, T>> {
  const promiseList: Promise<T>[] = [];
  for (const key of keys) {
    promiseList.push(f(key));
  }
  return Promise.all(promiseList).then(function (
    vList: T[],
  ): Record<string, T> {
    const dataOut: Record<string, T> = {};
    for (let i = 0; i < keys.length; i++) {
      dataOut[keys[i]] = vList[i];
    }
    return dataOut;
  });
}
