const axios = require('axios');
const cache = require('../utils/cache');
const { getMoonPhase, getWorldPopulation, getTechEra } = require('../utils/calculations');

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
    
    const births = (res.data.births || [])
      .filter(b => b.pages && b.pages.length > 0 && b.pages[0].thumbnail)
      .slice(0, 12)
      .map(b => ({
        year: b.year,
        name: b.pages[0]?.title || b.text,
        description: b.text,
        thumbnail: b.pages[0]?.thumbnail?.source || null,
        url: b.pages[0]?.content_urls?.desktop?.page || null
      }));

    cache.set(cacheKey, births);
    return births;
  } catch (err) {
    console.error('Famous birthdays error:', err.message);
    return [];
  }
}

// ─── Movies from TMDB ────────────────────────────────────────────────────────
async function getMovies(year, month, day) {
  const cacheKey = `movies_${year}_${month}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    // Get movies released around that time (±30 days)
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const startDate = new Date(year, month - 1, Math.max(1, day - 30));
    const endDate = new Date(year, month - 1, Math.min(28, day + 30));
    
    const start = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    if (!process.env.TMDB_API_KEY || process.env.TMDB_API_KEY === 'your_tmdb_key_here') {
      return getFallbackMovies(year);
    }

    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&primary_release_date.gte=${start}&primary_release_date.lte=${end}&sort_by=popularity.desc&language=en-US`;
    const res = await axios.get(url, { timeout: 8000 });
    
    const movies = (res.data.results || []).slice(0, 6).map(m => ({
      title: m.title,
      overview: m.overview?.slice(0, 150) + '...',
      poster: m.poster_path ? `https://image.tmdb.org/t/p/w300${m.poster_path}` : null,
      releaseDate: m.release_date,
      rating: m.vote_average?.toFixed(1),
      genres: []
    }));

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

// ─── News Headlines (NewsAPI has data back to ~2016) ──────────────────────────
async function getNewsHeadlines(date) {
  const year = date.getFullYear();
  
  // NewsAPI only has data back to about 2016
  if (year < 2016 || !process.env.NEWS_API_KEY || process.env.NEWS_API_KEY === 'your_newsapi_key_here') {
    return getHistoricalHeadlines(year);
  }

  const cacheKey = `news_${date.toISOString().split('T')[0]}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const dateStr = date.toISOString().split('T')[0];
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextStr = nextDay.toISOString().split('T')[0];

    const url = `https://newsapi.org/v2/everything?from=${dateStr}&to=${nextStr}&sortBy=popularity&language=en&pageSize=6&apiKey=${process.env.NEWS_API_KEY}`;
    const res = await axios.get(url, { timeout: 8000 });

    const headlines = (res.data.articles || []).slice(0, 6).map(a => ({
      title: a.title,
      description: a.description?.slice(0, 120),
      source: a.source?.name,
      url: a.url,
      image: a.urlToImage
    }));

    cache.set(cacheKey, headlines);
    return headlines;
  } catch (err) {
    console.error('NewsAPI error:', err.message);
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
    2020: ['COVID-19 declared global pandemic', 'George Floyd protests worldwide', 'U.S. Presidential election: Biden defeats Trump'],
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

// ─── Main Aggregator ──────────────────────────────────────────────────────────
async function getCapsuleData(birthDate) {
  const date = new Date(birthDate + 'T12:00:00Z');
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const cacheKey = `capsule_${birthDate}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Fire all requests in parallel
  const [wikiData, famousBirthdays, movies, news, music] = await Promise.allSettled([
    getWikipediaEvents(month, day),
    getFamousBirthdays(month, day),
    getMovies(year, month, day),
    getNewsHeadlines(date),
    getMusicCharts(year, month),
  ]);

  const moonPhase = getMoonPhase(date);
  const population = getWorldPopulation(year);
  const techEra = getTechEra(year);

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
    wikipedia: wikiData.status === 'fulfilled' ? wikiData.value : { events: [], births: [], deaths: [], holidays: [] },
    famousBirthdays: famousBirthdays.status === 'fulfilled' ? famousBirthdays.value : [],
    movies: movies.status === 'fulfilled' ? movies.value : [],
    news: news.status === 'fulfilled' ? news.value : [],
    music: music.status === 'fulfilled' ? music.value : {},
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