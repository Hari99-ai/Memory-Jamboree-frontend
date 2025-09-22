const firstNames = [
  // Easy to Moderate Names
  "Albert", "Isaac", "Charles", "Nikola", "Stephen", "Thomas", "Alexander", "Louis", "Marie", "Alan",
  "Richard", "Carl", "Neil", "Michael", "Lionel", "LeBron", "Tom", "Usain", "Muhammad", "Tiger",
  "Roger", "Kobe", "Serena", "Wayne", "Harry", "Clark", "Bruce", "Peter", "Tony", "Steve", "Luke",
  "James", "John", "Neo", "Jay", "Winston", "George", "Don", "King", "Romeo", "Mickey", "Donald",
  "Bugs", "Jerry", "Scooby", "Fred", "Barney", "Yogi", "Martin", "Nelson", "Benjamin", "Marco", "Ernest",
];

const lastNames = [
  // Easy to Moderate Names
  "Einstein", "Newton", "Darwin", "Tesla", "Hawking", "Edison", "Fleming", "Curie", "Turing", "Sagan",
  "Jordan", "Messi", "James", "Brady", "Bolt", "Ali", "Woods", "Federer", "Bryant", "Williams", "Phelps",
  "Holmes", "Potter", "Kent", "Wayne", "Parker", "Stark", "Rogers", "Bond", "Jones", "Finch", "Smith",
  "Prince", "Lear", "Mouse", "Duck", "Bunny", "Pig", "Bird", "Cat", "Doo", "Bear", "Lion", "Churchill",
  "Lincoln", "Washington", "Kennedy", "King", "Mandela", "Gandhi", "Franklin", "Roosevelt", "Hamilton",
];

// Fisher-Yates shuffle algorithm for true randomness
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

interface NamePair {
  firstName: string;
  lastName: string;
}

export default function generateFacesData(count: number) {
  // 1. Create a pool of all possible unique name pairs
  const allNamePairs: NamePair[] = [];
  for (const firstName of firstNames) {
    for (const lastName of lastNames) {
      // This prevents combinations where first and last names are the same (e.g., "James James")
      if (firstName !== lastName) {
        allNamePairs.push({ firstName, lastName });
      }
    }
  }

  // 2. Shuffle the entire pool of name pairs to get a random order
  const shuffledNamePairs = shuffleArray(allNamePairs);

  if (count > shuffledNamePairs.length) {
    console.warn(`Requested ${count} faces, but only ${shuffledNamePairs.length} unique name combinations are available. Names will start repeating.`);
  }

  // 3. Create a pool of unique image indices
  const maxPortraits = 99; // API has portraits 0-98 for men
  if (count > maxPortraits) {
    console.warn(`Requested ${count} faces, but only ${maxPortraits} unique male portraits are available. Images will start repeating.`);
  }

  const portraitIndices = Array.from({ length: maxPortraits }, (_, i) => i);
  const shuffledIndices = shuffleArray(portraitIndices);

  // 4. Generate the final data using the unique, shuffled pools
  return Array.from({ length: count }, (_, i) => {
    // Pick the next available unique name pair. Modulo is a fallback for when count > available pairs.
    const namePair = shuffledNamePairs[i % shuffledNamePairs.length];
    
    // Pick the next available unique image. Modulo is a fallback for when count > available images.
    const portraitId = shuffledIndices[i % shuffledIndices.length];

    return {
      firstName: namePair.firstName,
      lastName: namePair.lastName,
      name: `${namePair.firstName} ${namePair.lastName}`,
      image: `https://randomuser.me/api/portraits/men/${portraitId}.jpg`,
    }
  })
}