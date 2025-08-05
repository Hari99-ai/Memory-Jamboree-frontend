// import axios from "axios";

// // Fetch countries from REST Countries API
// export const fetchCountries = async () => {
//   try {
//     const response = await axios.get("https://restcountries.com/v3.1/all", {
//       timeout: 5000
//     });
    
//     return response.data
//       .map((country: any) => ({
//         value: country.cca2, // Using country code as the value
//         label: `${country.flag} ${country.name.common}`, // Flag and country name
//       }))
//       .sort((a: any, b: any) => a.label.localeCompare(b.label));
//   } catch (error) {
//     console.error("Error fetching countries:", error);
//     // Fallback to an empty array if API fails
//     return [];
//   }
// };


// // Fetch states using CountriesNow API with retry logic
// export const fetchStates = async (countryCode: string): Promise<{value: string, label: string}[]> => {
//   try {
//     const response = await axios.get(
//       `https://countriesnow.space/api/v0.1/countries/states`,
//       {
//         params: { country: countryCode },
//         timeout: 5000
//       }
//     );

//     if (!response.data?.data) {
//       throw new Error('No data in response');
//     }

//     // Find the country in the response and retrieve its states
//     const country = response.data.data.find((item: any) => item.iso2 === countryCode);
    
//     if (!country || !country.states) {
//       throw new Error('No states found for this country');
//     }

//     // Return states in the required format
//     return country.states.map((state: any) => ({
//       value: state.state_code || state.name,
//       label: state.name,
//     }));
//   } catch (error) {
//     console.error(`Error fetching states for ${countryCode}:`, error);
//     // Fallback to an empty array in case of error
//     return [];
//   }
// };



// export const fetchCities = async (countryCode: string, stateName: string): Promise<{value: string, label: string}[]> => {
//   try {
//     // First, let's try to get the country name from the country code
//     // since the API might need the full country name, not the code
//     const countriesResponse = await axios.get("https://restcountries.com/v3.1/alpha/" + countryCode);
//     const countryName = countriesResponse.data[0]?.name?.common;
    
//     if (!countryName) {
//       throw new Error('Could not resolve country name from code');
//     }
    
//     const response = await axios.post(
//       'https://countriesnow.space/api/v0.1/countries/state/cities',
//       {
//         country: countryName, // Use the full country name instead of code
//         state: stateName
//       },
//       {
//         timeout: 5000
//       }
//     );

//     if (response.data.error) {
//       console.error('API returned error:', response.data.msg);
//       throw new Error(response.data.msg);
//     }

//     if (!response.data?.data || !Array.isArray(response.data.data)) {
//       throw new Error('No cities data in response');
//     }

//     // Return cities in the required format
//     return response.data.data.map((city: string) => ({
//       value: city.toLowerCase().replace(/\s+/g, '_'),
//       label: city
//     }));
//   } catch (error) {
//     console.error(`Error fetching cities for ${stateName}, ${countryCode}:`, error);
//     return [];
//   }
// };




// src/services/countryService.ts
const API_KEY = 'MGZMRlZLbkZ0SmNiOGkxQzBlREFLYjBKdlZZU1BnRmlRbGI3N2lvVg==';
const BASE_URL = 'https://api.countrystatecity.in/v1';

const headers = {
  'Content-Type': 'application/json',
  'X-CSCAPI-KEY': API_KEY,
};

// Fetch countries
export async function getCountries() {
  const response = await fetch(`${BASE_URL}/countries`, { headers });
  if (!response.ok) throw new Error('Failed to fetch countries');
  return response.json();
}

// Fetch states by country ISO
export async function getStates(countryIso: string) {
  const response = await fetch(`${BASE_URL}/countries/${countryIso}/states`, { headers });
  if (!response.ok) throw new Error('Failed to fetch states');
  return response.json();
}

// Fetch cities by country ISO and state ISO
export async function getCities(countryIso: string, stateIso: string) {
  const response = await fetch(`${BASE_URL}/countries/${countryIso}/states/${stateIso}/cities`, { headers });
  if (!response.ok) throw new Error('Failed to fetch cities');
  return response.json();
}



export const getAllClasses = () => {
  return [
    "Others (Adult / Senior Citizen)",
    "3rd Grade",
    "4th Grade",
    "5th Grade",
    "6th Grade",
    "7th Grade",
    "8th Grade",
    "9th Grade",
    "10th Grade",
    "11th Grade",
    "12th Grade",
  ];
};
export const defaultImg = "data:image/jpeg;base64,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"