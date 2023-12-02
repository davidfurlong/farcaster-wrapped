# Farcaster wrapped 2022 code

I'm open sourcing this in 2023 under the MIT license in case it helps someone build a Farcaster wrapped for 2023.

This is deployed including 2022's data at [https://farcaster-wrapped.vercel.app/](https://farcaster-wrapped.vercel.app/)

It works by running a script (based on @gregskril's farcaster-indexer) that generates a json file per user and then a next.js app that renders an animated experience.
The script to generate it is a bit outdated and requires a specific database schema.

Example

<img width="1475" alt="Screenshot 2023-12-02 at 23 16 59" src="https://github.com/davidfurlong/farcaster-wrapped/assets/614768/d2eb815f-cfbf-4d68-ac12-ec8312049d5c">
