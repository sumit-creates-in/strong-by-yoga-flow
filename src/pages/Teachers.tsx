
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useTeachers } from '@/contexts/TeacherContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Search } from 'lucide-react';

const Teachers = () => {
  const { teachers } = useTeachers();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter teachers based on search term
  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    teacher.expertise.some(expertise => 
      expertise.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Find a Teacher</h1>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, specialty, or expertise..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.length > 0 ? (
            filteredTeachers.map(teacher => (
              <Card 
                key={teacher.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/teachers/${teacher.id}`)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={teacher.avatarUrl || "https://via.placeholder.com/300x150?text=No+Image"} 
                      alt={teacher.name} 
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center">
                      <Star className="text-yellow-400 w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">{teacher.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h2 className="text-xl font-bold">{teacher.name}</h2>
                    <p className="text-gray-600">{teacher.title}</p>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-700">{teacher.shortBio || teacher.bio.substring(0, 100) + '...'}</p>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-1">
                      {teacher.specialties.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-50">
                          {specialty}
                        </Badge>
                      ))}
                      {teacher.specialties.length > 3 && (
                        <Badge variant="outline" className="bg-gray-50">
                          +{teacher.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm">
                        <span className="font-medium">{teacher.totalSessions}</span> sessions completed
                      </div>
                      <Button size="sm">View Profile</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-xl text-gray-500">No teachers found matching your search criteria.</p>
              <Button 
                variant="outline"
                className="mt-4" 
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Teachers;
