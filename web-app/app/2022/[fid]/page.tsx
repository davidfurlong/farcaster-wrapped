"use client";

import {
  Box,
  Button,
  Center,
  Grid,
  GridItem,
  GridItemProps,
  Icon,
  Stack,
  Text,
  useMediaQuery,
} from "@chakra-ui/react";
import { motion, AnimateSharedLayout, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import {
  TbChevronLeft,
  TbChevronRight,
  TbExternalLink,
  TbX,
} from "react-icons/tb";
import { Image } from "./image";
import { useSWR } from "./swr";
import { Wrapped2022 } from "./api/route";

const URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://www.discove.xyz";

function shortenText(s: string, length: number) {
  if (!s || s.length <= length) return s;

  return `${s.substring(0, length - 1 - 3)}...`;
}

const NoOp = () => null;

// export async function generateMetadata({
//   params,
//   searchParams,
// }: any): Promise<Metadata> {
//   return {
//     title: "Farcaster Wrapped 2022",
//     description:
//       "Discover the most interesting parts of your year on farcaster",
//     openGraph: {
//       images: ["https://www.discove.xyz/wrapped2022-images/wrapped.png"],
//     },
//   };
// }

export default function Wrapped({ params }: { params: { fid: string } }) {
  // fetch data from server
  const { fid } = params;

  const [focusedCard, setFocusedCard] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [isSmall] = useMediaQuery("(max-width: 62em)");

  const {
    data,
    error,
  }: { data?: { wrapped: Wrapped2022[number] } | undefined; error?: any } =
    useSWR<{
      wrapped: Wrapped2022[number];
    }>(fid ? `/2022/${fid}/api` : null, { revalidateOnFocus: false });

  if (error)
    return (
      <Box
        zIndex={999}
        position="absolute"
        top="0"
        width="100vw"
        height="100vh"
        // padding={8}
        left="0"
        bgGradient="linear(to-b, purple.900, #1e1736)"
      >
        <Center marginTop="50">
          <CardBigNr isBig>
            There was an error... :( Maybe you joined Farcaster in the last
            week?
          </CardBigNr>
        </Center>
      </Box>
    );
  if (!data)
    return (
      <Box
        zIndex={999}
        position="absolute"
        top="0"
        width="100vw"
        height="100vh"
        // padding={8}
        left="0"
        bgGradient="linear(to-b, purple.900, #1e1736)"
      >
        <Center marginTop="50">
          <CardBigNr isBig>Counting gms...</CardBigNr>
        </Center>
      </Box>
    );

  const wrapped = data?.wrapped;

  let page1 = [
    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card
        {...cardProps}
        id="responded_by_view"
        key="responded_by_view"
        rowSpan={6}
        colSpan={[2, 2, 1]}
      >
        <CardHeading isBig={isBig}>Most replied to by</CardHeading>
        {wrapped.responded_by_view.top_replies.length === 0 && (
          <CardListItem isBig={isBig}>not enough data</CardListItem>
        )}
        {wrapped.responded_by_view.top_replies
          .slice(0, isBig ? 10 : 3)
          .map((fan: any) => {
            return (
              <CardListItem
                isBig={isBig}
                marginTop="1px"
                alignItems="center"
                key={fan.username}
              >
                <a
                  target="_blank"
                  style={{ display: "flex" }}
                  rel="noopener noreferrer"
                  href={`https://www.discove.xyz/@${fan.username}`}
                >
                  <Image
                    priority={false}
                    proxySupportInOrder={["cloudflare", "next-img-proxy"]}
                    alt={fan.username}
                    type="profile"
                    style={{
                      display: "inline-block",
                      marginRight: "5px",
                      borderRadius: "100%",
                      border: "1px solid var(--chakra-colors-purple-500)",
                      width: isBig ? "48px" : "32px",
                      marginTop: "2px",
                      height: isBig ? "48px" : "32px",
                    }}
                    src={fan.avatar_url}
                    width={isBig ? 48 : 32}
                    height={isBig ? 48 : 32}
                  />
                </a>
                <a
                  target="_blank"
                  style={{ display: "inline-block" }}
                  rel="noopener noreferrer"
                  href={`https://www.discove.xyz/@${fan.username}`}
                >
                  @{fan.username}{" "}
                  {isBig && (
                    <Icon
                      as={TbExternalLink}
                      style={{ position: "relative", top: "2px", opacity: 0.5 }}
                    />
                  )}{" "}
                  <SubtleText isBig={isBig}>{fan.count}</SubtleText>{" "}
                </a>
              </CardListItem>
            );
          })}
      </Card>
    ),
    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card {...cardProps} id="num_likes_view" key="num_likes_view">
        <CardHeading isBig={isBig}>Likes given</CardHeading>
        <CardBigNr isBig={isBig}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://www.discove.xyz/?t=Newest+likes+of+${fid}&h=1&sql=select+c.*+from+casts+c+inner+join+%28select+*+from+likes+l%2C+profiles+p+where+l.fid%3Dp.fid+and+p.fid%3D${fid}%29+l+on+l.cast_hash%3Dc.hash+where+c.deleted+is+false+order+by+c.custom_metrics-%3E%27custom_cast_metrics%27-%3E%27new%27+desc+limit+30+offset+%24%24OFFSET%24%24`}
          >
            {wrapped.num_likes_view.count}{" "}
            {isBig && (
              <Icon
                as={TbExternalLink}
                style={{ position: "relative", top: "2px", opacity: 0.5 }}
              />
            )}
          </a>
        </CardBigNr>
      </Card>
    ),
    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card {...cardProps} id="num_castaways_view" key="num_castaways_view">
        <CardHeading isBig={isBig}>Castaway-ed</CardHeading>
        <CardBigNr isBig={isBig}>{wrapped.num_castaways_view.count}</CardBigNr>
      </Card>
    ),

    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card
        id="first_cast_view_date"
        key="first_cast_view_date"
        {...cardProps}
        colSpan={2}
      >
        <CardHeading isBig={isBig}>First cast of the year</CardHeading>
        <CardBigNr isBig={isBig}>
          {new Date(
            wrapped?.first_cast_view?.cast?.published_at || ""
          ).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
        </CardBigNr>
      </Card>
    ),
    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card
        id="num_liked_by_view"
        key="num_liked_by_view"
        {...cardProps}
        colSpan={3}
      >
        <CardHeading isBig={isBig}>Likes received</CardHeading>
        <CardBigNr isBig={isBig}>{wrapped.num_liked_by_view.count}</CardBigNr>
      </Card>
    ),

    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card {...cardProps} id="num_replies_view" key="num_replies_view">
        <CardHeading isBig={isBig}>Replies</CardHeading>
        <CardBigNr isBig={isBig}>{wrapped.num_replies_view.count}</CardBigNr>
      </Card>
    ),
    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card {...cardProps} id="num_questions_view" key="num_questions_view">
        <CardHeading isBig={isBig}>Questions posed</CardHeading>
        <CardBigNr isBig={isBig}>{wrapped.num_questions_view.count}</CardBigNr>
      </Card>
    ),
  ];

  let cards = [
    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card height="auto" id="emojis_view" key="emojis_view" {...cardProps}>
        <CardHeading isBig={isBig}>Top Emojis</CardHeading>
        {wrapped.emojis_view.emojis.slice(0, isBig ? 10 : 3).map((emoji, i) => {
          return (
            <CardListItem isBig={isBig} key={emoji.emoji}>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.discove.xyz/?sql=select+*+from+casts+where+author_fid%3D${fid}+and+text+ilike+%27%25${emoji.emoji}%25%27+and+deleted+is+false+order+by+custom_metrics-%3E%27custom_cast_metrics%27-%3E%27new%27+desc+limit+30+offset+%24%24OFFSET%24%24`}
              >
                {emoji.emoji}{" "}
                {isBig && (
                  <Icon
                    as={TbExternalLink}
                    style={{ position: "relative", top: "2px", opacity: 0.5 }}
                  />
                )}
                <SubtleText isBig={isBig}>{emoji.count}</SubtleText>{" "}
              </a>
            </CardListItem>
          );
        })}
        {wrapped.emojis_view.emojis.length === 0 && (
          <CardListItem isBig={isBig}>none</CardListItem>
        )}
      </Card>
    ),
    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card
        id="topics_positive_view"
        key="topics_positive_view"
        {...cardProps}
        colSpan={2}
      >
        <CardHeading isBig={isBig}>Most positive about</CardHeading>
        {wrapped.topics_positive_view.entities
          .slice(0, isBig ? 10 : 3)
          .map((entity, i) => {
            return (
              <CardListItem key={entity} isBig={isBig}>
                {entity}
              </CardListItem>
            );
          })}
        {wrapped.topics_positive_view.entities.length === 0 && (
          <CardListItem isBig={isBig}>not enough data</CardListItem>
        )}
      </Card>
    ),

    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card id="topics_view" key="topics_view" {...cardProps} colSpan={2}>
        <CardHeading isBig={isBig}>Top topics</CardHeading>
        {wrapped.topics_view.entities.length === 0 && (
          <CardListItem isBig={isBig}>none</CardListItem>
        )}
        {wrapped.topics_view.entities
          .slice(0, isBig ? 10 : 3)
          .map((entity, i) => {
            return (
              <CardListItem key={entity} isBig={isBig}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.discove.xyz/?sql=select+*+from+casts+where+author_fid%3D${fid}+and+text+ilike+%27%25${entity}%25%27+and+deleted+is+false+order+by+custom_metrics-%3E%27custom_cast_metrics%27-%3E%27new%27+desc+limit+30+offset+%24%24OFFSET%24%24`}
                >
                  {entity}{" "}
                  {isBig && (
                    <Icon
                      as={TbExternalLink}
                      style={{ position: "relative", top: "2px", opacity: 0.5 }}
                    />
                  )}
                  <SubtleText isBig={isBig}>
                    {wrapped.topics_view.counts[i]}
                  </SubtleText>
                </a>
              </CardListItem>
            );
          })}
      </Card>
    ),
    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card
        id="profile_fans_view"
        key="profile_fans_view"
        {...cardProps}
        colSpan={2}
      >
        <CardHeading isBig={isBig}>Most liked by</CardHeading>
        {wrapped.profile_fans_view.fans.slice(0, isBig ? 10 : 3).map((fan) => {
          return (
            <CardListItem
              isBig={isBig}
              marginTop="1px"
              alignItems="center"
              key={fan.username}
            >
              <a
                target="_blank"
                style={{ display: "flex" }}
                rel="noopener noreferrer"
                href={`https://www.discove.xyz/@${fan.username}`}
              >
                <Image
                  priority={false}
                  proxySupportInOrder={["cloudflare", "next-img-proxy"]}
                  alt={fan.username}
                  type="profile"
                  style={{
                    display: "inline-block",
                    marginRight: "5px",
                    borderRadius: "100%",
                    border: "1px solid var(--chakra-colors-purple-500)",
                    width: isBig ? "48px" : "32px",
                    marginTop: "2px",
                    height: isBig ? "48px" : "32px",
                  }}
                  src={fan.avatar_url}
                  width={isBig ? 48 : 32}
                  height={isBig ? 48 : 32}
                />
              </a>
              <a
                target="_blank"
                style={{ display: "inline-block" }}
                rel="noopener noreferrer"
                href={`https://www.discove.xyz/@${fan.username}`}
              >
                @{fan.username}{" "}
                {isBig && (
                  <Icon
                    as={TbExternalLink}
                    style={{ position: "relative", top: "2px", opacity: 0.5 }}
                  />
                )}{" "}
                <SubtleText isBig={isBig}>{fan.count}</SubtleText>{" "}
              </a>
            </CardListItem>
          );
        })}
      </Card>
    ),

    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card id="num_casts_view" key="num_casts_view" {...cardProps}>
        <CardHeading isBig={isBig}>Casts</CardHeading>
        <CardBigNr isBig={isBig}>{wrapped.num_casts_view.count}</CardBigNr>
      </Card>
    ),

    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card
        id="first_cast_view"
        key="first_cast_view"
        {...cardProps}
        colSpan={2}
      >
        <CardHeading isBig={isBig}>First cast</CardHeading>
        <div>
          <CardListItem
            display="block"
            // isBig={isBig}
            onClick={() => {
              if (isBig)
                window
                  ?.open(
                    `https://www.discove.xyz/casts/${wrapped?.first_cast_view?.cast?.hash}`,
                    "_blank"
                  )
                  ?.focus();
            }}
          >
            {wrapped?.first_cast_view?.cast?.text}{" "}
            {isBig && (
              <Icon
                as={TbExternalLink}
                style={{ position: "relative", top: "2px", opacity: 0.5 }}
              />
            )}
          </CardListItem>
        </div>
      </Card>
    ),

    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => {
      const ratio = 780 / 260;
      return (
        <Card
          id="casts_over_time_view"
          key="casts_over_time_view"
          colSpan={3}
          {...cardProps}
        >
          <CardHeading isBig={isBig}>Casts over time</CardHeading>
          <Box
            padding={2}
            width={isBig ? "500px" : "100%"}
            height="auto"
            maxW="100%"
            maxHeight={isBig ? "calc(100% - 100px)" : "calc(100% - 60px)"}
          >
            <motion.svg
              style={{ height: "100%" }}
              viewBox={`0 0 ${Math.floor(260 * ratio)} 260`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                filter="drop-shadow(0px 1px 1px var(--chakra-colors-purple-600))"
                transition={{
                  duration: 5,
                  ease: "easeInOut",
                  repeat: 0,
                  repeatType: "loop",
                  repeatDelay: 1,
                }}
                strokeWidth={10}
                stroke="#281f47"
                fill="none"
                d={smoothenedSVGPathD(
                  wrapped.casts_over_time_view.data.map((point, i) => [
                    Math.floor(
                      (i * Math.floor(260 * ratio)) /
                        wrapped.casts_over_time_view.data.length
                    ),
                    260 -
                      20 -
                      Math.floor(
                        (point.count * (260 - 40)) /
                          Math.max(wrapped.casts_over_time_view.max, 10)
                      ),
                  ])
                )}
              />
            </motion.svg>
          </Box>
        </Card>
      );
    },
    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card
        id="persona_view"
        key="persona_view"
        colSpan={4}
        rowSpan={1}
        {...cardProps}
      >
        <RenderPersona wrapped={wrapped} isBig={isBig} />
      </Card>
    ),

    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <GridItem
        id="wrapped_view"
        key="wrapped_view"
        textAlign="center"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        color="purple.50"
        paddingX={2}
        colSpan={2}
        // paddingY={2}
        borderRadius={8}
        {...cardProps}
        onClick={() => null}
      >
        <WrappedText
          lineHeight={1.2}
          bgGradient="linear(to-b, purple.50, purple.600)"
        >
          <div>Farcaster</div>
          <div>Wrapped</div>
          <div>2022</div>
        </WrappedText>
      </GridItem>
    ),

    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card id="num_gms_view" key="num_gms_view" {...cardProps}>
        <CardHeading isBig={isBig}>Gms given</CardHeading>
        <CardBigNr isBig={isBig}>{wrapped.num_gms_view.count}</CardBigNr>
      </Card>
    ),
    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card
        id="top_domains_view"
        key="top_domains_view"
        {...cardProps}
        colSpan={2}
      >
        <CardHeading isBig={isBig}>Top Domains shared</CardHeading>
        {wrapped.top_domains_view.top_domains
          .slice(0, isBig ? 10 : 3)
          .map((domain, i) => {
            return (
              <CardListItem key={domain.domain} isBig={isBig}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.discove.xyz/?sql=select+*+from+casts+where+author_fid%3D${fid}+and+text+ilike+%27%25${domain.domain}%25%27+and+deleted+is+false+order+by+custom_metrics-%3E%27custom_cast_metrics%27-%3E%27new%27+desc+limit+30+offset+%24%24OFFSET%24%24`}
                >
                  {domain.domain}{" "}
                  {isBig && (
                    <Icon
                      as={TbExternalLink}
                      style={{ position: "relative", top: "2px", opacity: 0.5 }}
                    />
                  )}
                  <SubtleText isBig={isBig}>{domain.count}</SubtleText>{" "}
                </a>
              </CardListItem>
            );
          })}
        {wrapped.top_domains_view.top_domains.length === 0 && (
          <CardListItem isBig={isBig}>none</CardListItem>
        )}
      </Card>
    ),
    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <GridItem
        id="wrapped_view"
        key="wrapped_view"
        textAlign="center"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        color="purple.50"
        paddingX={2}
        // paddingY={2}
        borderRadius={8}
        colSpan={2}
        alignItems="center"
        {...cardProps}
        onClick={() => null}
      >
        <a
          style={{ display: "flex" }}
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.discove.xyz/@${wrapped.user_card_view.username}`}
        >
          <Image
            priority={true}
            proxySupportInOrder={["cloudflare", "next-img-proxy"]}
            alt={wrapped.user_card_view.display_name || ""}
            type="profile"
            style={{
              margin: "5px",
              borderRadius: "100%",
              border: "1px solid var(--chakra-colors-purple-600)",
              width: "64px",
              height: "64px",
            }}
            src={wrapped.user_card_view.avatar_url || ""}
            width={64}
            height={64}
          />
        </a>

        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.discove.xyz/@${wrapped.user_card_view.username}`}
        >
          <WrappedText
            fontSize="xl"
            lineHeight={1.2}
            bgGradient="linear(to-b, purple.50, purple.600)"
          >
            <div>{wrapped.user_card_view.display_name}</div>
            discove.xyz/@{wrapped.user_card_view.username}
          </WrappedText>
        </a>
      </GridItem>
    ),

    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card {...cardProps} id="num_threads_view" key="num_threads_view">
        <CardHeading isBig={isBig}>Threads written</CardHeading>
        <CardBigNr isBig={isBig}>{wrapped.num_threads_view.count}</CardBigNr>
      </Card>
    ),
    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card id="user_number_view" key="user_number_view" {...cardProps}>
        <CardHeading isBig={isBig}>Caster</CardHeading>
        <CardBigNr isBig={isBig}>#{wrapped.user_number_view.number}</CardBigNr>
      </Card>
    ),
    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card
        id="top_casts_view"
        key="top_casts_view"
        colSpan={4}
        maxH="100vh"
        rowSpan={2}
        {...cardProps}
      >
        <CardHeading isBig={isBig}>Most Popular Casts</CardHeading>
        {wrapped.top_casts_view.top_casts
          .slice(0, isBig ? 6 : 3)
          .map((cast, i) => {
            return (
              <CardListItem
                isBig={isBig}
                key={cast.hash}
                marginBottom={2}
                fontSize={isBig ? "md" : undefined}
              >
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.discove.xyz/casts/${cast.hash}`}
                >
                  {shortenText(cast.text, isBig ? 320 : 140)}{" "}
                  {isBig && (
                    <Icon
                      as={TbExternalLink}
                      style={{ position: "relative", top: "2px", opacity: 0.5 }}
                    />
                  )}
                </a>
              </CardListItem>
            );
          })}
      </Card>
    ),
    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => (
      <Card
        id="responded_to_view"
        key="responded_to_view"
        colSpan={2}
        {...cardProps}
      >
        <CardHeading isBig={isBig}>Most replied to</CardHeading>
        {wrapped.responded_to_view.top_replies
          .slice(0, isBig ? 10 : 3)
          .map((fan: any) => {
            return (
              <CardListItem
                isBig={isBig}
                key={fan.username}
                marginTop="1px"
                alignItems="center"
              >
                <a
                  target="_blank"
                  style={{ display: "flex" }}
                  rel="noopener noreferrer"
                  href={`https://www.discove.xyz/@${fan.username}`}
                >
                  <Image
                    proxySupportInOrder={["cloudflare", "next-img-proxy"]}
                    priority={false}
                    alt={fan.username}
                    type="profile"
                    style={{
                      display: "inline-block",
                      marginRight: "5px",
                      borderRadius: "100%",
                      border: "1px solid var(--chakra-colors-purple-500)",
                      width: isBig ? "48px" : "32px",
                      marginTop: "2px",
                      height: isBig ? "48px" : "32px",
                    }}
                    src={fan.avatar_url}
                    width={isBig ? 48 : 32}
                    height={isBig ? 48 : 32}
                  />
                </a>
                <a
                  target="_blank"
                  style={{ display: "inline-block" }}
                  rel="noopener noreferrer"
                  href={`https://www.discove.xyz/@${fan.username}`}
                >
                  @{fan.username}{" "}
                  {isBig && (
                    <Icon
                      as={TbExternalLink}
                      style={{ position: "relative", top: "2px", opacity: 0.5 }}
                    />
                  )}
                  <SubtleText isBig={isBig}>{fan.count}</SubtleText>{" "}
                </a>
              </CardListItem>
            );
          })}
        {wrapped.responded_to_view.top_replies.length === 0 && (
          <CardListItem isBig={isBig}>not enough data</CardListItem>
        )}
      </Card>
    ),
    ({
      isBig,
      isVisible,
      ...cardProps
    }: {
      isBig: boolean;
      isVisible: boolean;
    } & any) => {
      return (
        <Card
          {...cardProps}
          colSpan={4}
          maxH="100vh"
          id="casted_images_view"
          key="casted_images_view"
        >
          <CardHeading isBig={isBig}>
            Images shared{" "}
            <SubtleText isBig={isBig}>
              {wrapped.casted_images_view.data.length}
            </SubtleText>
          </CardHeading>
          <div style={{ marginTop: "5px", overflow: "scroll" }}>
            {isBig ? (
              <Box display="flex" flexWrap="wrap">
                {(isSmall
                  ? [wrapped.casted_images_view.data]
                  : [
                      wrapped.casted_images_view.data.slice(
                        0,
                        Math.floor(wrapped.casted_images_view.data.length / 4)
                      ),
                      wrapped.casted_images_view.data.slice(
                        Math.floor(wrapped.casted_images_view.data.length / 4),
                        Math.floor(
                          (2 * wrapped.casted_images_view.data.length) / 4
                        )
                      ),
                      wrapped.casted_images_view.data.slice(
                        Math.floor(
                          (2 * wrapped.casted_images_view.data.length) / 4
                        ),
                        Math.floor(
                          (3 * wrapped.casted_images_view.data.length) / 4
                        )
                      ),
                      wrapped.casted_images_view.data.slice(
                        Math.floor(
                          (3 * wrapped.casted_images_view.data.length) / 4
                        ),
                        wrapped.casted_images_view.data.length
                      ),
                    ]
                ).map((chunk, i) => {
                  return (
                    <Box
                      flex={isSmall ? "100%" : "25%"}
                      maxWidth={isSmall ? "100%" : "25%"}
                      paddingX={1}
                      key={i}
                    >
                      {chunk.map(({ url, hash }) => {
                        return (
                          <Text
                            key={`${url}${hash}`}
                            as={motion.div}
                            display="inline-block"
                            verticalAlign="top"
                            alignItems="center"
                          >
                            <a
                              target="_blank"
                              style={{ display: "flex" }}
                              rel="noopener noreferrer"
                              href={`https://www.discove.xyz/casts/${hash}`}
                            >
                              <Image
                                proxySupportInOrder={[
                                  "cloudflare",
                                  "next-img-proxy",
                                ]}
                                priority={false}
                                alt={url}
                                type={"cast"}
                                style={{
                                  display: "inline-block",
                                  // marginRight: '5px',
                                  borderRadius: "5px",
                                  marginBottom: "8px",
                                  minWidth: "100%",
                                  width: "100%",
                                  height: "auto",
                                }}
                                src={url}
                                width={700}
                                height={500}
                              />
                            </a>
                          </Text>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            ) : (
              wrapped.casted_images_view.data
                .slice(0, 18)
                .map(({ url, hash }) => {
                  return (
                    <Box
                      position="relative"
                      display="inline-block"
                      key={`${hash}${url}`}
                    >
                      <Text
                        as={motion.div}
                        display="inline-block"
                        verticalAlign="top"
                        alignItems="center"
                        _before={{
                          content: '""',
                          display: "block",
                          position: "absolute",
                          top: 0,
                          // bottom: 0,
                          // left: 0,
                          width: "48px",
                          borderRadius: 5,
                          height: "48px",
                          // right: 0,
                          opacity: 0.4,
                          background: "purple.500",
                          // transition: 'background .3s linear',
                        }}
                      >
                        <a
                          target="_blank"
                          style={{ display: "flex" }}
                          rel="noopener noreferrer"
                          href={`https://www.discove.xyz/casts/${hash}`}
                        >
                          <Image
                            proxySupportInOrder={[
                              "cloudflare",
                              "next-img-proxy",
                            ]}
                            priority={false}
                            alt={url}
                            type={"profile"}
                            style={{
                              display: "inline-block",
                              marginRight: "5px",
                              marginBottom: "5px",
                              borderRadius: "5px",
                              border:
                                "3px solid var(--chakra-colors-purple-900)",
                              width: "48px",
                              height: "48px",
                            }}
                            src={url}
                            width={48}
                            height={48}
                          />
                        </a>
                      </Text>
                    </Box>
                  );
                })
            )}
          </div>
        </Card>
      );
    },
  ];

  // Programmatically attach properties to cards:
  // - key
  // - classname
  // - animate in on click stuff
  // - back/forward/skip to end buttons on hover
  // Animation should on clicks:
  // 1. bring new card onto the screen, fullscreen
  // 2. shrink it onto the page
  // 3. next

  // by index: group some steps together
  // const stepsGrouping = [[]]
  // const skipIndexes = [9, 12, 13, 14]
  const increment = () => {
    if (currentStep === 8) setCurrentStep(10);
    else if (currentStep === 11) setCurrentStep(15);
    else setCurrentStep(currentStep + 1);
  };
  const decrement = () => {
    if (currentStep === 10) setCurrentStep(8);
    else if (currentStep === 15) setCurrentStep(11);
    else setCurrentStep(currentStep - 1);
  };
  const totalsteps = cards.length + 1;
  const finished = totalsteps === currentStep;
  const combinedSteps = [
    (arg: any) => <>{page1.map((x) => x(arg))}</>,
    ...cards,
  ];
  const CurrentStepComp = combinedSteps[currentStep];
  const CurrentFocusedCards = focusedCard !== null ? cards[focusedCard] : NoOp;

  // useEffect(() => {
  //   if (currentStep < totalsteps) {
  //     if (currentStep % 2 === 0)
  //       animate('', { width: '100vh', height: '100vh' }, { duration: 0.5 })
  //     else animate('', { width: '100vh', height: '100vh' }, { duration: 0.5 })
  //   }
  // }, [currentStep])

  const controls = (
    <>
      {focusedCard === null ? (
        <Box
          gap={2}
          display={finished ? "none" : "flex"}
          justifyContent="center"
          as={Motion}
          position="fixed"
          top={["calc(50vh - 35px)", "calc(50vh - 40px)", "calc(50vh - 50px)"]}
          left="0px"
        >
          <Button
            boxShadow="0 2px 4px #1e1736, 0 8px 16px #1e1736"
            background="purple.700"
            border="1px solid var(--chakra-colors-purple-500)"
            color="purple.50"
            _hover={{ background: "purple.800" }}
            _active={{ background: "purple.800" }}
            paddingX={4}
            paddingY={2}
            zIndex={9999}
            width={["70px", "80px", "100px"]}
            height={["70px", "80px", "100px"]}
            borderRadius={100}
            fontSize={["20px", "20px", "40px"]}
            hidden={currentStep === 0}
            onClick={decrement}
          >
            <Icon as={TbChevronLeft} fontSize={["20px", "30px", "40px"]} />
          </Button>
        </Box>
      ) : null}
      {focusedCard === null && (
        <Box
          gap={2}
          display={finished ? "none" : "flex"}
          justifyContent="center"
          as={Motion}
          position="fixed"
          top={["calc(50vh - 35px)", "calc(50vh - 40px)", "calc(50vh - 70px)"]}
          right="0px"
        >
          <Button
            boxShadow="0 2px 4px #1e1736, 0 8px 16px #1e1736"
            background="purple.700"
            border="1px solid var(--chakra-colors-purple-500)"
            color="purple.50"
            _hover={{ background: "purple.800" }}
            _active={{ background: "purple.800" }}
            paddingX={4}
            zIndex={9999}
            paddingY={2}
            width={["70px", "80px", "100px"]}
            height={["70px", "80px", "100px"]}
            borderRadius={100}
            fontSize={["20px", "20px", "40px"]}
            hidden={currentStep === totalsteps}
            onClick={increment}
          >
            <Icon as={TbChevronRight} fontSize={["20px", "30px", "40px"]} />
          </Button>
        </Box>
      )}
    </>
  );

  const currentlyRenderedCards =
    focusedCard !== null ? (
      <CurrentFocusedCards
        makeBig={true}
        isFocused={true}
        onClose={() => setFocusedCard(null)}
        isBig={true}
        margin={6}
        rowSpan={4}
        isVisible={true}
        i={currentStep}
      />
    ) : finished ? (
      cards.map((Square, i) => {
        return (
          <Square
            key={i}
            makeBig={false}
            isBig={false}
            isVisible={i < currentStep ? true : false}
            i={i}
            onClick={(e: any) => {
              e.preventDefault();
              setFocusedCard(i);
            }}
          />
        ) as any;
      })
    ) : (
      ((
        <CurrentStepComp
          makeBig={true}
          isBig={true}
          key={currentStep}
          // {...(currentStep !== 0 &&
          //   {
          //     // position: 'absolute',
          //     // top: '0',
          //     // width: 'calc(100vw - 100px)',
          //   })}
          initial={{ x: isSmall ? 60 : 600 }}
          animate={{ x: 0 }}
          exit={{ x: isSmall ? -60 : -600 }}
          durationT={1}
          marginY={currentStep === 0 ? 2 : 2}
          marginX={currentStep === 0 ? 2 : 4}
          rowSpan={currentStep === 0 ? 2 : 4}
          paddingX={6}
          colSpan={currentStep === 0 ? 1 : undefined}
          isVisible={true}
          i={currentStep}
        />
      ) as any)
    );

  return (
    <AnimateSharedLayout>
      <Box
        zIndex={999}
        position="absolute"
        top="0"
        width="100vw"
        minHeight="100vh"
        left="0"
        bgGradient="linear(to-b, purple.900, #1e1736)"
      >
        {controls}
        {(currentStep !== totalsteps && currentStep !== 0) || focusedCard ? (
          <Box
            minH="100vh"
            h={["auto", "auto", "auto", "auto", "100vh"]}
            padding={isSmall ? 2 : 4}
            display="flex"
            flexDirection="row"
            justifyContent={"center"}
            alignItems="center"
            maxH="100vh"
            marginX="auto"
            verticalAlign="middle"
            w={isSmall ? "calc(100vw - 30px)" : "calc(100vw - 100px)"}
          >
            <AnimatePresence mode="wait">
              {currentlyRenderedCards}
            </AnimatePresence>
            <Box
              position="absolute"
              bottom="10px"
              textAlign="center"
              opacity={0.4}
              zIndex={-1}
            >
              <WrappedText
                lineHeight={1.2}
                fontSize="2xl"
                bgGradient="linear(to-b, purple.50, purple.600)"
              >
                <div>Farcaster</div>
                <div>Wrapped</div>
                <div>2022</div>
              </WrappedText>
            </Box>
          </Box>
        ) : (
          <Grid
            minH="100vh"
            h={["auto", "auto", "auto", "auto", "100vh"]}
            padding={4}
            autoRows="auto"
            autoFlow="dense"
            autoColumns="auto"
            w="100vw"
            templateRows={[
              "repeat(6, 1)",
              "repeat(4, 1)",
              "repeat(4, 1)",
              "repeat(4, 1)",
              "repeat(4, minmax(0, 1fr))",
              "repeat(4, minmax(0, 1fr))",
            ]}
            templateColumns={
              currentStep === totalsteps && focusedCard === null
                ? [
                    "repeat(1, minmax(0, 1fr))",
                    "repeat(4, minmax(0, 1fr))",
                    "repeat(6, minmax(0, 1fr))",
                    "repeat(6, minmax(0, 1fr))",
                    "repeat(10, minmax(0, 1fr))",
                  ]
                : currentStep === 0
                ? [
                    "repeat(1, auto)",
                    "repeat(1, auto)",
                    "repeat(3, auto)",
                    "repeat(4, auto)",
                    "repeat(4, auto)",
                  ]
                : ["repeat(1, auto)"]
            }
            gridAutoRows="auto"
            gap={4}
          >
            <AnimatePresence>{currentlyRenderedCards}</AnimatePresence>
          </Grid>
        )}
      </Box>
    </AnimateSharedLayout>
  );
}

const Motion = (props: any) => {
  return (
    <motion.div
      // style={{ alignItems: 'center'}}

      // layout="position"
      transition={{
        repeat: props.transitionRepeat || 0,
        delay: props.delay || 0,
        duration: props.durationT || 0.3,
        scale: { duration: props.durationT || 0.1 },
      }}
      {...props}
    />
  );
};

function Card(
  props: GridItemProps & {
    noDiscove?: boolean;
    id: string;
    makeBig?: boolean;
    i: number;
    isFocused?: boolean;
    onClose?: Function;
    onClick: Function;
  }
) {
  return (
    <GridItem
      layoutId={`item-${props.id}` as string}
      as={Motion}
      whileHover={props.makeBig ? {} : { scale: 1.05 }}
      wordBreak="break-word"
      height="auto"
      width="auto"
      maxH="100vh"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      alignItems="start"
      boxShadow="0 2px 4px #1e1736, 0 8px 16px #1e1736"
      background="purple.700"
      cursor={props.makeBig ? "default" : "pointer"}
      border="1px solid var(--chakra-colors-purple-500)"
      color="purple.50"
      paddingX={4}
      paddingY={2}
      borderRadius={5}
      fontSize="20px"
      {...props}
    >
      {props.isFocused && (
        <Box position="absolute">
          <Box
            gap={2}
            // display={'flex'}
            justifyContent="center"
            as={Motion}
            zIndex={99999}
            position="relative"
            top="-45px"
            left="-45px"
          >
            <Button
              boxShadow="0 2px 4px #1e1736, 0 8px 16px #1e1736"
              background="purple.700"
              border="1px solid var(--chakra-colors-purple-500)"
              _hover={{ background: "purple.800" }}
              _active={{ background: "purple.800" }}
              color="purple.50"
              paddingX={4}
              paddingY={2}
              width="50px"
              height="50px"
              borderRadius={100}
              fontSize="20px"
              onClick={() => props.onClose?.(null)}
            >
              <Icon as={TbX} fontSize="30px" />
            </Button>
          </Box>
        </Box>
      )}
      {props.children}
      {!props.noDiscove ? (
        <Text
          color="purple.600"
          display="block"
          marginTop="auto"
          fontSize={props.makeBig ? "3xl" : ["md", "md", "md", "lg", "xl"]}
        >
          discove
        </Text>
      ) : null}
    </GridItem>
  );
}

function CardHeading(props: { isBig?: boolean; children?: any } & any) {
  return (
    <Text
      color="purple.100"
      textShadow="0 2px 2px var(--chakra-colors-purple-800)"
      fontSize={props.isBig ? "3xl" : ["md", "md", "md", "lg", "lg"]}
      fontWeight="extrabold"
      {...props}
    >
      {props.children}
    </Text>
  );
}

function SubtleText(props: any) {
  return (
    <Text
      fontSize={props.isBig ? "3xl" : ["md", "md", "md", "lg", "lg"]}
      // textShadow="0 1px 1px var(--chakra-colors-purple-200)"
      textShadow="none"
      color="purple.500"
      opacity={0.6}
      paddingLeft="5px"
      display="inline"
      fontWeight="extrabold"
      {...props}
    >
      {props.children}
    </Text>
  );
}

function WrappedText(props: any) {
  return (
    <Text
      bgGradient="linear(to-b, purple.50, purple.300)"
      bgClip="text"
      fontSize={["2xl", "2xl", "2xl", "3xl", "4xl"]}
      fontWeight="extrabold"
      {...props}
    >
      {props.children}
    </Text>
  );
}

function CardBigNr(props: any) {
  return (
    <Text
      textShadow="0 1px 1px var(--chakra-colors-purple-600)"
      color="#281f47"
      fontWeight="extrabold"
      fontSize={props.isBig ? "6xl" : ["2xl", "2xl", "2xl", "2xl", "2xl"]}
      {...props}
    >
      {props.children}
    </Text>
  );
}

function CardListItem(props: any) {
  return (
    <Text
      fontSize={props.isBig ? "3xl" : ["sm", "md", "md", "md", "lg"]}
      textShadow="0 1px 1px var(--chakra-colors-purple-600)"
      // color="#1e1736"
      color="#281f47"
      fontWeight="extrabold"
      display="flex"
      justifyContent="center"
      {...props}
    >
      {props.children}
    </Text>
  );
}

function smoothenedSVGPathD(points: Array<[number, number]>) {
  // The smoothing ratio
  const smoothing = 0.2;

  // Properties of a line
  // I:  - pointA (array) [x,y]: coordinates
  //     - pointB (array) [x,y]: coordinates
  // O:  - (object) { length: l, angle: a }: properties of the line
  const line = (pointA: any, pointB: any) => {
    const lengthX = pointB[0] - pointA[0];
    const lengthY = pointB[1] - pointA[1];
    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX),
    };
  };

  // Position of a control point
  // I:  - current (array) [x, y]: current point coordinates
  //     - previous (array) [x, y]: previous point coordinates
  //     - next (array) [x, y]: next point coordinates
  //     - reverse (boolean, optional): sets the direction
  // O:  - (array) [x,y]: a tuple of coordinates
  const controlPoint = (
    current: any,
    previous: any,
    next: any,
    reverse?: any
  ) => {
    // When 'current' is the first or last point of the array
    // 'previous' or 'next' don't exist.
    // Replace with 'current'
    const p = previous || current;
    const n = next || current;

    // Properties of the opposed-line
    const o = line(p, n);

    // If is end-control-point, add PI to the angle to go backward
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;

    // The control point position is relative to the current point
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
  };

  // Create the bezier curve command
  // I:  - point (array) [x,y]: current point coordinates
  //     - i (integer): index of 'point' in the array 'a'
  //     - a (array): complete array of points coordinates
  // O:  - (string) 'C x2,y2 x1,y1 x,y': SVG cubic bezier C command
  const bezierCommand = (point: any, i: any, a: any) => {
    // start control point
    const cps = controlPoint(a[i - 1], a[i - 2], point);

    // end control point
    const cpe = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
  };

  // Render the svg <path> element
  // I:  - points (array): points coordinates
  //     - command (function)
  //       I:  - point (array) [x,y]: current point coordinates
  //           - i (integer): index of 'point' in the array 'a'
  //           - a (array): complete array of points coordinates
  //       O:  - (string) a svg path command
  // O:  - (string): a Svg <path> element
  const svgPath = (points: any, command: any) => {
    // build the d attributes by looping over the points
    const d = points.reduce(
      (acc: any, point: any, i: any, a: any) =>
        i === 0
          ? `M ${point[0]},${point[1]}`
          : `${acc} ${command(point, i, a)}`,
      ""
    );
    return d;
  };

  return svgPath(points, bezierCommand);
}

function getPersonaConfig(wrapped: Wrapped2022[number]) {
  const persona = wrapped.persona;
  // const personaCount = wrapped.personas_view[persona][1]
  // const personaPercentage = Number(
  //   wrapped.personas_view[persona][0]
  // ).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 0 })
  const personaPercentageRange = wrapped.persona_percentage;
  const personaConfigs = {
    // Curious cat with question mark box hat
    questioncaster: {
      title: `The Curious Caster`,
      image: `14`,
      headline: `top ${personaPercentageRange} of casters asking questions`,
      description: `The Curious Caster is always asking questions and seeking answers to broaden their understanding of the world around them. Or maybe they just want to show up in the highlights tab, we can't know for sure.`,
    },
    // Owl with explorer hat
    lurkcaster: {
      title: `The Explorer`,
      image: `8`,
      headline: `top ${personaPercentageRange} of casters mostly liking casts`,
      description: `The Explorer prefers to browse and read rather than actively participating in discussions. Or maybe they just want to make sure every cast is liked, we can't know for sure.`,
    },
    // Ghost wearing a mask
    ghostcaster: {
      title: `The Ghost`,
      image: `15`,
      headline: `top ${personaPercentageRange} of casters browsing only`,
      description: `The Ghost doesn't spend a lot of time on farcaster and only posts occasionally.`,
    },
    // Dog with a camera
    gramcaster: {
      title: `The Photographer`,
      image: `13`,
      headline: `top ${personaPercentageRange} of casters posting images`,

      description: `The Photographer is never without an image to share with the community.`,
    },
    // Ape with books
    replyguy: {
      title: `The Replier`,
      image: `1`,
      headline: `top ${personaPercentageRange} of casters replying to casts`,

      description: `The Replier is always quick to jump in and offer their two cents on any and all discussions on farcaster.`,
    },
    // Parrot with tie
    shillcaster: {
      title: `The Builder`,
      image: `2`,
      headline: `top ${personaPercentageRange} of casters talking about their product`,
      description: `The Builder is always talking about the product they're working on.`,
    },
    // Cat sewing with thread
    threadcastor: {
      title: `The Novelist`,
      image: `12`,
      headline: `top ${personaPercentageRange} of thread writers`,
      description: `The Novelist writes threads of epic in length, filled with detailed thoughts, opinions, and experiences.`,
    },
    // Robot with a tray of books
    botcaster: {
      title: `The Bot`,
      image: `4`,
      headline: `top ${personaPercentageRange} of casters acting like a bot`,
      description: `The Bot isn't exactly human, tirelessly churning out responses on farcaster.`,
    },
    // Bear with a white ball
    castaway: {
      title: `The Fearless`,
      image: `7`,
      headline: `top ${personaPercentageRange} of casters`,
      description: `The Fearless cast whatever they want`,
    },
    // Bull with a mining axe
    cryptocaster: {
      title: `The Rabbit Hole Explorer`,
      image: `5`,
      headline: `top ${personaPercentageRange} of casters talking about crypto`,
      description: `The Rabbit Hole Explorer talks a lot about crypto.`,
    },
    // Bird
    birdappcaster: {
      title: `The Bird App Excavator`,
      image: `3`,
      headline: `top ${personaPercentageRange} of casters sharing tweets`,
      description: `The Bird App Excavator loves sharing the latest tweets with the rest of the community.`,
    },
  };

  return personaConfigs[persona];
}
function RenderPersona(props: {
  wrapped: Wrapped2022[number];
  isBig?: boolean;
}) {
  const config = getPersonaConfig(props.wrapped);

  return (
    <Stack
      margin={props.isBig ? "auto auto" : undefined}
      direction={props.isBig ? "column" : "row"}
      textAlign={props.isBig ? "center" : undefined}
    >
      {/* <CardHeading isBig={props.isBig}>Persona</CardHeading> */}
      <Image
        proxySupportInOrder={["cloudflare", "next-img-proxy"]}
        priority={false}
        alt={"persona"}
        type="profile"
        style={{
          display: "inline-block",
          marginRight: "5px",
          borderRadius: "5px",
          border: "1px solid var(--chakra-colors-purple-500)",
          // width: props.isBig ? '400px' : '250px',
          width: props.isBig ? "300px" : "120px",
          height: props.isBig ? "300px" : "120px",
          ...(props.isBig
            ? { marginLeft: "auto", marginRight: "auto", marginTop: "20px" }
            : {}),
        }}
        src={`${URL}/wrapped2022-images/${config.image}.png`}
        width={300}
        height={300}
      />
      <Box>
        <CardHeading isBig={props.isBig}>Persona: {config.title}</CardHeading>
        <CardHeading isBig={props.isBig} fontSize="lg" opacity={0.6}>
          {config.headline}
        </CardHeading>
        <CardListItem
          maxWidth="400px"
          marginX="auto"
          isBig={props.isBig}
          fontSize={props.isBig ? "1xl" : "sm"}
        >
          {config.description}
        </CardListItem>
      </Box>
    </Stack>
  );
}
