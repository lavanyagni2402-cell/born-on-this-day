const axios = require('axios');
const cache = require('../utils/cache');
const { getMoonPhase, getWorldPopulation, getTechEra } = require('../utils/calculations');
const { getTVShows } = require('../utils/tvShows');
const { getBooks } = require('../utils/books');
const { getGames } = require('../utils/games');
const { getWeather } = require('../utils/weather');
const { getStockSnapshot } = require('../utils/stocks');
const { getEraPhotos } = require('../utils/photos');
const { getWaybackSnapshots } = require('../utils/wayback');
const { getEarthquakes } = require('../utils/earthquakes');
const { getScienceHighlights } = require('../utils/science');
const { getCurrencySnapshot } = require('../utils/currency');
const { getSpaceMissions } = require('../utils/spaceMissions');

// ─── Wikipedia "On This Day" ────────────────────────────────────────────────
async function getWikipediaEvents(month, day) {
  const cacheKey = `wiki_${month}_${day}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${month}/${day}`;
    const res = await axios.get(url, { timeout: 8000 });
    const data = res.data;

    const result = {
      events: (data.events || []).slice(0, 8).map(e => ({
        year: e.year,
        text: e.text,
        pages: e.pages?.slice(0, 1).map(p => ({
          title: p.title,
          thumbnail: p.thumbnail?.source || null,
          url: p.content_urls?.desktop?.page || null
        }))
      })),
      births: (data.births || []).slice(0, 10).map(b => ({
        year: b.year,
        text: b.text,
        pages: b.pages?.slice(0, 1).map(p => ({
          title: p.title,
          thumbnail: p.thumbnail?.source || null,
          url: p.content_urls?.desktop?.page || null
        }))
      })),
      deaths: (data.deaths || []).slice(0, 4).map(d => ({
        year: d.year,
        text: d.text,
      })),
      holidays: (data.holidays || []).slice(0, 4).map(h => ({
        text: h.text
      }))
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Wikipedia API error:', err.message);
    return { events: [], births: [], deaths: [], holidays: [] };
  }
}

// ─── Famous People Born on This Day (filtered by birth year) ─────────────────
async function getFamousBirthdays(month, day) {
  const cacheKey = `birthdays_${month}_${day}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/births/${month}/${day}`;
    const res = await axios.get(url, { timeout: 8000 });

    // TEMP DEBUG — remove once confirmed working on your machine. Shows
    // exactly how many births Wikipedia returned before/after filtering,
    // so a genuinely empty upstream response is distinguishable from a
    // filtering bug.
    console.log(`[famousBirthdays ${month}/${day}] raw births from Wikipedia: ${res.data.births?.length ?? 'undefined'}`);

    // Only require a linked Wikipedia page (for a name/url) — NOT a
    // thumbnail. Wikipedia's onthisday births feed frequently has entries
    // whose lead page has no thumbnail at all, and requiring one here was
    // silently emptying the whole list for many dates even though there
    // were perfectly good births to show. The frontend already renders a
    // placeholder when `thumbnail` is null, so there's nothing to gain by
    // filtering these out before they ever reach it.
    const births = (res.data.births || [])
      .filter(b => b.pages && b.pages.length > 0)
      .slice(0, 12)
      .map(b => ({
        year: b.year,
        name: b.pages[0]?.title || b.text,
        description: b.text,
        thumbnail: b.pages[0]?.thumbnail?.source || null,
        url: b.pages[0]?.content_urls?.desktop?.page || null
      }));

    // TEMP DEBUG — remove once confirmed working.
    console.log(`[famousBirthdays ${month}/${day}] after filtering (has a linked page): ${births.length}`);

    cache.set(cacheKey, births);
    return births;
  } catch (err) {
    // TEMP DEBUG — logs the full error, not just the message, so a
    // network/DNS/timeout failure is distinguishable from an HTTP error
    // response (e.g. Wikipedia returning 404/429).
    console.error(`[famousBirthdays ${month}/${day}] request failed:`, err.response?.status, err.response?.statusText || err.message);
    return [];
  }
}

// ─── Movies from TMDB ────────────────────────────────────────────────────────
async function getMovies(year, month, day) {
  // Cache key must include the day — the release window below depends on it,
  // not just the month.
  const cacheKey = `movies_${year}_${month}_${day}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    // Get movies released within ~2 weeks of the actual birth date.
    // Using Date's own day-rollover (instead of clamping into the same
    // month) so this correctly crosses month/year boundaries.
    const centerDate = new Date(Date.UTC(year, month - 1, day));
    const startDate = new Date(centerDate);
    startDate.setUTCDate(startDate.getUTCDate() - 14);
    const endDate = new Date(centerDate);
    endDate.setUTCDate(endDate.getUTCDate() + 14);

    const toISODate = (d) => d.toISOString().split('T')[0];
    const start = toISODate(startDate);
    const end = toISODate(endDate);

    if (!process.env.TMDB_API_KEY || process.env.TMDB_API_KEY === 'your_tmdb_key_here') {
      return getFallbackMovies(year);
    }

    const baseUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&primary_release_date.gte=${start}&primary_release_date.lte=${end}&sort_by=popularity.desc&language=en-US`;

    // Prefer movies with a meaningful number of votes so we don't surface
    // barely-listed placeholder entries — fall back to the unfiltered
    // results if the quality filter leaves nothing in this window.
    let res = await axios.get(`${baseUrl}&vote_count.gte=20`, { timeout: 8000 });
    let results = res.data.results || [];
    if (results.length === 0) {
      res = await axios.get(baseUrl, { timeout: 8000 });
      results = res.data.results || [];
    }

    const movies = results.slice(0, 3).map(m => ({
      title: m.title,
      overview: m.overview?.slice(0, 150) + '...',
      poster: m.poster_path ? `https://image.tmdb.org/t/p/w300${m.poster_path}` : null,
      releaseDate: m.release_date,
      rating: m.vote_average?.toFixed(1),
      genres: []
    }));

    if (movies.length === 0) {
      return getFallbackMovies(year);
    }

    cache.set(cacheKey, movies);
    return movies;
  } catch (err) {
    console.error('TMDB error:', err.message);
    return getFallbackMovies(year);
  }
}

function getFallbackMovies(year) {
  // Curated classics per decade when API key not available
  const decades = {
    1920: [{ title: 'The General', year: 1926, note: 'Buster Keaton masterpiece' }, { title: 'Metropolis', year: 1927, note: 'Fritz Lang sci-fi epic' }],
    1930: [{ title: 'Gone with the Wind', year: 1939, note: 'Epic Civil War drama' }, { title: 'The Wizard of Oz', year: 1939, note: 'Classic fantasy musical' }],
    1940: [{ title: 'Casablanca', year: 1942, note: 'Timeless wartime romance' }, { title: "It's a Wonderful Life", year: 1946, note: 'Frank Capra classic' }],
    1950: [{ title: 'Singin\' in the Rain', year: 1952, note: 'Beloved musical comedy' }, { title: 'Rear Window', year: 1954, note: 'Hitchcock thriller' }],
    1960: [{ title: '2001: A Space Odyssey', year: 1968, note: 'Kubrick sci-fi landmark' }, { title: 'The Sound of Music', year: 1965, note: 'Beloved musical' }],
    1970: [{ title: 'Star Wars', year: 1977, note: 'Changed cinema forever' }, { title: 'Jaws', year: 1975, note: 'First blockbuster ever' }],
    1980: [{ title: 'E.T. the Extra-Terrestrial', year: 1982, note: 'Spielberg classic' }, { title: 'Back to the Future', year: 1985, note: 'Time-travel comedy' }],
    1990: [{ title: 'The Lion King', year: 1994, note: 'Disney animated masterpiece' }, { title: 'Jurassic Park', year: 1993, note: 'CGI revolution' }],
    2000: [{ title: 'The Dark Knight', year: 2008, note: 'Redefined superhero films' }, { title: 'Avatar', year: 2009, note: '3D cinema revolution' }],
    2010: [{ title: 'Inception', year: 2010, note: 'Mind-bending thriller' }, { title: 'Black Panther', year: 2018, note: 'Cultural milestone' }],
    2020: [{ title: 'Everything Everywhere All at Once', year: 2022, note: 'Multiverse drama' }]
  };
  
  const decade = Math.floor(year / 10) * 10;
  const key = Object.keys(decades).map(Number).reduce((prev, curr) => 
    Math.abs(curr - decade) < Math.abs(prev - decade) ? curr : prev
  );
  
  return (decades[key] || []).map(m => ({
    title: m.title,
    overview: m.note,
    poster: null,
    releaseDate: String(m.year),
    rating: 'N/A',
    note: 'Era classic'
  }));
}

// Best-effort "source name" from a URL when the API doesn't give us a
// human-readable outlet name directly (World News API's search results
// don't include one).
function sourceFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// ─── News Headlines (World News API — covers roughly 2022 onward) ─────────────
async function getNewsHeadlines(date) {
  const year = date.getFullYear();
  const apiKey = process.env.WORLD_NEWS_API_KEY;

  // World News API's archive starts around 2022; older birth dates (and a
  // missing/placeholder key) fall back to the curated dataset below.
  if (year < 2022 || !apiKey || apiKey.includes('your_')) {
    return getHistoricalHeadlines(year);
  }

  const cacheKey = `news_${date.toISOString().split('T')[0]}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const dateStr = date.toISOString().split('T')[0];

    const res = await axios.get('https://api.worldnewsapi.com/search-news', {
      params: {
        language: 'en',
        'earliest-publish-date': `${dateStr} 00:00:00`,
        'latest-publish-date': `${dateStr} 23:59:59`,
        sort: 'publish-time',
        'sort-direction': 'DESC',
        number: 6,
      },
      headers: { 'x-api-key': apiKey },
      timeout: 8000,
    });

    const headlines = (res.data.news || []).slice(0, 6).map(a => ({
      title: a.title,
      description: a.summary?.slice(0, 120) || a.text?.slice(0, 120),
      source: sourceFromUrl(a.url),
      url: a.url,
      image: a.image,
    }));

    if (headlines.length === 0) {
      return getHistoricalHeadlines(year);
    }

    cache.set(cacheKey, headlines);
    return headlines;
  } catch (err) {
    console.error('World News API (search-news) error:', err.message);
    return getHistoricalHeadlines(year);
  }
}

function getHistoricalHeadlines(year) {
  // Curated major headlines by year
  const headlines = {
    1969: ['Apollo 11 lands on Moon — Neil Armstrong takes first steps', 'Woodstock Music Festival draws 400,000 attendees', 'Vietnam War protests sweep U.S. college campuses'],
    1970: ['Beatles officially break up', 'Kent State shooting shocks nation', 'First Earth Day celebrated worldwide'],
    1975: ['Saigon falls, Vietnam War ends', 'Microsoft founded by Bill Gates and Paul Allen', 'Steven Spielberg\'s Jaws becomes first summer blockbuster'],
    1980: ['John Lennon shot and killed in New York', 'Mount St. Helens erupts', 'Ronald Reagan elected U.S. President'],
    1985: ['Live Aid concert raises $127M for famine relief', 'Microsoft releases Windows 1.0', 'DNA fingerprinting invented by Alec Jeffreys'],
    1989: ['Berlin Wall falls — Germany reunification begins', 'Tiananmen Square protests in China', 'World Wide Web invented by Tim Berners-Lee'],
    1991: ['Soviet Union dissolves — Cold War ends', 'Gulf War: Operation Desert Storm', 'Nirvana releases Nevermind, grunge era begins'],
    1995: ['Oklahoma City bombing kills 168', 'O.J. Simpson acquitted in murder trial', 'Amazon.com launched by Jeff Bezos'],
    2001: ['September 11 attacks on the World Trade Center', 'U.S. invades Afghanistan', 'Wikipedia launches online'],
    2005: ['Hurricane Katrina devastates New Orleans', 'Pope John Paul II dies', 'YouTube launched'],
    2008: ['Barack Obama elected first Black U.S. President', 'Global financial crisis erupts', 'iPhone App Store launches'],
    2010: ['Haiti earthquake kills 230,000', 'BP Deepwater Horizon oil spill', 'Instagram launches'],
    2012: ['Hurricane Sandy devastates New York', 'Syrian Civil War escalates', 'SpaceX becomes first private company to reach ISS'],
    2016: ['Donald Trump elected U.S. President', 'Brexit vote shocks Europe', 'Death of Prince, David Bowie, and Muhammad Ali'],
    2018: ['Winter Olympics held in Pyeongchang', 'Royal wedding of Prince Harry and Meghan Markle', 'Facebook–Cambridge Analytica data scandal breaks'],
    2019: ['Notre-Dame Cathedral damaged by fire', 'First-ever image of a black hole released', 'Greta Thunberg leads global climate strikes'],
    2020: ['COVID-19 declared global pandemic', 'George Floyd protests worldwide', 'U.S. Presidential election: Biden defeats Trump'],
    2021: ['U.S. Capitol riot on January 6', 'COVID-19 vaccine rollout begins worldwide', 'Container ship Ever Given blocks the Suez Canal'],
    2022: ['Russia launches full-scale invasion of Ukraine', 'Queen Elizabeth II dies after 70 years on the throne', 'Elon Musk completes acquisition of Twitter'],
    2023: ['Turkey–Syria earthquake kills tens of thousands', 'ChatGPT sparks a global AI boom', 'Silicon Valley Bank collapses in largest bank failure since 2008'],
    2024: ['Donald Trump wins second term as U.S. President', 'Paris hosts the Summer Olympics', 'Total solar eclipse crosses North America'],
    2025: ['Donald Trump inaugurated for second presidential term', 'Pope Francis dies, conclave elects his successor', 'Israel strikes Iranian nuclear and military facilities'],
  };

  // Find nearest year
  const years = Object.keys(headlines).map(Number);
  const nearest = years.reduce((prev, curr) => 
    Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev
  );

  const diff = Math.abs(nearest - year);
  const prefix = diff > 2 ? `Around ${nearest}: ` : '';

  return (headlines[nearest] || ['Historical records available in newspaper archives']).map(h => ({
    title: prefix + h,
    description: 'Historical record',
    source: 'Historical Archives',
    url: null,
    image: null
  }));
}

// ─── Music Charts ─────────────────────────────────────────────────────────────
async function getMusicCharts(year, month) {
  const cacheKey = `music_${year}_${month}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Curated #1 hits by year/era
  const chartData = getMusicByEra(year, month);
  cache.set(cacheKey, chartData);
  return chartData;
}

function getMusicByEra(year, month) {
  // A rich database of #1 hits and top songs by year
  const charts = {
    1960: { number1: 'Are You Lonesome Tonight - Elvis Presley', top5: ['Are You Lonesome Tonight - Elvis Presley', 'Georgia on My Mind - Ray Charles', 'Itsy Bitsy Teenie Weenie Yellow Polka Dot Bikini - Brian Hyland', 'Theme from A Summer Place - Percy Faith', 'Running Bear - Johnny Preston'], genre: 'Rock & Roll / Pop' },
    1961: { number1: 'Tossin\' and Turnin\' - Bobby Lewis', top5: ['Tossin\' and Turnin\' - Bobby Lewis', 'I Fall to Pieces - Patsy Cline', 'Runaway - Del Shannon', 'Quarter to Three - Gary U.S. Bonds', 'Pony Time - Chubby Checker'], genre: 'Rock & Roll' },
    1965: { number1: 'Satisfaction - Rolling Stones', top5: ['Satisfaction - Rolling Stones', 'Help! - The Beatles', 'Yesterday - The Beatles', 'Like a Rolling Stone - Bob Dylan', 'Wooly Bully - Sam the Sham'], genre: 'British Invasion Rock' },
    1969: { number1: 'Sugar Sugar - The Archies', top5: ['Sugar Sugar - The Archies', 'Aquarius/Let the Sunshine In - 5th Dimension', 'I Can\'t Get Next to You - Temptations', 'Honky Tonk Women - Rolling Stones', 'Everyday People - Sly & Family Stone'], genre: 'Pop / Soul' },
    1971: { number1: 'Joy to the World - Three Dog Night', top5: ['Joy to the World - Three Dog Night', 'Maggie May - Rod Stewart', 'It\'s Too Late - Carole King', 'Just My Imagination - Temptations', 'Go Away Little Girl - Donny Osmond'], genre: 'Soft Rock / Soul' },
    1975: { number1: 'Love Will Keep Us Together - Captain & Tennille', top5: ['Love Will Keep Us Together - Captain & Tennille', 'Rhinestone Cowboy - Glen Campbell', 'Philadelphia Freedom - Elton John', 'Before the Next Teardrop Falls - Freddy Fender', 'My Eyes Adored You - Frankie Valli'], genre: 'Soft Rock / Pop' },
    1977: { number1: 'Tonight\'s the Night - Rod Stewart', top5: ['Tonight\'s the Night - Rod Stewart', 'I Just Want to Be Your Everything - Andy Gibb', 'Best of My Love - Emotions', 'Angel in Your Eyes - Hot', 'Don\'t Leave Me This Way - Thelma Houston'], genre: 'Disco / Pop' },
    1979: { number1: 'My Sharona - The Knack', top5: ['My Sharona - The Knack', 'Bad Girls - Donna Summer', 'Le Freak - Chic', 'Da Ya Think I\'m Sexy - Rod Stewart', 'Hot Stuff - Donna Summer'], genre: 'Disco / New Wave' },
    1982: { number1: 'Physical - Olivia Newton-John', top5: ['Physical - Olivia Newton-John', 'Eye of the Tiger - Survivor', 'I Love Rock N\' Roll - Joan Jett', 'Ebony and Ivory - Paul McCartney & Stevie Wonder', 'Centerfold - J. Geils Band'], genre: 'Pop / Rock' },
    1984: { number1: 'When Doves Cry - Prince', top5: ['When Doves Cry - Prince', 'What\'s Love Got to Do with It - Tina Turner', 'Jump - Van Halen', 'Footloose - Kenny Loggins', 'Against All Odds - Phil Collins'], genre: 'Pop / Synth-Pop' },
    1987: { number1: 'Walk Like an Egyptian - The Bangles', top5: ['Walk Like an Egyptian - The Bangles', 'Alone - Heart', 'La Bamba - Los Lobos', 'I Still Haven\'t Found What I\'m Looking For - U2', 'Livin\' on a Prayer - Bon Jovi'], genre: 'Pop / Rock' },
    1991: { number1: 'Everything I Do - Bryan Adams', top5: ['Everything I Do - Bryan Adams', 'Smells Like Teen Spirit - Nirvana', 'More Than Words - Extreme', 'Rush Rush - Paula Abdul', 'Right Here Right Now - Jesus Jones'], genre: 'Pop / Grunge' },
    1995: { number1: 'Gangsta\'s Paradise - Coolio', top5: ['Gangsta\'s Paradise - Coolio', 'Waterfalls - TLC', 'Creep - TLC', 'Take a Bow - Madonna', 'Fantasy - Mariah Carey'], genre: 'Hip-Hop / R&B' },
    1999: { number1: 'Believe - Cher', top5: ['Believe - Cher', 'No Scrubs - TLC', 'Angel of Mine - Monica', 'Livin\' la Vida Loca - Ricky Martin', 'Baby One More Time - Britney Spears'], genre: 'Pop / Dance' },
    2001: { number1: 'Hanging by a Moment - Lifehouse', top5: ['Hanging by a Moment - Lifehouse', 'Fallin\' - Alicia Keys', 'Drops of Jupiter - Train', 'U Remind Me - Usher', 'Loverboy - Mariah Carey'], genre: 'Pop / R&B' },
    2003: { number1: 'In Da Club - 50 Cent', top5: ['In Da Club - 50 Cent', 'Crazy in Love - Beyoncé', 'Ignition Remix - R. Kelly', 'Miss Independent - Kelly Clarkson', 'Beautiful - Christina Aguilera'], genre: 'Hip-Hop / Pop' },
    2009: { number1: 'Boom Boom Pow - Black Eyed Peas', top5: ['Boom Boom Pow - Black Eyed Peas', 'Right Round - Flo Rida', 'Poker Face - Lady Gaga', 'Love Story - Taylor Swift', 'Down - Jay Sean'], genre: 'Pop / Hip-Hop' },
    2012: { number1: 'Somebody That I Used to Know - Gotye', top5: ['Somebody That I Used to Know - Gotye', 'Call Me Maybe - Carly Rae Jepsen', 'We Are Young - Fun.', 'Stronger - Kelly Clarkson', 'We Found Love - Rihanna'], genre: 'Indie Pop / Electronic' },
    2015: { number1: 'Uptown Funk - Bruno Mars', top5: ['Uptown Funk - Bruno Mars', 'See You Again - Wiz Khalifa', 'Thinking Out Loud - Ed Sheeran', 'Blank Space - Taylor Swift', 'Bad Blood - Taylor Swift'], genre: 'Pop / Funk' },
    2019: { number1: 'Old Town Road - Lil Nas X', top5: ['Old Town Road - Lil Nas X', 'Sunflower - Post Malone', 'Without Me - Halsey', 'Talk - Khalid', '7 Rings - Ariana Grande'], genre: 'Hip-Hop / Pop' },
    2023: { number1: 'Flowers - Miley Cyrus', top5: ['Flowers - Miley Cyrus', 'Kill Bill - SZA', 'Anti-Hero - Taylor Swift', 'Unholy - Sam Smith', 'Die For You - The Weeknd'], genre: 'Pop / R&B' },
  };

  const years = Object.keys(charts).map(Number);
  const nearest = years.reduce((prev, curr) =>
    Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev
  );

  const data = charts[nearest];
  return {
    ...data,
    approximateYear: nearest,
    note: Math.abs(nearest - year) > 1 ? `Approx. charts from ${nearest}` : null
  };
}
// ─── NASA Astronomy Picture of the Day ───────────────────────────────
async function getNASAImage(date) {
  if (
    !process.env.NASA_API_KEY ||
    process.env.NASA_API_KEY === "your_nasa_api_key_here"
  ) {
    return null;
  }

  const cacheKey = `nasa_${date.toISOString().split("T")[0]}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const dateStr = date.toISOString().split("T")[0];

    const url =
      `https://api.nasa.gov/planetary/apod?date=${dateStr}&api_key=${process.env.NASA_API_KEY}`;

    const res = await axios.get(url, { timeout: 8000 });

  // NASA's own APOD archive page for this date, e.g. apod.nasa.gov/apod/ap240115.html
  const apodPageId = dateStr.slice(2, 4) + dateStr.slice(5, 7) + dateStr.slice(8, 10);

  const data = {
  title: res.data.title,
  explanation: res.data.explanation,
  image: res.data.url,
  thumbnail: res.data.thumbnail_url || null,
  hdImage: res.data.hdurl || null,
  copyright: res.data.copyright || "NASA",
  mediaType: res.data.media_type,
  link: `https://apod.nasa.gov/apod/ap${apodPageId}.html`
};

    cache.set(cacheKey, data);

    return data;
  } catch (err) {
    if (err.response) {
      console.error(
        `NASA API error: ${err.response.status} ${err.response.statusText} —`,
        err.response.data
      );
    } else {
      console.error("NASA API error:", err.message);
    }
    return null;
  }
}

// ─── Main Aggregator ──────────────────────────────────────────────────────────
async function getCapsuleData(birthDate, coords = {}) {
  const date = new Date(birthDate + 'T12:00:00Z');
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const dateStr = date.toISOString().split('T')[0];

  const { lat, lon } = coords;
  // Weather is the only piece that depends on location, so fold it into the
  // cache key — otherwise a second visitor with different coordinates would
  // silently get back the first visitor's cached weather for this date.
  const cacheKey = `capsule_${birthDate}_${lat ?? 'default'}_${lon ?? 'default'}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    // getNASAImage() never caches a failure (rate limit, transient network
    // error, etc.) — only successes. But the capsule as a whole is cached
    // for 24h, so without this a single bad NASA call would leave the
    // capsule permanently missing its NASA card for a full day even after
    // the underlying issue clears. Retry it on every cache hit where it's
    // still missing; this is cheap since a real failure returns fast.
    if (!cached.nasa) {
      const retried = await getNASAImage(date);
      if (retried) {
        cached.nasa = retried;
        cache.set(cacheKey, cached);
      }
    }
    return cached;
  }

  // Fire all requests in parallel
  const [
    wikiData,
    famousBirthdays,
    movies,
    news,
    music,
    nasa,
    tvShows,
    books,
    games,
    weather,
    stocks,
    photos,
    wayback,
    earthquakes,
    science,
    currency,
    spaceMissions,
] = await Promise.allSettled([
    getWikipediaEvents(month, day),
    getFamousBirthdays(month, day),
    getMovies(year, month, day),
    getNewsHeadlines(date),
    getMusicCharts(year, month),
    getNASAImage(date),
    getTVShows(year),
    getBooks(year),
    getGames(year),
    getWeather(dateStr, lat, lon),
    getStockSnapshot(dateStr),
    getEraPhotos(year),
    getWaybackSnapshots(dateStr),
    getEarthquakes(dateStr),
    getScienceHighlights(year),
    getCurrencySnapshot(dateStr),
    getSpaceMissions(dateStr),
  ]);

  const moonPhase = getMoonPhase(date);
  const population = getWorldPopulation(year);
  const techEra = getTechEra(year);

  // Every new integration follows the same rule as the existing ones:
  // a rejected/failed promise becomes null or [] here, never a crash.
  const settle = (r, fallback) => (r.status === 'fulfilled' ? r.value : fallback);

  const result = {
    date: {
      full: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }),
      year,
      month,
      day,
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }),
      season: getSeason(month),
    },
    moon: moonPhase,
    population: population,
    techEra: techEra,
    wikipedia: settle(wikiData, { events: [], births: [], deaths: [], holidays: [] }),
    famousBirthdays: settle(famousBirthdays, []),
    movies: settle(movies, []),
    news: settle(news, []),
    music: settle(music, {}),
    nasa: settle(nasa, null),
    tvShows: settle(tvShows, []),
    books: settle(books, []),
    games: settle(games, []),
    weather: settle(weather, null),
    stocks: settle(stocks, null),
    photos: settle(photos, []),
    wayback: settle(wayback, null),
    earthquakes: settle(earthquakes, null),
    science: settle(science, null),
    currency: settle(currency, null),
    spaceMissions: settle(spaceMissions, null),
    generatedAt: new Date().toISOString(),
  };

  cache.set(cacheKey, result);
  return result;
}

function getSeason(month) {
  if ([12, 1, 2].includes(month)) return { name: 'Winter', emoji: '❄️' };
  if ([3, 4, 5].includes(month)) return { name: 'Spring', emoji: '🌸' };
  if ([6, 7, 8].includes(month)) return { name: 'Summer', emoji: '☀️' };
  return { name: 'Autumn', emoji: '🍂' };
}

module.exports = { getCapsuleData };