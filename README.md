

# GET /api/v1/search

## Links:

https://docs.invidious.io/Invidious-Instances.md

## Parameters:


https://yewtu.be/api/v1/search?q=awesome (429 too many requests)
https://invidious.snopyta.org/api/v1/search?q=awesome

q: String
page: Int32
sort_by: "relevance", "rating", "upload_date", "view_count"
date: "hour", "today", "week", "month", "year"
duration: "short", "long"
type: "video", "playlist", "channel", "all", (default: video)
features: "hd", "subtitles", "creative_commons", "3d", "live", "purchased", "4k", "360", "location", "hdr" (comma separated: e.g. "&features=hd,subtitles,3d,live")
region: ISO 3166 country code (default: "US")

## Schema

[
  {
    type: "video",
    title: String,
    videoId: String,
    author: String,
    authorId: String,
    authorUrl: String,
    videoThumbnails: [
      {
        quality: String,
        url: String,
        width: Int32,
        height: Int32
      }
    ],
    description: String,
    descriptionHtml: String,
    viewCount: Int64,
    published: Int64,
    publishedText: String,
    lengthSeconds: Int32,
    liveNow: Bool,
    paid: Bool,
    premium: Bool
  },
  {
    type: "playlist",
    title: String,
    playlistId: String,
    author: String,
    authorId: String,
    authorUrl: String,

    videoCount: Int32,
    videos: [
      {
        title: String,
        videoId: String,
        lengthSeconds: Int32,
        videoThumbnails: [
          {
            quality: String,
            url: String,
            width: Int32,
            height: Int32
          }
        ]
      }
    ]
  },
  {
    type: "channel",
    author: String,
    authorId: String,
    authorUrl: String,

    authorThumbnails: [
      {
        url: String,
        width: Int32,
        height: Int32
      }
    ],
    subCount: Int32,
    videoCount: Int32,
    description: String,
    descriptionHtml: String
  }
];
