import Bottleneck from "bottleneck";
import * as pg from "pg";
import { breakIntoChunks, timer } from "../lib/utils";
import { FCCast, FCProfile } from "../shared/types";
import * as Sentry from "@sentry/node";
import { QueryResult } from "../types/node-pg";
import { Pool, PoolClient } from "../types/pg";
import format from "pg-format";

const connectionStringAdmin = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

export const farcasterLimiter = new Bottleneck({
  minTime: 100,
});

export const awsLimiter = new Bottleneck({
  // https://docs.aws.amazon.com/comprehend/latest/dg/guidelines-and-limits.html#limits-all
  maxConcurrent: 2,
});

export const supabaseLimiter = new Bottleneck({
  // 2 req/s
  maxConcurrent: 4,
  // minTime: 620,
});

export const postgresLimiter = new Bottleneck({
  // 2 req/s
  maxConcurrent: 10,
  // minTime: 620,
});

export const vercelApiLimiter = new Bottleneck({
  maxConcurrent: 1,
});

// let globalClient = null;

export const pool: Pool = new pg.default.Pool({
  connectionString: connectionStringAdmin,
  max: 10,
});
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// must be pool.release()
export const getPostgresClient = async (): Promise<PoolClient> => {
  return pool.connect();
  // if (globalClient) return globalClient;
  // const client: Client = new pg.default.Client({
  //   connectionString: connectionStringAdmin,
  // });
  // await client.connect();

  // client.on("error", (err) => {
  //   // TODO: reconnect, perhaps on idle
  //   Sentry.captureException(err);
  // });
  // globalClient = client;
  // return client;
};
// Tasks
// id=1 cast entities processing
// id=2 cast entities sentiment processing
// id=3 cast inline images processing
// id=4 profiles avatar images processing -- is not permanent
// id=5 profiles index following -- is not permanent
// id=6
// id=7 casts new
// id=8 profile likes
// id=10 bot

export async function runCastTask(
  id: number,
  fn: (item: FCCast[]) => Promise<void>,
  name: string,
  batchCount: number
) {
  const uniqueId = `${id} ${name}`;
  const t2 = timer(uniqueId);

  let taskProgress = 0;
  let taskTotal = 0;
  function reportTaskProgress(newTp: number) {
    taskProgress = taskProgress + newTp;
    console.log(
      `${uniqueId}: ${taskProgress} out of ${taskTotal} completed, ${Math.round(
        (100 * taskProgress) / taskTotal
      )}% in ${Math.round(t2.interval())} minutes, completion in ${
        taskProgress !== 0
          ? Math.round((taskTotal / taskProgress) * t2.interval())
          : "?"
      } minutes`
    );
  }

  try {
    const totalCount: pg.QueryResult = await postgresLimiter.schedule(
      async () => {
        const client = await getPostgresClient();

        // this query is really slow.
        const totalCasts = await client.query(`
      select count(*) as count from casts;
    `);

        const taskComplete = await client.query(`
    select count(*) as count from task_completions t where t.task_id = ${id}
  `);

        client.release();
        return totalCasts.rows[0].count - taskComplete.rows[0].count;
      }
    );
    taskTotal = totalCount;
    reportTaskProgress(0);

    let pageNr = 0;
    const pageSize = 10000;
    while (true) {
      const page: QueryResult<FCCast> = await postgresLimiter.schedule(
        async () => {
          const client = await getPostgresClient();

          const t = timer("page");
          // order slows this down
          // this is kinda slow
          const r = await client.query(`
        select hash, text from casts c where not exists (select * from task_completions t where t.hash=c.hash and t.task_id = ${id}) limit ${pageSize} offset ${
            pageNr * pageSize
          }`);
          t.end();
          client.release();
          return r;
        }
      );

      if (!page.rows.length) {
        // done
        console.log("done");
        break;
      }

      const chunks = breakIntoChunks(page.rows, batchCount);
      await Promise.all(
        chunks.map(async (chunk) => {
          try {
            await fn(chunk);

            const client = await getPostgresClient();

            // set task as completed
            await client.query(
              format(
                `insert into task_completions (hash, task_id) values %L on conflict do nothing`,
                chunk.map((item) => [item.hash, id])
              ),
              []
            );

            client.release();
          } catch (e) {
            Sentry.captureMessage(JSON.stringify(e));
            console.error(
              "TASK ITEM FAILED: ",
              id,
              " ",
              chunk.map((item) => item.address).join(", "),
              " ",
              e
            );
          }
        })
      );
      reportTaskProgress(page.rows.length);

      pageNr++;
    }

    console.info("TASK COMPLETE: ", id);
  } catch (err) {
    Sentry.captureMessage(JSON.stringify(err));
    console.error("TASK FAILED: ", id, err);
  }

  t2.end();
}

export async function runProfileTask(
  id: number,
  fn: (item: FCProfile) => Promise<void>,
  name: string
) {
  const uniqueId = String(`${id} ${name}`);
  const t2 = timer(uniqueId);

  let taskProgress = 0;
  let taskTotal = 0;
  function reportTaskProgress(newTp: number) {
    taskProgress = taskProgress + newTp;
    console.log(
      `${uniqueId}: ${taskProgress} out of ${taskTotal} completed, ${Math.round(
        (100 * taskProgress) / taskTotal
      )}% in ${Math.round(t2.interval())} minutes, completion in ${
        taskProgress !== 0
          ? Math.round((taskTotal / taskProgress) * t2.interval())
          : "?"
      } minutes`
    );
  }

  try {
    const totalCount: pg.QueryResult = await postgresLimiter.schedule(
      async () => {
        const client = await getPostgresClient();

        const r = await client.query(`
    select count(p.address) as count from profiles p where not exists (select * from task_completions t where t.hash=p.address and t.task_id = ${id})
  `);

        client.release();

        return r;
      }
    );
    taskTotal = totalCount.rows[0].count;
    reportTaskProgress(0);

    let pageNr = 0;
    while (true) {
      const page: QueryResult<FCProfile> = await postgresLimiter.schedule(
        async () => {
          const client = await getPostgresClient();

          const r = await client.query(`
        select p.* from profiles p where not exists (select * from task_completions t where t.hash=p.address and t.task_id = ${id}) order by p.registered_at ${
            id === 6 ? "desc" : "asc"
          } limit 100 offset ${pageNr * 100}
      `);

          client.release();

          return r;
        }
      );

      if (!page.rows.length) {
        // done
        break;
      }

      await Promise.all(
        page.rows.map(async (item) => {
          try {
            await fn(item);

            // id 4 is not permanent
            if (id !== 4 && id !== 5 && id !== 6 && id !== 8) {
              // set task as completed
              await postgresLimiter.schedule(async () => {
                const client = await getPostgresClient();

                const r = await client.query(
                  `insert into task_completions (hash, task_id) values ($1, $2) on conflict do nothing`,
                  [item.address, id]
                );
                client.release();

                return r;
              });
            }
          } catch (err) {
            Sentry.captureException(err);

            console.error(
              "TASK ITEM FAILED: ",
              id,
              " ",
              item.address,
              " ",
              err
            );
          }
        })
      );

      reportTaskProgress(page.rows.length);

      pageNr++;
    }

    console.info("TASK COMPLETE: ", id);
  } catch (err) {
    Sentry.captureException(err);
    console.error("TASK FAILED: ", id, err);
  }

  t2.end();
}
