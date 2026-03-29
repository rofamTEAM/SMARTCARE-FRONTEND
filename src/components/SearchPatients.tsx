import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Calendar, Phone, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { patientsApi } from '../utils/api';

interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  registrationDate: string;
}

interface SearchPatientsProps {
  session: any;
}

export function SearchPatients({ session }: SearchPatientsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await patientsApi.getAll();
      setAllPatients(data || []);
    } catch (error) {
      setAllPatients([]);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) { setSearchResults([]); return; }
    setLoading(true);
    try {
      const results = await patientsApi.search(searchTerm);
      setSearchResults(results || []);
    } catch (error) {
      const results = allPatients.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-6 w-6 mr-2" />
              Search Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, phone, email, or patient ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-lg"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="size-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Search Results ({searchResults.length} found)
                </h3>
                
                <div className="grid gap-4">
                  {searchResults.map((patient) => (
                    <Card key={patient.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-card-foreground font-semibold">
                              <User className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{patient.name}</h4>
                              <p className="text-sm text-muted-foreground mb-2">ID: {patient.id}</p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                  {patient.phone}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                  {patient.dateOfBirth}
                                </div>
                                <div className="flex items-center">
                                  <span className="w-4 h-4 mr-2 text-muted-foreground">♂♀</span>
                                  {patient.gender}
                                </div>
                                <div className="flex items-center">
                                  <span className="w-4 h-4 mr-2 text-destructive">🩸</span>
                                  {patient.bloodGroup}
                                </div>
                              </div>
                              
                              {patient.address && (
                                <div className="flex items-center mt-2 text-sm">
                                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                  {patient.address}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm">
                              Book Appointment
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {searchTerm && searchResults.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No patients found matching "{searchTerm}"</p>
                <p className="text-sm mt-2">Try searching with different keywords</p>
              </div>
            )}

            {!searchTerm && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Enter search terms to find patients</p>
                <p className="text-sm mt-2">Search by name, phone, email, or patient ID</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

