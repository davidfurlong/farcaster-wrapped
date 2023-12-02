import { MerkleApiCast } from "../shared/types.js";

export function timer(name: string) {
  console.log("starting timer ", name);
  const start = new Date();

  return {
    end: () => {
      const end = new Date();
      const diffMinutes = ((end as any) - (start as any)) / 60000;
      console.log(`${name} took ${diffMinutes} minutes`);
    },
    interval: () => {
      const end = new Date();
      const diffMinutes = ((end as any) - (start as any)) / 60000;
      return diffMinutes;
    },
  };
}

/**
 * Break a large array into smaller chunks.
 * @param {array} array Array to break into smaller chunks
 * @param {number} chunkSize Size of each chunk
 * @returns {array} Array of smaller chunks
 */
export function breakIntoChunks(array: any[], chunkSize: number) {
  const chunks = Array();

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}
