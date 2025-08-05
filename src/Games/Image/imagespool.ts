//export const imagesPool: string[] = [
  //...Array.from({ length: 100 }, (_, i) => `https://picsum.photos/200/300?random=${i + 1}`)];

import { API_BASE_URL } from "../../lib/client";


// imagespool.ts
// imagespool.ts
export const imagesPool = async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/images`);
  if (!response.ok) throw new Error("Failed to fetch images");
 
  const data: { filename: string }[] = await response.json();
  const baseURL = `${API_BASE_URL}/uploads/Images`;
 
  return data.map((item) => `${baseURL}/${item.filename}`);
  
};

//pixabay
// export const imagesPool = async (): Promise<string[]> => {
//   const PIXABAY_API_KEY = '33956933-f33ae50e7f0bf1e7c0b75068d';
  
//   const searchTerms = [
//     'cartoon',
//     'kids animals',
//     'children',
//     'children toys',
//     'animated toys',
//     'disney cartoons',
//     'cute animals',
//     'educational cartoons',
//     'kids characters',
//     'fairy tales'
//   ];
  
//   try {
//     // Keep track of seen images to ensure uniqueness
//     const seenImages = new Set<string>();
    
//     // Fetch images for all search terms in parallel
//     const allPromises = searchTerms.map(term => 
//       fetch(
//         `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(term)}&image_type=illustration&safesearch=true&per_page=60&category=education&min_width=400&min_height=400`
//       ).then(response => {
//         if (!response.ok) throw new Error(`Failed to fetch images for term: ${term}`);
//         return response.json();
//       })
//     );

//     const results = await Promise.all(allPromises);
    
//     // Process results one search term at a time to maintain variety
//     const processedImages: string[] = [];
    
//     for (const result of results) {
//       const termImages = result.hits
//         .map((hit: any) => ({
//           url: hit.webformatURL,
//           id: hit.id
//         }))
//         .filter((img: { url: string, id: number }) => {
//           // Only include images we haven't seen before
//           if (seenImages.has(img.url) || seenImages.has(img.id.toString())) {
//             return false;
//           }
//           seenImages.add(img.url);
//           seenImages.add(img.id.toString());
//           return true;
//         })
//         .map((img: { url: string }) => img.url);
      
//       processedImages.push(...termImages);
//     }
    
//     // Limit to maximum 600 images
//     const limitedImages = processedImages.slice(0, 600);
    
//     // Shuffle the array
//     return limitedImages.sort(() => Math.random() - 0.5);

//   } catch (error) {
//     console.error("Error fetching images:", error);
//     return [];
//   }
// };