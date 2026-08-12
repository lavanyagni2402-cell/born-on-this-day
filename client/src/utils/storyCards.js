// Maps the existing /api/capsule/:date response shape into an ordered list
// of single-fact "story" cards for the full-screen Wrapped-style experience.
// Nothing here changes what data is fetched — it only reshapes data that's
// already in state. Order roughly follows the capsule page's own section
// order; every section pulls its single most notable item (first movie,
// top song, etc.) the same way the pre-existing cards already did.

export function buildStoryCards(data) {
  if (!data) return [];

  const cards = [];

  if (data.date?.full) {
    cards.push({
      id: 'intro',
      icon: data.date.season?.emoji || '✨',
      eyebrow: 'you were born on',
      value: data.date.full,
      sub: data.date.season ? `${data.date.season.emoji} ${data.date.season.name}` : null,
      gradient: 0,
    });
  }

  if (data.population?.formatted) {
    cards.push({
      id: 'population',
      icon: '🌍',
      eyebrow: 'world population when you were born',
      value: data.population.formatted,
      sub: data.population.context || null,
      gradient: 1,
    });
  }

  if (data.weather?.avgTemp != null) {
    cards.push({
      id: 'weather',
      icon: '🌤️',
      eyebrow: data.weather.location ? `the skies over ${data.weather.location}` : 'the skies that day',
      value: `${data.weather.avgTemp}°${data.weather.units?.temperature || 'C'}`,
      sub: (data.weather.maxTemp != null && data.weather.minTemp != null)
        ? `High ${data.weather.maxTemp}° · Low ${data.weather.minTemp}°`
        : null,
      gradient: 5,
    });
  }

  if (data.music?.number1) {
    const parts = String(data.music.number1).split(' - ');
    const title = parts[0]?.trim();
    const artist = parts[1]?.trim();
    cards.push({
      id: 'music',
      icon: '🎵',
      eyebrow: '#1 song',
      value: title || data.music.number1,
      sub: artist ? `by ${artist}` : data.music.genre || null,
      gradient: 2,
    });
  }

  if (data.news?.[0]?.title) {
    cards.push({
      id: 'news',
      icon: '📰',
      eyebrow: 'top headline',
      value: data.news[0].title,
      sub: data.news[0].source || null,
      gradient: 3,
    });
  }

  if (data.movies?.[0]?.title) {
    cards.push({
      id: 'movie',
      icon: '🎬',
      eyebrow: 'top movie',
      value: data.movies[0].title,
      sub: data.movies[0].rating && data.movies[0].rating !== 'N/A' ? `★ ${data.movies[0].rating}` : null,
      image: data.movies[0].poster || null,
      gradient: 4,
    });
  }

  if (data.tvShows?.[0]?.title) {
    cards.push({
      id: 'tv',
      icon: '📺',
      eyebrow: 'popular on the small screen',
      value: data.tvShows[0].title,
      sub: data.tvShows[0].firstAirDate ? data.tvShows[0].firstAirDate.slice(0, 4) : null,
      image: data.tvShows[0].poster || null,
      gradient: 0,
    });
  }

  if (data.books?.[0]?.title) {
    cards.push({
      id: 'book',
      icon: '📖',
      eyebrow: 'on the shelf',
      value: data.books[0].title,
      sub: data.books[0].author ? `by ${data.books[0].author}` : null,
      image: data.books[0].cover || null,
      gradient: 1,
    });
  }

  if (data.games?.[0]?.title) {
    cards.push({
      id: 'game',
      icon: '🎮',
      eyebrow: 'leveling up',
      value: data.games[0].title,
      sub: data.games[0].genre || null,
      image: data.games[0].cover || null,
      gradient: 2,
    });
  }

  if (data.moon?.phase) {
    cards.push({
      id: 'moon',
      icon: data.moon.emoji || '🌕',
      eyebrow: 'moon phase that night',
      value: data.moon.phase,
      sub: data.moon.illumination != null ? `${data.moon.illumination}% illuminated` : null,
      gradient: 5,
    });
  }

  if (data.currency?.rates) {
    const order = [['EUR', '€'], ['GBP', '£'], ['INR', '₹'], ['JPY', '¥']];
    const first = order.find(([key]) => data.currency.rates[key] != null);
    if (first) {
      const [key, symbol] = first;
      cards.push({
        id: 'currency',
        icon: '💱',
        eyebrow: '$1 USD was worth',
        value: `${symbol}${data.currency.rates[key].toFixed(2)}`,
        sub: `${key} exchange rate that day`,
        gradient: 3,
      });
    }
  }

  if (data.stocks) {
    const entry = data.stocks.sp500 || data.stocks.dowJones || data.stocks.nasdaq;
    if (entry) {
      const label = data.stocks.sp500 ? 'S&P 500' : data.stocks.dowJones ? 'Dow Jones' : 'NASDAQ';
      cards.push({
        id: 'stocks',
        icon: '📈',
        eyebrow: `${label} closed at`,
        value: `$${entry.close}`,
        sub: entry.date || null,
        gradient: 4,
      });
    }
  }

  if (data.earthquakes?.[0]) {
    const eq = data.earthquakes[0];
    cards.push({
      id: 'earthquake',
      icon: '🌋',
      eyebrow: 'biggest earthquake that day',
      value: `M${eq.magnitude}`,
      sub: eq.place || null,
      gradient: 0,
    });
  }

  if (data.techEra?.era) {
    cards.push({
      id: 'tech',
      icon: data.techEra.icon || '💻',
      eyebrow: 'the tech era',
      value: data.techEra.era,
      sub: data.techEra.highlights?.[0] || null,
      gradient: 1,
    });
  }

  if (data.spaceMissions?.[0]?.name) {
    const m = data.spaceMissions[0];
    cards.push({
      id: 'space',
      icon: '🚀',
      eyebrow: 'reaching orbit',
      value: m.name,
      sub: m.provider || m.rocket || null,
      image: m.image || null,
      gradient: 2,
    });
  }

  if (data.science?.[0]?.title) {
    const paper = data.science[0];
    cards.push({
      id: 'science',
      icon: '🔬',
      eyebrow: 'most-cited research that year',
      value: paper.title,
      sub: paper.citedBy != null ? `${paper.citedBy} citations` : null,
      gradient: 3,
    });
  }

  if (data.wayback?.[0]?.name) {
    const site = data.wayback[0];
    cards.push({
      id: 'wayback',
      icon: '🕸️',
      eyebrow: 'the internet as it looked',
      value: site.name,
      sub: site.snapshotDate ? `archived ${site.snapshotDate}` : null,
      gradient: 4,
    });
  }

  if (data.famousBirthdays?.[0]?.name) {
    cards.push({
      id: 'birthday',
      icon: '🎂',
      eyebrow: 'you share a birthday with',
      value: data.famousBirthdays[0].name,
      sub: data.famousBirthdays[0].year ? `born ${data.famousBirthdays[0].year}` : null,
      image: data.famousBirthdays[0].thumbnail || null,
      gradient: 5,
    });
  }

  if (data.wikipedia?.events?.[0]?.text) {
    const event = data.wikipedia.events[0];
    cards.push({
      id: 'history',
      icon: '📅',
      eyebrow: event.year ? `on this day in ${event.year}` : 'on this day in history',
      value: event.text,
      sub: null,
      gradient: 0,
    });
  }

  if (data.nasa?.title && data.nasa?.mediaType === 'image') {
    cards.push({
      id: 'nasa',
      icon: '🚀',
      eyebrow: "NASA's picture of the day",
      value: data.nasa.title,
      sub: data.nasa.copyright ? `© ${data.nasa.copyright}` : null,
      image: data.nasa.image || null,
      gradient: 1,
    });
  }

  if (data.photos?.[0]?.thumb) {
    const photo = data.photos[0];
    cards.push({
      id: 'photo',
      icon: '📷',
      eyebrow: 'a look back at the era',
      value: photo.photographer ? `Photo by ${photo.photographer}` : 'A photo from the era',
      sub: null,
      image: photo.thumb || null,
      gradient: 2,
    });
  }

  if (cards.length > 0) {
    cards.push({
      id: 'outro',
      icon: '★',
      eyebrow: "that's a wrap",
      value: 'Your full time capsule is ready',
      sub: 'tap to explore everything →',
      gradient: 3,
      isFinal: true,
    });
  }

  return cards;
}
