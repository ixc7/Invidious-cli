# Invidious Documentation: API

---

# Table of contents

• Language
• Pretty
• Fields
    □ GET /api/v1/stats
    □ GET /api/v1/videos/:id
    □ GET /api/v1/annotations/:id
    □ GET /api/v1/comments/:id
    □ GET /api/v1/captions/:id
    □ GET /api/v1/trending
    □ GET /api/v1/popular
    □ GET /api/v1/channels/:ucid
    □ GET /api/v1/channels/:ucid/videos, /api/v1/channels/videos/:ucid
    □ GET /api/v1/channels/:ucid/latest, /api/v1/channels/latest/:ucid
    □ GET /api/v1/channels/playlists/:ucid, /api/v1/channels/:ucid/playlists
    □ GET /api/v1/channels/comments/:ucid, /api/v1/channels/:ucid/comments
    □ GET /api/v1/channels/search/:ucid
    □ GET /api/v1/search/suggestions
    □ GET /api/v1/search
    □ GET /api/v1/playlists/:plid
    □ GET /api/v1/mixes/:rdid

---

# Language

All endpoints that return a JSON body support &hl=LANGUAGE for translating
fields into the desired language. A list of languages are provided in List of
URL parameters.

---

# Pretty

All endpoints that return a JSON body support &pretty=1 for printing the
response as formatted JSON.

---

# Fields

All endpoints that return a JSON body support the fields API for specifying
desired fields to reduce bandwidth consumption. This can be used by adding &
fields=FIELDS with the desired fields, for example /api/v1/videos/aqz-KE-bpKQ?
fields=videoId,title,description&pretty=1.



## GET /api/v1/stats

*Schema*

```js
{
  version: String,
  software: {
    name: "invidious",
    version: String,
    branch: String
  },
  openRegistrations: Bool,
  usage: {
    users: {
      total: Int32,
      activeHalfyear: Int32,
      activeMonth: Int32
    }
  },
  metadata: {
    updatedAt: Int64,
    lastChannelRefreshedAt: Int64
  }
}
```



## GET /api/v1/videos/:id

*Schema*

```js
{
  title: String,
  videoId: String,
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
  published: Int64,
  publishedText: String,

  keywords: Array(String),
  viewCount: Int64,
  likeCount: Int32,
  dislikeCount: Int32,

  paid: Bool,
  premium: Bool,
  isFamilyFriendly: Bool,
  allowedRegions: Array(String),
  genre: String,
  genreUrl: String,

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

  subCountText: String,
  lengthSeconds: Int32,
  allowRatings: Bool,
  rating: Float32,
  isListed: Bool,
  liveNow: Bool,
  isUpcoming: Bool,
  premiereTimestamp: Int64?,

  hlsUrl: String?,
  adaptiveFormats: [
    {
      index: String,
      bitrate: String,
      init: String,
      url: String,
      itag: String,
      type: String,
      clen: String,
      lmt: String,
      projectionType: Int32,
      container: String,
      encoding: String,
      qualityLabel: String?,
      resolution: String?
    }
  ],
  formatStreams: [
    {
      url: String,
      itag: String,
      type: String,
      quality: String,
      container: String,
      encoding: String,
      qualityLabel: String,
      resolution: String,
      size: String
    }
  ],
  captions: [
    {
      label: String,
      languageCode: String,
      url: String
    }
  ],
  recommendedVideos: [
    {
      videoId: String,
      title: String,
      videoThumbnails: [
        {
          quality: String,
          url: String,
          width: Int32,
          height: Int32
        }
      ],
      author: String,
      lengthSeconds: Int32,
      viewCountText: String
    }
  ]
}
```

**Parameters**

| field  | value                                 |
|--------|---------------------------------------|
| region | ISO 3166 country code (default: "US") |



## GET /api/v1/annotations/:id

**Parameters**

| field  | value                                     |
|--------|-------------------------------------------|
| source | "archive", "youtube" (default: "archive") |

Returns annotation XML from YouTube's /annotations_invideo endpoint.
Alternatively it provides access to legacy annotation data using this
collection on archive.org.



## GET /api/v1/comments/:id

*Schema*

```js
{
  commentCount: Int32?,
  videoId: String,
  comments: [
    {
      author: String,
      authorThumbnails: [
        {
          url: String,
          width: Int32,
          height: Int32
        }
      ],
      authorId: String,
      authorUrl: String,
      isEdited: Bool,
      content: String,
      contentHtml: String,
      published: Int64,
      publishedText: String,
      likeCount: Int32,
      commentId: String,
      authorIsChannelOwner: Bool,
      creatorHeart: {
        creatorThumbnail: String,
        creatorName: String
      }?,
      replies: {
        replyCount: Int32,
        continuation: String
      }?
    }
  ],
  continuation: String?
}
```

**Parameters**

| field        | value                                  |
|--------------|----------------------------------------|
| sort_by      | "top", "new" (default: top)            |
| source       | "youtube", "reddit" (default: youtube) |
| continuation | String                                 |



## GET /api/v1/captions/:id

*Schema*

```js
{
  captions: [
    {
      label: String,
      languageCode: String,
      url: String
    }
  ]
}
```

**Parameters**

| field  | value                                 |
|--------|---------------------------------------|
| label  | String                                |
| lang   | String                                |
| tlang  | String                                |
| region | ISO 3166 country code (default: "US") |

A request with label will return the selected captions in WebVTT format.
Captions can also be selected with an ISO lang, e.g. &lang=en, tlang will
auto-translate from English into the requested language (if English captions
are available).



## GET /api/v1/trending

*Schema*

```js
[
  {
    title: String,
    videoId: String,
    videoThumbnails: [
      {
        quality: String,
        url: String,
        width: Int32,
        height: Int32
      }
    ],

    lengthSeconds: Int32,
    viewCount: Int64,

    author: String,
    authorId: String,
    authorUrl: String,

    published: Int64,
    publishedText: String,
    description: String,
    descriptionHtml: String,

    liveNow: Bool,
    paid: Bool,
    premium: Bool
  }
]
```

**Parameters**

| field  | value                                 |
|--------|---------------------------------------|
| type   | "music", "gaming", "news", "movies"   |
| region | ISO 3166 country code (default: "US") |



## GET /api/v1/popular

*Schema*

```js
[
    {
        type: "shortVideo",
        title: String,
        videoId: String,
        videoThumbnails: [
            {
            quality: String,
            url: String,
            width: Int32,
            height: Int32
            }
        ],

        lengthSeconds: Int32,
        viewCount: Int64,

        author: String,
        authorId: String,
        authorUrl: String,

        published: Int64,
        publishedText: String
    }
]
```



## GET /api/v1/channels/:ucid

*Schema*

```js
{
  author: String,
  authorId: String,
  authorUrl: String,
  authorBanners: [
    {
      url: String,
      width: Int32,
      height: Int32
    }
  ],
  authorThumbnails: [
    {
      url: String,
      width: Int32,
      height: Int32
    }
  ],

  subCount: Int32,
  totalViews: Int64,
  joined: Int64,

  paid: Bool,
  autoGenerated: Bool,
  isFamilyFriendly: Bool,
  description: String,
  descriptionHtml: String,
  allowedRegions: Array(String),

  latestVideos: [
    {
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
      paid: Bool,
      premium: Bool
    }
  ],
  relatedChannels: [
    {
      author: String,
      authorId: String,
      authorUrl: String,
      authorThumbnails: [
        {
          url: String,
          width: Int32,
          height: Int32
        }
      ]
    }
  ]
}
```

**Parameters**

| field   | value                                           |
|---------|-------------------------------------------------|
| sort_by | "newest", "oldest", "popular" (default: newest) |

Note that a channel's username (if it doesn't include spaces) is also valid in
place of ucid, e.g. /api/v1/channels/BlenderFoundation.



## GET /api/v1/channels/:ucid/videos, /api/v1/channels/videos/:ucid

*Schema*

```js
[
  {
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
    lengthSeconds: Int32
    paid: Bool,
    premium: Bool
  }
]
```

**Parameters**

| field   | value                                           |
|---------|-------------------------------------------------|
| page    | Int32                                           |
| sort_by | "newest", "oldest", "popular" (default: newest) |



## GET /api/v1/channels/:ucid/latest, /api/v1/channels/latest/:ucid

```js
[
  {
    title: String,
    videoId: String,
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
    lengthSeconds: Int32
    paid: Bool,
    premium: Bool
  }
]
```



## GET /api/v1/channels/playlists/:ucid, /api/v1/channels/:ucid/playlists

```js
{
  playlists: [
    {
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
  ],
  continuation: String?
}
```

**Parameters**

| field        | value                      |
|--------------|----------------------------|
| continuation | String                     |
| sort_by      | "oldest", "newest", "last" |



## GET /api/v1/channels/comments/:ucid, /api/v1/channels/:ucid/comments

```js
{
  authorId: String,
  comments: [
    {
      author: String,
      authorThumbnails: [
        url: String,
        width: Int32,
        height: Int32
      ],
      authorId: String,
      authorUrl: String,
      isEdited: Bool,
      content: String,
      contentHtml: String,
      published: Int64,
      publishedText: String,
      likeCount: Int32,
      commentId: String,
      authorIsChannelOwner: Bool,
      creatorHeart: {
        creatorThumbnail: String,
        creatorName: String
      }?,
      replies: {
        replyCount: Int32,
        continuation: String
      }?,
      attachment: Attachment?
    }
  ],
  continuation: String?
}
```

The authorId for top-level comments will always(?) be the same as the requested
channel. Top-level comments will also have an optional attachment, which can be
one of:

```
{
    type: "image",
    imageThumbnails: [
        {
            url: String,
            width: Int32,
            height: Int32
        }
    ]
}

{
    type: "video",
    title: String,
    videoId: String,
    videoThumbnails: [
        {
            quality: String,
            url: String,
            width: Int32,
            height: Int32
        }
    ],
    lengthSeconds: Int32,
    author: String,
    authorId: String,
    authorUrl: String,
    published: Int64,
    publishedText: String,
    viewCount: Int64,
    viewCountText: String
}

{
    type: "unknown",
    error: "Unrecognized attachment type."
}
```

Some attachments may only have a type and error, similar to the above.
Attachments will only be present on top-level comments.

**Parameters**

| field        | value  |
|--------------|--------|
| continuation | String |



## GET /api/v1/channels/search/:ucid

*Schema*

```js
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
```

**Parameters**

| field | value  |
|-------|--------|
| q     | String |
| page  | Int32  |



## GET /api/v1/search/suggestions

*Schema*

```js
{
    query: String,
    suggestions: Array(String)
}
```

**Parameters**

| field | value  |
|-------|--------|
| q     | String |



## GET /api/v1/search

*Schema*

```js
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
```

**Parameters**

| field    | value                                                   |
|----------|---------------------------------------------------------|
| q        | String                                                  |
| page     | Int32                                                   |
| sort_by  | "relevance", "rating", "upload_date", "view_count"      |
| date     | "hour", "today", "week", "month", "year"                |
| duration | "short", "long"                                         |
| type     | "video", "playlist", "channel", "all", (default: video) |
| features | "hd", "subtitles", "creative_commons", "3d", "live", "purchased", "4k", "360", "location", "hdr" (comma separated: e.g. "&features=hd,subtitles,3d,live") |
| region   | ISO 3166 country code (default: "US")                   |



## GET /api/v1/playlists/:plid

*Schema*

```js
{
    title: String,
    playlistId: String,

    author: String,
    authorId: String,
    authorThumbnails: [
        {
            url: String,
            width: String,
            height: String
        }
    ],
    description: String,
    descriptionHtml: String,

    videoCount: Int32,
    viewCount: Int64,
    updated: Int64,

    videos: [
        {
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
          index: Int32,
          lengthSeconds: Int32
        }
    ]
}
```

**Parameters**

| field | value |
|-------|-------|
| page  | Int32 |



## GET /api/v1/mixes/:rdid

*Schema*

```js
{
  title: String,
  mixId: String,
  videos: [
    {
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
      index: Int32,
      lengthSeconds: Int32
    }
  ]
}
```
