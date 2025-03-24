import fetch from 'node-fetch';
import crypto from 'crypto';

const apiKey = process.env.PODCAST_INDEX_API_KEY;
const apiSecret = process.env.PODCAST_INDEX_API_SECRET;

export async function searchPodcasts(query) {
  const apiHeaderTime = Math.floor(Date.now() / 1000);
  const hash = crypto
    .createHash('sha1')
    .update(apiKey + apiSecret + apiHeaderTime)
    .digest('hex');

  const response = await fetch(
    `https://api.podcastindex.org/api/1.0/search/byterm?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'User-Agent': 'PodcastApp/1.0',
        'X-Auth-Key': apiKey,
        'X-Auth-Date': apiHeaderTime,
        'Authorization': hash,
      },
    }
  );

  const data = await response.json();
  return data.feeds;
}

export async function getPodcastEpisodes(podcastId) {
  const apiHeaderTime = Math.floor(Date.now() / 1000);
  const hash = crypto
    .createHash('sha1')
    .update(apiKey + apiSecret + apiHeaderTime)
    .digest('hex');

  const response = await fetch(
    `https://api.podcastindex.org/api/1.0/episodes/byfeedid?id=${podcastId}`,
    {
      headers: {
        'User-Agent': 'PodcastApp/1.0',
        'X-Auth-Key': apiKey,
        'X-Auth-Date': apiHeaderTime,
        'Authorization': hash,
      },
    }
  );

  const data = await response.json();
  return data.items;
} 