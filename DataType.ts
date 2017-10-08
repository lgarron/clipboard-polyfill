export const DataType: {[key:string]:string} = {
  TEXT_PLAIN: "text/plain",
  TEXT_HTML: "text/html"
};

export const DataTypeLookup: Set<string> = new Set<string>();
for (var key in DataType) {
  DataTypeLookup.add(DataType[key]);
}
