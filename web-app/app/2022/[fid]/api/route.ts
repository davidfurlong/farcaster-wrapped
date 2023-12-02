import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

type FCProfile = any;
type FCCast = any;

export type Wrapped2022 = Record<
  number,
  {
    emojis_view: { emojis: any[] };
    topics_view: { entities: string[]; counts: number[] };
    topics_positive_view: { entities: string[]; counts: number[] };
    responded_by_view: { top_replies: any[] };
    top_domains_view: { top_domains: Array<{ domain: string; count: number }> };
    first_cast_view: { cast: FCCast | null };
    top_casts_view: { top_casts: any[] };
    // num_deleted_casts_view: { count: number };
    profile_fans_view: { fans: any[] };
    casted_images_view: { data: Array<{ url: string; hash: string }> };
    num_likes_view: { count: number };
    casts_over_time_view: {
      data: Array<{ week: string; count: number }>;
      max: number;
    };
    num_castaways_view: { count: number };
    persona_percentage?: string;
    persona:
      | "questioncaster"
      | "lurkcaster"
      | "ghostcaster"
      | "gramcaster"
      | "replyguy"
      | "shillcaster"
      | "threadcastor"
      | "botcaster"
      | "castaway"
      | "cryptocaster"
      | "birdappcaster";
    personas_view: {
      // [decimal percentage score, base count of items matching]
      questioncaster: [number, number];
      lurkcaster: [number, number];
      ghostcaster: [number, number];
      gramcaster: [number, number];
      replyguy: [number, number];
      shillcaster: [number, number];
      threadcastor: [number, number];
      botcaster: [number, number];
      castaway: [number, number];
      cryptocaster: [number, number];
      birdappcaster: [number, number];
    };
    num_threads_view: { count: number };
    num_questions_view: { count: number };
    num_replies_view: { count: number };
    num_gms_view: { count: number };
    num_liked_by_view: { count: number };
    num_casts_view: { count: number };
    responded_to_view: { top_replies: any[] };
    user_card_view: Pick<
      FCProfile,
      "avatar_url" | "display_name" | "username" | "fid" | "bio"
    >;
    user_number_view: { number: number | string };
  }
>;

export async function GET(req: NextRequest, context: { params: any }) {
  const fid = context.params.fid;
  try {
    const wrappedJSON = require(`../rawfiles/wrapped2022-fid=${fid}.json`);

    // Load from JSON file current user's data
    if (!wrappedJSON.hasOwnProperty(fid) || !fid) {
      // Maybe joined farcaster after this date
      return NextResponse.json({
        message:
          "sorry no wrapped for you, you may have joined farcaster too late",
        status: 404,
      });
    }
    const wrapped = wrappedJSON[fid];

    const [persona, percentage] = getPersona(wrapped.personas_view, fid);

    return NextResponse.json({
      wrapped: { ...wrapped, persona, persona_percentage: percentage },
    });
  } catch (err) {
    return NextResponse.json({
      message: "something went wrong",
      status: 500,
    });
  }
}

const percents = [1, 5, 10, 15, 20, 25, 30, 50, 60, 70, 80, 90, 95];

function getPersona(
  wrapped: Wrapped2022[number]["personas_view"],
  fid: number
): [Wrapped2022[number]["persona"], string] {
  const personaBreakoffs = require(`../rawfiles/persona-breakoffs.json`);

  if (
    // manual bot list
    [
      3431, 981, 1297, 5716, 1149, 6365, 7068, 1026, 3729, 6860, 2684, 6862,
      3179,
    ].includes(fid)
  )
    return ["botcaster", "1%. You actually a bot, go back to work!"];
  if ([2, 3].includes(fid)) return ["shillcaster", "1%"];
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
    console.log(err);
    return ["botcaster", "100%"];
  }
}
