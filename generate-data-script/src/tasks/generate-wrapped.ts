import { getPostgresClient } from "./task";
import * as fs from "fs";
import { Wrapped2022 } from "../shared/types";

// make promise version of fs.readFile()
const readFileAsync = function (filename, options) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filename, options, function (err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

export async function getDistributionOfPersonas(allPersonaBreakoffs, personas) {
  let personaCounts = Object.keys(personas[0][0]).reduce((prev, next) => {
    return { ...prev, [next]: [] };
  }, {});
  //
  personas.forEach((persona) => {
    const personaCalc = getTopPersona(
      persona[0],
      allPersonaBreakoffs,
      persona[1]
    );
    personaCounts[personaCalc[0]].push(persona[1]);
  });

  console.log(personaCounts);
}
const percents = [1, 5, 10, 15, 20, 25, 30, 50, 60, 70, 80, 90, 95];

export async function generatePersonaNormalization(fids: number[]) {
  // Read all the JSON files.
  // Get all the persona scores
  // let done = 0;
  let personas: Array<[Wrapped2022[number]["personas_view"], number]> = [];
  await Promise.all(
    fids.map(async (fid) => {
      try {
        const file = (await readFileAsync(
          `../../web-app/app/2022/rawfiles/wrapped2022-fid=${fid}.json`,
          {
            encoding: "utf-8",
          }
        )) as string;
        const json: Wrapped2022 = JSON.parse(file);

        // fix replyguys
        // json[fid].personas_view.replyguy = [
        //   json[fid].num_replies_view.count /
        //     Math.max(
        //       1,
        //       json[fid].num_casts_view.count,
        //       json[fid].num_replies_view.count
        //     ),
        //   json[fid].personas_view.replyguy[1],
        // ];
        // await saveJSON(json, fid);

        // console.log(++done);
        personas.push([json[fid].personas_view, fid]);
      } catch (err) {
        console.log(err);
      }
    })
  );

  // Calculate for each persona calculate the decimals for top 5%, 10%, 20%, 30% in distribution
  const allPersonaBreakoffs = Object.keys(personas[0][0]).reduce(
    (prev, next) => {
      // Sort 10* personas.length
      const personaValuesHighestFirst = personas
        .map((persona) => persona[0][next][0])
        .sort((a, b) => b - a);
      return {
        ...prev,
        [next]: percents.map(
          (percent) =>
            personaValuesHighestFirst[
              Math.floor(personas.length / (100 / percent))
            ]
        ),
      };
    },
    {}
  );

  console.log(allPersonaBreakoffs);

  getDistributionOfPersonas(allPersonaBreakoffs, personas);

  fs.writeFileSync(
    `../../web-app/pages/api/wrapped/rawfiles/persona-breakoffs.json`,
    JSON.stringify(allPersonaBreakoffs),
    {
      encoding: "utf-8",
    }
  );

  return null;
}

function getTopPersona(
  wrapped: Wrapped2022[number]["personas_view"],
  personaBreakoffs: any,
  fid: number
): [Wrapped2022[number]["persona"], string] {
  if (
    // manual bot list
    [
      3431, 981, 1297, 5716, 1149, 6365, 7068, 1026, 3729, 6860, 2684, 6862,
      3179,
    ].includes(fid)
  )
    return ["botcaster", "...BEEP BOOP, go back to work! top 1%"];
  try {
    const pv = wrapped;
    // Find the top % one
    // 6 breakoffs
    let i = 0;
    while (i < percents.length) {
      const hit = Object.entries(pv).find(([key, value]) => {
        return value[0] > personaBreakoffs[key][i];
      });
      if (hit) return [hit[0], `${percents[i]}%`] as any;
      i = i + 1;
    }

    if (pv.birdappcaster[0] > 0) return ["birdappcaster", "90%"];
    if (pv.ghostcaster[0] > 0) return ["ghostcaster", "90%"];
    // if (pv.botcaster[0] > 0) return ["botcaster", "90%"];

    // No hits :(
    // Take the maximum value
    const sortedEntries = Object.entries(pv).sort((a, b) => b[1][0] - a[1][0]);
    return [sortedEntries[0][0], "50%"] as any;
  } catch (err) {
    return null;
  }
}

async function saveJSON(json: { [fid: number]: object }, fid: number) {
  //   fs.writeFileSync(`wrapped2022-${fidFilter}.json`, JSON.stringify(json), {
  //     encoding: "utf-8",
  //   });

  fs.writeFileSync(
    `../../web-app/app/2022/rawfiles/wrapped2022-fid=${fid}.json`,
    JSON.stringify(json),
    {
      encoding: "utf-8",
    }
  );
}

export async function generateWrapped(fid: number): Promise<void> {
  let step = 0;
  const userNrs = await getUserNr(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  const userCards = await getUserCards(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  const numCasts = await getProfileCastsCount(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  const numLikes = await getProfileLikesCount(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  const numLikedBy = await getProfileLikedByCount(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  //   const numDeleted = await getProfileDeletedCastsCount(fid);
  //   if(process.env.LOG_LEVEL==='deDEBUG console.log(step++, new Date().toISOString());

  const profileTopics = await getProfileTopics(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  const profilePositiveTopics = await getProfileTopicsPositively(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  const fans = await getProfileFans(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  const emojis = await getProfileTopEmojis(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  const topCasts = await getProfileTopCasts(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  // 10
  const firstCast = await getProfileFirstCast(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  const topDomains = await getCastTopDomains(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  const respondedBy = await getMostRespondedBy(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  const respondedTo = await getMostRespondedTo(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  const gmCount = await getProfileGmsGivenCount(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  // 15
  const castsOverTime = await getProfileCastsOverTime(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  const castedImages = await getCastedImages(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  const threadsCount = await getProfileThreadsCount(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  const repliesCount = await getProfileRepliesCount(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  const questionsCount = await getProfileQuestionsCount(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  // 20
  const castawayCount = await getProfileCastawaysCount(fid);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  // format
  let jsonFile: Wrapped2022 = Object.entries(userNrs).reduce(
    (prev, [key, value]) => {
      return {
        ...prev,
        [key]: {
          ...value,
          ...userCards[key],
          ...numCasts[key],
          ...numLikes[key],
          // ...numDeleted[key],
          ...profilePositiveTopics[key],
          ...profileTopics[key],
          ...numLikedBy[key],
          ...fans[key],
          ...emojis[key],
          ...topCasts[key],
          ...firstCast[key],
          ...topDomains[key],
          ...respondedBy[key],
          ...respondedTo[key],
          ...gmCount[key],
          ...castsOverTime[key],
          ...castedImages[key],
          ...threadsCount[key],
          ...repliesCount[key],
          ...questionsCount[key],
          ...castawayCount[key],
        },
      };
    },
    {}
  );

  // 21
  const persona = await getPersona(fid, jsonFile);
  if (process.env.LOG_LEVEL === "DEBUG")
    console.log(step++, new Date().toISOString());

  jsonFile = Object.entries(jsonFile).reduce((prev, [key, value]) => {
    return {
      ...prev,
      [key]: {
        ...value,
        ...persona[key],
      },
    };
  }, {});

  await saveJSON(jsonFile, fid);
}

async function getPersona(fid: number, jsonFile: Wrapped2022) {
  const wrapped = jsonFile[fid];

  const shillCaster = wrapped.top_domains_view.top_domains.find((domain) =>
    wrapped.user_card_view?.bio?.includes(domain.domain)
  );

  const cryptoCaster = [
    wrapped.topics_view.entities.findIndex((x) => x === "eth"),
    wrapped.topics_view.entities.findIndex((x) => x === "ethereum"),
    wrapped.topics_view.entities.findIndex((x) => x === "crypto"),
    wrapped.topics_view.entities.findIndex((x) => x === "bitcoin"),
    wrapped.topics_view.entities.findIndex((x) => x === "coinbase"),
  ]
    .filter((x) => x !== -1)
    .map((x) => wrapped.topics_view.counts[x])
    .reduce((prev, next) => prev + next, 0);

  const birdAppCaster = wrapped.top_domains_view.top_domains
    .filter((d) => d.domain === "twitter.com")
    .map((x) => x.count)
    .reduce((prev, next) => prev + next, 0);

  const personas = {
    questioncaster: [
      wrapped.num_questions_view.count /
        Math.max(
          wrapped.num_casts_view.count - wrapped.num_replies_view.count,
          1
        ),
      wrapped.num_questions_view.count,
    ],
    lurkcaster: [
      wrapped.num_likes_view.count /
        Math.max(
          wrapped.num_casts_view.count + wrapped.num_likes_view.count,
          1
        ),
      wrapped.num_likes_view.count,
    ],
    ghostcaster: [
      Math.max(
        0,
        100 - (wrapped.num_likes_view.count + wrapped.num_casts_view.count)
      ) / 100,
      wrapped.num_likes_view.count,
      // num days since joining
      new Date().getTime() -
        new Date(wrapped.first_cast_view.cast?.published_at).getTime() /
          (1000 * 3600 * 24),
    ],
    gramcaster: [
      wrapped.casted_images_view.data.length /
        Math.max(wrapped.num_casts_view.count, 1),
      wrapped.casted_images_view.data.length,
    ],
    replyguy: [
      wrapped.num_replies_view.count /
        Math.max(1, wrapped.num_casts_view.count),
      wrapped.num_replies_view.count,
    ],

    shillcaster: [
      (shillCaster?.count || 0) /
        Math.max(shillCaster?.count || 0, wrapped.num_casts_view.count, 1),
      shillCaster?.count || 0,
    ],
    threadcastor: [
      wrapped.num_threads_view.count /
        Math.max(
          wrapped.num_threads_view.count,
          wrapped.num_casts_view.count - wrapped.num_replies_view.count,
          1
        ),
      wrapped.num_threads_view.count,
    ],
    botcaster: [
      wrapped.num_replies_view.count /
        Math.max(
          wrapped.num_replies_view.count,
          1,
          wrapped.num_likes_view.count + wrapped.num_casts_view.count
        ),
      wrapped.num_replies_view.count,
    ],
    castaway: [
      wrapped.num_castaways_view.count /
        Math.max(
          wrapped.num_castaways_view.count,
          wrapped.num_casts_view.count - wrapped.num_replies_view.count,
          1
        ),
      wrapped.num_castaways_view.count,
    ],
    cryptocaster: [
      cryptoCaster / Math.max(cryptoCaster, 1, wrapped.num_casts_view.count),
      cryptoCaster,
    ],
    birdappcaster: [
      birdAppCaster / Math.max(birdAppCaster, 1, wrapped.num_casts_view.count),
      birdAppCaster,
    ],
  };

  return {
    [fid]: { personas_view: personas },
  };
}

async function getProfileTopEmojis(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query({
    text: `
  select p.fid, array(
    select json_build_object('emoji', most_emojis.emoji, 'count', most_emojis.count) 
        from (
            SELECT emoji, COUNT(emoji) AS count
            FROM (
                SELECT unnest(regexp_matches(c.text, '[\\U0001F300-\\U0001F6FF]', 'g')) AS emoji
                FROM casts c where c.author_fid=p.fid and c.published_at >= '2022-01-01 00:00:00'::timestamp
            ) t
            GROUP BY emoji
            ORDER BY count DESC
            LIMIT 10
        ) most_emojis
  ) as emojis from profiles p where fid=${fid};
    `,
    // types: {
    //   getTypeParser: () => (val) => val,
    // },
  });

  client.release();
  return {
    [fid]: {
      emojis_view: {
        emojis:
          res.rows[0]?.emojis.map((e) => {
            return {
              emoji: e.emoji,
              count: e.count,
            };
          }) || [],
      },
    },
  };
}

async function getProfileTopics(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
    select p.fid, array(
      select 
         s.entity_text
      from
          sentiment_entity_mentions s, casts c
      where
          s.cast_hash=c.hash and s.entity_text not ilike 'farcaster://%' and c.author_fid=p.fid and s.entity_text != 'i' and s.entity_text != 'you' and c.published_at >= '2022-01-01 00:00:00'::timestamp
      group by
          c.author_fid, s.entity_text
      order by count(*) desc limit 10
    ) as entities, array(
      select
         count(s.*) as count
      from
          sentiment_entity_mentions s, casts c
      where
          s.cast_hash=c.hash and c.author_fid=p.fid and s.entity_text != 'i' and s.entity_text != 'you' and c.published_at >= '2022-01-01 00:00:00'::timestamp
      group by
          c.author_fid, s.entity_text
      order by count(*) desc limit 10
    ) as counts from profiles p where fid=${fid};
      `);

  client.release();

  return {
    [fid]: {
      topics_view: {
        entities: res.rows?.[0]?.entities || [],
        counts: res.rows?.[0]?.counts || [],
      },
    },
  };
}

async function getProfileTopicsPositively(fid: number) {
  const client = await getPostgresClient();
  /**
   * Do a subquery
   *    - top 3 topics per user, aggregated into one column.
   * For testing user one single user
   */
  const res = await client.query(`
  select p.fid, array(
    select 
       s.entity_text
    from
        sentiment_entity_mentions s, casts c
    where
        s.cast_hash=c.hash and c.author_fid=p.fid and s.score > 0.95 and s.sentiment = 'POSITIVE' and c.published_at >= '2022-01-01 00:00:00'::timestamp
    group by
        c.author_fid, s.entity_text
    order by count(s.*) desc limit 10
  ) as entities, array(
    select
       count(s.*) as count
    from
        sentiment_entity_mentions s, casts c
    where
        s.cast_hash=c.hash and c.author_fid=p.fid and s.score > 0.95 and s.sentiment = 'POSITIVE' and c.published_at >= '2022-01-01 00:00:00'::timestamp
    group by
        c.author_fid, s.entity_text
    order by count(s.*) desc limit 10
  ) as counts from profiles p where fid=${fid};
    `);

  client.release();

  return {
    [fid]: {
      topics_positive_view: {
        entities: res.rows?.[0]?.entities || [],
        counts: res.rows?.[0]?.counts || [],
      },
    },
  };
}

async function getMostRespondedTo(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
  select p.fid, array(
    select json_build_object('fid', tri.fid, 'username', tri.username, 'display_name', tri.display_name, 'avatar_url', tri.avatar_url, 'count', tri.count)
        from (
            select pr.*, count from (
                SELECT ca.author_fid, count(ca.*) as count from casts c, casts ca
                WHERE
                  c.reply_parent_hash=ca.hash and c.author_fid = p.fid and ca.author_fid != p.fid and c.published_at >= '2022-01-01 00:00:00'::timestamp
                GROUP BY ca.author_fid
                ORDER BY count DESC
                LIMIT 10
            ) t, profiles pr where t.author_fid=pr.fid
      ) tri
) as top_replies from profiles p where fid=${fid};
      `);

  client.release();

  return {
    [fid]: {
      responded_to_view: {
        top_replies: res.rows?.[0]?.top_replies || [],
      },
    },
  };
}

async function getMostRespondedBy(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
  select p.fid, array(
    select json_build_object('fid', tri.fid, 'username', tri.username, 'display_name', tri.display_name, 'avatar_url', tri.avatar_url, 'count', tri.count)
        from (
            select pr.*, count from (
                SELECT c.author_fid, count(c.*) as count from casts c, casts ca
                WHERE
                  c.reply_parent_hash=ca.hash and c.author_fid != p.fid and ca.author_fid=p.fid and c.published_at >= '2022-01-01 00:00:00'::timestamp
                GROUP BY c.author_fid
                ORDER BY count DESC
                LIMIT 10
            ) t, profiles pr where t.author_fid=pr.fid
      ) tri
) as top_replies from profiles p where fid=${fid};
      `);

  client.release();

  return {
    [fid]: {
      responded_by_view: {
        top_replies: res.rows?.[0]?.top_replies || [],
      },
    },
  };
}

async function getCastedImages(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
  SELECT regexp_match(c.text, '(https://i.imgur.com/[/\\w \\.-]*/?)') url_array, c.hash
  FROM casts c
  WHERE 
      c.text ~ 'https://i.imgur.com/([/\\w \\.-]*)*/?'
      AND c.author_fid=${fid} and c.published_at >= '2022-01-01 00:00:00'::timestamp
        order by c.published_at desc
       ;
    `);

  client.release();

  return {
    [fid]: {
      casted_images_view: {
        data:
          res.rows.map((el) => ({ url: el.url_array[0], hash: el.hash })) || [],
      },
    },
  };
}

async function getCastTopDomains(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
  select p.fid, array(
    select json_build_object('domain', top_domains_inner.domain, 'count', top_domains_inner.count) 
        from (
            SELECT regexp_replace(SUBSTRING(se.entity_text FROM '^(?:https?://)?([^/]*)'), '(?:https?://)?(?:www\.)?', '') as domain, COUNT(*) AS count
            FROM sentiment_entity_mentions se, casts c
            WHERE
                se.entity_text ~ '(https?://)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([/\\w \\.-]*)*/?' and c.published_at >= '2022-01-01 00:00:00'::timestamp
                AND se.cast_hash=c.hash and c.author_fid=p.fid AND regexp_replace(SUBSTRING(se.entity_text FROM '^(?:https?://)?([^/]*)'), '(?:https?://)?(?:www\.)?', '') != 'i.imgur.com'
            GROUP BY domain
            ORDER BY count DESC
            LIMIT 10
        ) top_domains_inner
  ) as top_domains from profiles p where fid=${fid};
    `);

  client.release();

  return {
    [fid]: {
      top_domains_view: { top_domains: res.rows?.[0]?.top_domains || [] },
    },
  };
}

async function getProfileFirstCast(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
  SELECT c.author_fid as fid, c.text, c.published_at, c.hash
  FROM casts c
  JOIN (
    SELECT ca.author_fid, MIN(ca.published_at) published_at
    FROM casts ca where ca.is_recast is not true and ca.deleted is not true and ca.reply_parent_hash is null and ca.published_at >= '2022-01-01 00:00:00'::timestamp
    GROUP BY ca.author_fid
  ) e ON e.author_fid = c.author_fid AND e.published_at = c.published_at and c.author_fid=${fid}
  `);

  client.release();

  return {
    [fid]: { first_cast_view: { cast: res.rows?.[0] || null } },
  };
}

async function getProfileTopCasts(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
    select p.fid, array(
        select json_build_object('text', top_casts_inner.text, 'thread_hash', top_casts_inner.thread_hash, 'hash', top_casts_inner.hash, 'likes', top_casts_inner.reactions, 'replies', top_casts_inner.replies, 'recasts', top_casts_inner.recasts) 
            from (
                select c.text, c.hash, c.thread_hash, c.replies, c.recasts, c.reactions, coalesce(c.replies, 0) + (2 * coalesce(c.reactions, 0)) + (4 * coalesce(c.recasts, 0)) as score from casts c where c.author_fid=p.fid and c.published_at >= '2022-01-01 00:00:00'::timestamp and c.is_recast is false
                ORDER BY score DESC
                LIMIT 10
            ) top_casts_inner
    ) as top_casts from profiles p where fid=${fid};
    `);

  client.release();

  return {
    [fid]: { top_casts_view: { top_casts: res.rows?.[0]?.top_casts || [] } },
  };
}

// async function getProfileDeletedCastsCount(fidFilter: string) {
//   const client = await getPostgresClient();
//   const res = await client.query(`
//   select author_fid, count(*) as count from casts where deleted is true group by author_fid;
//   `);

//   client.release();

//   return res.rows.reduce((prev, next) => {
//     return {
//       ...prev,
//       [next.fid]: { num_deleted_casts_view: { count: next.count } },
//     };
//   }, {});
// }

async function getProfileFans(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
  select p.fid, array(
    select json_build_object('fid', pr.fid, 'username', pr.username, 'display_name', pr.display_name, 'avatar_url', pr.avatar_url, 'count', most_fans.count) from (
        select 
            l.fid as fid, count(l.*) as count
            from
                likes l, casts c
            where
                l.cast_hash=c.hash and c.author_fid=p.fid and c.published_at >= '2022-01-01 00:00:00'::timestamp
            group by
                c.author_fid, l.fid
            order by count(*) desc limit 10
    ) most_fans, profiles pr where most_fans.fid=pr.fid
  ) as fans from profiles p where fid=${fid};
`);

  client.release();

  return {
    [fid]: {
      profile_fans_view: { fans: res.rows?.[0]?.fans || [] },
    },
  };
}

async function getProfileGmsGivenCount(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
        select l.fid, count(l.*) as count from likes l, casts c where l.fid=${fid} and c.hash=l.cast_hash and c.text ilike 'gm%' and c.published_at >= '2022-01-01 00:00:00'::timestamp group by l.fid;
    `);

  client.release();

  return {
    [fid]: { num_gms_view: { count: res.rows?.[0]?.count || 0 } },
  };
}

async function getProfileLikesCount(fid: number) {
  const client = await getPostgresClient();
  // Not entirely accurate query
  const res = await client.query(`
  select count(l.*) as count from likes l, casts c where c.hash = l.cast_hash and l.fid=${fid} and c.published_at >= '2022-01-01 00:00:00'::timestamp;
    `);

  client.release();

  return {
    [fid]: { num_likes_view: { count: res.rows?.[0]?.count || 0 } },
  };
}

async function getProfileLikedByCount(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
      select ${fid} as fid, count(l.*) as count from likes l, casts c where c.hash = l.cast_hash and c.author_fid=${fid} and c.published_at >= '2022-01-01 00:00:00'::timestamp;
    `);

  client.release();

  return {
    [fid]: { num_liked_by_view: { count: res.rows?.[0]?.count || 0 } },
  };
}

async function getProfileCastsOverTime(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
  select weeks.week week, COALESCE(c.count, 0) count from (SELECT generate_series(date_trunc('week', date '2022-01-01' + interval '6 days')
  , date_trunc('week', date '2022-12-24')
  , interval '1 week')::date AS week, 0 as count) weeks left outer join (select date_trunc('week',casts.published_at) week, count(casts.*) count from casts where casts.author_fid=${fid} group by date_trunc('week',casts.published_at)) c on c.week=weeks.week

    `);

  client.release();
  // FIXME: Fill in empties

  return {
    [fid]: {
      casts_over_time_view: {
        data: res.rows || [],
        max: Math.max(...res.rows.map((r) => r.count), 1),
      },
    },
  };
}

async function getProfileThreadsCount(fid: number) {
  const client = await getPostgresClient();
  // Threads of at least 3 length top level
  const res = await client.query(`
        select
          c.author_fid, count(c.*) as count from casts c, casts ca, casts cas
        where 
          c.author_fid=${fid} and cas.published_at >= '2022-01-01 00:00:00'::timestamp and c.reply_parent_hash is not null and c.reply_parent_hash=ca.hash and
          ca.reply_parent_hash=cas.hash and ca.author_fid=${fid} and cas.author_fid=${fid} and cas.reply_parent_hash is null
        group by c.author_fid;
    `);

  client.release();

  return {
    [fid]: { num_threads_view: { count: res.rows?.[0]?.count || 0 } },
  };
}

async function getProfileRepliesCount(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
        select author_fid, count(*) as count from casts where author_fid=${fid} and reply_parent_hash is not null and published_at >= '2022-01-01 00:00:00'::timestamp group by author_fid;
    `);

  client.release();

  return {
    [fid]: { num_replies_view: { count: res.rows?.[0]?.count || 0 } },
  };
}

async function getProfileCastawaysCount(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
  select author_fid, count(*) count from casts where
    reactions=0 and published_at >= '2022-01-01 00:00:00'::timestamp and recasts=0 and is_recast=false and author_fid <> 3179 and replies=0 and deleted is false and reply_parent_hash is null
    and author_fid=${fid} group by author_fid
    `);

  client.release();

  return {
    [fid]: { num_castaways_view: { count: res.rows?.[0]?.count || 0 } },
  };
}

async function getProfileQuestionsCount(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
  select
    author_fid, count(*) count
  from
    casts
  where
    text ~ '\\?[ $\\n]' and reply_parent_hash is null and deleted is false and author_fid=${fid} and published_at >= '2022-01-01 00:00:00'::timestamp
  group by author_fid
    `);

  client.release();

  return {
    [fid]: { num_questions_view: { count: res.rows?.[0]?.count || 0 } },
  };
}

async function getProfileCastsCount(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
        select author_fid, count(*) as count from casts where author_fid=${fid} and published_at >= '2022-01-01 00:00:00'::timestamp group by author_fid;
    `);

  client.release();

  return {
    [fid]: { num_casts_view: { count: res.rows?.[0]?.count || 0 } },
  };
}

async function getUserCards(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
        select avatar_url, display_name, username, fid, bio from profiles where fid=${fid};
  `);

  client.release();

  return {
    [fid]: { user_card_view: res.rows?.[0] || null },
  };
}

async function getUserNr(fid: number) {
  const client = await getPostgresClient();
  const res = await client.query(`
      select fid from profiles where fid=${fid};
`);

  client.release();

  return { [fid]: { user_number_view: { number: res.rows?.[0].fid || null } } };
}
