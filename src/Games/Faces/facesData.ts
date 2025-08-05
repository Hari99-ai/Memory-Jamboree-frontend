// facesData.ts
const names = [
  "Alice", "Bob", "Charlie", "Diana", "Ethan",
  "Fiona", "George", "Hannah", "Ivan", "Julia",
  "Kevin", "Laura", "Mike", "Nina", "Oscar",
  "Paula", "Quinn", "Rachel", "Steve", "Tina",
  // Additional names to reach 75 entries:
  "Uma", "Victor", "Wendy", "Xander", "Yara",
  "Zane", "Aaron", "Beth", "Cody", "Denise",
  "Elijah", "Faith", "Gavin", "Hailey", "Isaac",
  "Jade", "Kyle", "Lila", "Martin", "Nora",
  "Owen", "Peggy", "Quentin", "Rebecca", "Sam",
  "Teresa", "Umar", "Violet", "Walter", "Ximena",
  "Yosef", "Zara", "Aaron", "Bella", "Cesar",
  "Derek", "Eli", "Flora", "Gary", "Helen",
  "Ian", "Janet", "Ken", "Leona", "Mason",
  "Nolan", "Olga", "Patrick", "Queen", "Ralph",
  "Sara", "Trent", "Ursula", "Vince", "Wyatt",
  "Xenia", "Yael", "Zeke"
];

export default function generateFacesData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    name: names[i],
    image: `https://randomuser.me/api/portraits/med/${i % 2 === 0 ? "women" : "men"}/${i}.jpg`
  }));
}
