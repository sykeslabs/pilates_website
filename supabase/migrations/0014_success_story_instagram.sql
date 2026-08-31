-- Optional Instagram post/reel URL per success story. When set, the story
-- card embeds the Instagram post via their official embed.js script instead
-- of showing the text quote.

alter table public.success_stories add column instagram_url text;
