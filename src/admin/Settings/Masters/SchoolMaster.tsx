/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { AddSchool, getSchools, updateSchool } from "../../../lib/api"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Label } from "../../../components/ui/label";
import { getCities, getCountries, getStates } from "../../../lib/select";
import { DataTable } from "./MastersTable";
import { Schoolcolumns } from "./MasterColumn";
import Loader2 from "../../../components/Loader2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { SchoolsMasterData } from "../../../types";

type Country = {
  name: string;
  iso2: string;
};

type City = {
  id: string | number; // whatever your city ID type is
  name: string;
};

type State = {
  iso2: string;
  name: string;
};

export default function SchoolMaster() {
  const [schoolName, setSchoolName] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolsMasterData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [skipStateReset, setSkipStateReset] = useState(false);
  const [skipCityReset, setSkipCityReset] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: schools,
    isLoading: loadingSchools,
    refetch,
  } = useQuery({
    queryKey: ["schools"],
    queryFn: getSchools,
  });

  const { mutate: addSchool } = useMutation({
    mutationFn: AddSchool,
    onSuccess: () => {
      toast.success("School added successfully!");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      setDialogOpen(false);
    },
    onError: () => {
      toast.error("Error adding school.");
    },
  });

  const { mutate: updateSchoolMutation , isPending: isUpdating } = useMutation({
    mutationFn: (data: { id: number; school: any }) => 
      updateSchool(data.id, data.school),
    onSuccess: () => {
      toast.success("School updated successfully!");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      setDialogOpen(false);
    },
    onError: () => {
      toast.error("Error updating school.");
    },
  });

  // Reset form helper function
  const resetForm = () => {
    setSchoolName("");
    setSelectedCountry("IN");
    setSelectedState("");
    setSelectedCity("");
    setIsEditMode(false);
    setSelectedSchool(null);
    setSkipStateReset(false);
    setSkipCityReset(false);
  };

  // Load countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(data);
      } catch (error) {
        console.error("Error loading countries:", error);
        toast.error("Failed to load countries");
      }
    };
    loadCountries();
  }, []);

  // Fill form with selected school data when in edit mode
  useEffect(() => {
    if (selectedSchool && isEditMode) {
      setSchoolName(selectedSchool.school_name);
      
      // Set flags to prevent state/city resets during edits
      setSkipStateReset(true);
      setSkipCityReset(true);
      
      // Set country (this will trigger state loading)
      setSelectedCountry(selectedSchool.country);
    }
  }, [selectedSchool, isEditMode]);

  // Load states when country changes
  useEffect(() => {
    if (!selectedCountry) return;

    const loadStates = async () => {
      setLoadingStates(true);
      try {
        const data = await getStates(selectedCountry);
        setStates(data);
        
        // Only reset state selection if not in edit mode or if editing and country changed
        if (!skipStateReset) {
          setSelectedState("");
          setCities([]);
          setSelectedCity("");
        } else if (selectedSchool) {
          // If we have a selected school, set its state
          setSelectedState(selectedSchool.state);
          setSkipStateReset(false); // Reset the flag after use
        }
      } catch (error) {
        console.error("Error loading states:", error);
        toast.error("Failed to load states");
      } finally {
        setLoadingStates(false);
      }
    };
    loadStates();
  }, [selectedCountry, skipStateReset, selectedSchool]);

  // Load cities when state changes
  useEffect(() => {
    if (!selectedCountry || !selectedState) return;

    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const data = await getCities(selectedCountry, selectedState);
        setCities(data);
        
        // Only reset city selection if not in edit mode or if editing and state changed
        if (!skipCityReset) {
          setSelectedCity("");
        } else if (selectedSchool) {
          // If we have a selected school, set its city
          setSelectedCity(selectedSchool.city);
          setSkipCityReset(false); // Reset the flag after use
        }
      } catch (error) {
        console.error("Error loading cities:", error);
        toast.error("Failed to load cities");
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
  }, [selectedState, selectedCountry, skipCityReset, selectedSchool]);

  const handleSaveSchool = () => {
    if (!schoolName.trim()) {
      toast.error("Please enter a school name");
      return;
    }

    if (!selectedCountry) {
      toast.error("Please select a country");
      return;
    }

    if (!selectedState) {
      toast.error("Please select a state");
      return;
    }

    const schoolData = {
      school_name: schoolName,
      country: selectedCountry,
      state: selectedState,
      city: selectedCity,
      school_id:0
    };

    if (isEditMode && selectedSchool) {
      // Update existing school
      updateSchoolMutation({ 
        id: Number(selectedSchool.school_id), 
        school: schoolData 
      });
    } else {
      // Add new school
      addSchool(schoolData);
    }
  };

  const handleEdit = (school: SchoolsMasterData) => {
    console.log("Edit school:", school);
    setIsEditMode(true);
    setSelectedSchool(school);
    setDialogOpen(true);
    
  };

  if (loadingSchools)
    return (
      <div>
        <Loader2 />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">School Master</h2>
        <Button 
          variant="default" 
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          + Add School
        </Button>
      </div>

      {/* Use controlled dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) {
          resetForm();
        }
        setDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit School" : "Add New School"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                type="text"
                placeholder="Enter School Name"
                className="text-black"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor="country">Country</Label>
                <Select
                  onValueChange={setSelectedCountry}
                  value={selectedCountry}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country:Country) => (
                      <SelectItem key={country.iso2} value={country.iso2}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="state">State</Label>
                <Select
                  onValueChange={setSelectedState}
                  value={selectedState}
                  disabled={!selectedCountry || loadingStates}
                >
                  <SelectTrigger id="state">
                    <SelectValue
                      placeholder={
                        loadingStates
                          ? "Loading..."
                          : states.length
                          ? "Select State"
                          : "No states"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state:State) => (
                      <SelectItem key={state.iso2} value={state.iso2}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="city">City</Label>
                <Select
                  onValueChange={setSelectedCity}
                  value={selectedCity}
                  disabled={!selectedState || loadingCities}
                >
                  <SelectTrigger id="city">
                    <SelectValue
                      placeholder={
                        loadingCities
                          ? "Loading..."
                          : cities.length
                          ? "Select City"
                          : "No cities"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city: City) => (
                      <SelectItem key={city.id} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => {
                resetForm();
                setDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSchool}
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : isEditMode ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-white border shadow p-4 rounded-md">
        <DataTable
          columns={Schoolcolumns(refetch, handleEdit , true)}
          data={schools || []}
        />
      </div>
    </div>
  );
}