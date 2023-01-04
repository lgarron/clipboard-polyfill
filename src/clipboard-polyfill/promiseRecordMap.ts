export function promiseRecordMap<T>(
  keys: string[],
  f: (key: string) => Promise<T>,
): Promise<Record<string, T>> {
  var promiseList: Promise<T>[] = [];
  for (var key of keys) {
    promiseList.push(f(key));
  }
  return Promise.all(promiseList).then(function (
    vList: T[],
  ): Record<string, T> {
    var dataOut: Record<string, T> = {};
    for (var i = 0; i < keys.length; i++) {
      dataOut[keys[i]] = vList[i];
    }
    return dataOut;
  });
}
