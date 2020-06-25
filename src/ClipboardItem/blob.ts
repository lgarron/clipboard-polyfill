
export function stringToBlob(type: string, str: string): Blob {
  return new Blob([str], {
    type,
  });
}

export async function blobToString(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.addEventListener("load", () => {
      const result = fileReader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject("could not convert blob to string");
      }
    });
    fileReader.readAsText(blob);
  });
}
