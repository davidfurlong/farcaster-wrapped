import { FCCast, FeedItem, FCProfile, TextItem } from "./types";

function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop);
}

export function isCast(item: FeedItem): item is FCCast {
  return item && item.hasOwnProperty("hash");
}

export function isProfile(item: FeedItem): item is FCProfile {
  return item && item.hasOwnProperty("fid");
}

export function isTextItem(item: FeedItem): item is TextItem {
  return (
    item &&
    hasOwnProperty(item, "discove_item_type") &&
    item.discove_item_type === "text"
  );
}
