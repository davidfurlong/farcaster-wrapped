import "dotenv/config";
import {
  generatePersonaNormalization,
  generateWrapped,
} from "./tasks/generate-wrapped";
import { getPostgresClient, postgresLimiter } from "./tasks/task";

export const castsTable = "casts";
export const profilesTable = "profiles";
export const followingTable = "following";
export const uniqueFollowersConstraint = "no_duplicate_followers";

process.on("unhandledRejection", (error) => {
  Sentry.captureException(error);

  console.error(error);
});

process.on("uncaughtException", (error) => {
  Sentry.captureException(error);

  console.error(error);

  process.exit(1);
});

async function getAllUsers() {
  const client = await getPostgresClient();
  const res = await client.query(`
      select fid from profiles
`);

  client.release();
  return res.rows.map((row) => row.fid);
}

async function generateAllFids(fids?: number[]) {
  const allFids = fids || (await getAllUsers());

  await Promise.all(
    allFids
      // .filter((fid) => fid > 1575)
      .map((fid) =>
        postgresLimiter.schedule(async () => {
          await generateWrapped(fid);
          console.log(fid);
          return;
        })
      )
  );

  return;
}

async function generateAllPersonas(fids?: number[]) {
  const allFids = fids || (await getAllUsers());

  await generatePersonaNormalization(allFids);

  return;
}

await generateAllFids();

await generateAllPersonas();
