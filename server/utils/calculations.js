/**
 * Calculate moon phase for a given date
 * Based on the algorithm by John Conway
 */
function getMoonPhase(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let r = year % 100;
  r %= 19;
  if (r > 9) r -= 19;
  r = ((r * 11) % 30) + month + day;
  if (month < 3) r += 2;
  r -= year < 2000 ? 4 : 8.3;
  r = Math.floor(r + 0.5) % 30;

  if (r < 0) r += 30;

  const phases = [
    { name: 'New Moon', emoji: '🌑', illumination: 0 },
    { name: 'Waxing Crescent', emoji: '🌒', illumination: 25 },
    { name: 'First Quarter', emoji: '🌓', illumination: 50 },
    { name: 'Waxing Gibbous', emoji: '🌔', illumination: 75 },
    { name: 'Full Moon', emoji: '🌕', illumination: 100 },
    { name: 'Waning Gibbous', emoji: '🌖', illumination: 75 },
    { name: 'Last Quarter', emoji: '🌗', illumination: 50 },
    { name: 'Waning Crescent', emoji: '🌘', illumination: 25 },
  ];

  const index = Math.round(r / 3.75) % 8;
  const phase = phases[index];
  
  return {
    phase: phase.name,
    emoji: phase.emoji,
    illumination: phase.illumination,
    dayNumber: r,
    description: getMoonDescription(phase.name)
  };
}

function getMoonDescription(phaseName) {
  const descriptions = {
    'New Moon': 'The moon was completely dark — a night of new beginnings.',
    'Waxing Crescent': 'A thin sliver of moon was growing in the evening sky.',
    'First Quarter': 'Half the moon was illuminated, climbing toward fullness.',
    'Waxing Gibbous': 'The moon was nearly full, glowing bright in the sky.',
    'Full Moon': 'The moon was at its fullest — glowing bright and round.',
    'Waning Gibbous': 'The full moon was beginning its slow fade.',
    'Last Quarter': 'The moon was half-lit, winding toward darkness.',
    'Waning Crescent': 'Just a thin crescent remained in the early morning sky.',
  };
  return descriptions[phaseName] || 'The moon watched silently from above.';
}

/**
 * Get world population estimate for a given year
 * Based on UN historical data interpolation
 */
function getWorldPopulation(year) {
  const data = [
    { year: 1900, pop: 1600000000 },
    { year: 1910, pop: 1750000000 },
    { year: 1920, pop: 1860000000 },
    { year: 1930, pop: 2070000000 },
    { year: 1940, pop: 2300000000 },
    { year: 1950, pop: 2556000000 },
    { year: 1960, pop: 3026000000 },
    { year: 1970, pop: 3700000000 },
    { year: 1980, pop: 4434000000 },
    { year: 1990, pop: 5327000000 },
    { year: 2000, pop: 6145000000 },
    { year: 2010, pop: 6930000000 },
    { year: 2020, pop: 7800000000 },
    { year: 2024, pop: 8100000000 },
  ];

  // Find surrounding data points
  let lower = data[0];
  let upper = data[data.length - 1];

  for (let i = 0; i < data.length - 1; i++) {
    if (year >= data[i].year && year <= data[i + 1].year) {
      lower = data[i];
      upper = data[i + 1];
      break;
    }
  }

  // Linear interpolation
  const ratio = (year - lower.year) / (upper.year - lower.year);
  const population = Math.round(lower.pop + ratio * (upper.pop - lower.pop));

  return {
    count: population,
    formatted: formatPopulation(population),
    context: getPopulationContext(year, population)
  };
}

function formatPopulation(pop) {
  if (pop >= 1000000000) {
    return (pop / 1000000000).toFixed(2) + ' billion';
  }
  return (pop / 1000000).toFixed(0) + ' million';
}

function getPopulationContext(year, pop) {
  const current = 8100000000;
  const percent = ((pop / current) * 100).toFixed(1);
  return `That's ${percent}% of today's world population.`;
}

/**
 * Get technology context for a given year
 */
function getTechEra(year) {
  if (year < 1920) return {
    era: 'The Industrial Age',
    icon: '⚙️',
    highlights: ['Steam-powered machines dominated industry', 'Telegraph was the internet of its day', 'Radio was brand new technology', 'Cars were a luxury novelty', 'Electricity was still spreading to homes']
  };
  if (year < 1940) return {
    era: 'The Radio Age',
    icon: '📻',
    highlights: ['Radio brought news and music into homes', 'Talking pictures replaced silent films', 'Commercial aviation just beginning', 'Refrigerators were becoming household items', 'Television was being invented in labs']
  };
  if (year < 1950) return {
    era: 'The War & Science Age',
    icon: '🔬',
    highlights: ['WWII accelerated technology dramatically', 'Radar and sonar changed warfare', 'First computers (ENIAC) were room-sized', 'Penicillin saved millions of lives', 'Nuclear age began in 1945']
  };
  if (year < 1960) return {
    era: 'The Atomic Age',
    icon: '⚛️',
    highlights: ['Television became the dominant media', 'Rock and roll played on 45 RPM records', 'Commercial jet travel began', 'Space race between USA and USSR heated up', 'Credit cards introduced in 1950']
  };
  if (year < 1970) return {
    era: 'The Space Age',
    icon: '🚀',
    highlights: ['First human walked on the Moon (1969)', 'Color television spread to homes', 'ARPANET (early internet) created 1969', 'Cassette tapes replaced reel-to-reel', 'Microchips being developed']
  };
  if (year < 1980) return {
    era: 'The Disco & Digital Dawn',
    icon: '💾',
    highlights: ['First personal computers arrived (Apple II, 1977)', 'VHS vs Betamax war for home video', 'Microprocessors revolutionized everything', 'Calculators became affordable', 'Pong launched the video game era']
  };
  if (year < 1990) return {
    era: 'The PC Revolution',
    icon: '🖥️',
    highlights: ['IBM PC and Apple Macintosh changed computing', 'CDs replaced vinyl records', 'Nintendo and Atari defined childhood', 'MTV launched music video culture', 'Mobile phones existed but weighed 2 lbs']
  };
  if (year < 2000) return {
    era: 'The Internet Age',
    icon: '🌐',
    highlights: ['World Wide Web became public in 1991', 'Google founded in 1998', 'MP3s started killing the music industry', 'DVDs replaced VHS tapes', 'Y2K panic approaching the millennium']
  };
  if (year < 2007) return {
    era: 'The Broadband Era',
    icon: '📡',
    highlights: ['Facebook launched in 2004', 'YouTube launched in 2005', 'iPod made everyone a DJ', 'High-speed internet became standard', 'Flat-screen TVs replacing CRTs']
  };
  if (year < 2012) return {
    era: 'The Smartphone Revolution',
    icon: '📱',
    highlights: ['iPhone launched in 2007, changed everything', 'Android launched in 2008', 'App stores created billion-dollar industries', 'Twitter and social media exploded', 'Streaming started replacing downloads']
  };
  if (year < 2020) return {
    era: 'The Social & Streaming Era',
    icon: '🎮',
    highlights: ['Netflix killed Blockbuster and changed TV', 'Instagram and Snapchat defined visual culture', '4K streaming became standard', 'Uber and Airbnb disrupted industries', 'Smart speakers brought AI into homes']
  };
  return {
    era: 'The AI Age',
    icon: '🤖',
    highlights: ['COVID accelerated remote work and digital life', 'ChatGPT and AI tools became mainstream', 'Electric vehicles hitting mass adoption', 'Crypto and NFTs rose and fell', 'TikTok became the dominant social platform']
  };
}

module.exports = { getMoonPhase, getWorldPopulation, getTechEra };