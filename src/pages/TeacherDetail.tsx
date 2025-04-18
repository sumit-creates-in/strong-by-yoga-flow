
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Star, 
  ChevronLeft, 
  Medal, 
  Heart, 
  User, 
  MessageCircle,
  Phone,
  Video,
  Languages,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTeachers } from '@/contexts/TeacherContext';

const TeacherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTeacher } = useTeachers();
  const teacher = getTeacher(id || '');
  
  if (!teacher) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Teacher not found</h2>
          <Button onClick={() => navigate('/teachers')}>Back to Teachers</Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          className="mb-4 pl-0"
          onClick={() => navigate('/teachers')}
        >
          <ChevronLeft className="mr-1" size={18} />
          Back to teachers
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Teacher info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="relative">
                    <Badge className="absolute -top-2 -right-2 bg-pink-500">Yoga Therapist</Badge>
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img 
                        src={teacher.avatarUrl || "/placeholder.svg"} 
                        alt={teacher.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <Star className="text-green-500 fill-green-500 mr-1" size={20} />
                      <span className="text-green-500 font-bold text-xl">{teacher.rating}</span>
                      <span className="text-gray-500 ml-2">({teacher.reviewCount} reviews)</span>
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{teacher.name}</h1>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {teacher.specialties && teacher.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-50">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    
                    <p className="text-gray-700 mb-4">{teacher.shortBio || teacher.bio}</p>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center text-gray-600">
                        <Medal className="mr-1 text-yoga-blue" size={16} />
                        <span>{teacher.experience} years experience</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Languages className="mr-1 text-yoga-blue" size={16} />
                        <span>{teacher.languages ? teacher.languages.join(', ') : 'English'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <User className="mr-1 text-yoga-blue" size={16} />
                        <span>{teacher.totalSessions}+ sessions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="about">
              <TabsList className="w-full">
                <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="pt-4">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">About me</h3>
                      <p className="text-gray-700 whitespace-pre-line">{teacher.fullBio || teacher.bio}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">What I can help you with</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {teacher.expertise && teacher.expertise.map((item, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="mr-2 text-green-500" size={16} />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Teaching style</h3>
                      <p className="text-gray-700">{teacher.teachingStyle || "My teaching style focuses on personalization and adapting to individual needs."}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Certifications</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {teacher.certifications && teacher.certifications.map((cert, index) => (
                          <li key={index}>{cert}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="pt-4">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-50 p-4 rounded-lg flex items-center mr-6">
                        <Star className="text-green-500 fill-green-500 mr-2" size={24} />
                        <span className="text-green-500 font-bold text-3xl">{teacher.rating}</span>
                      </div>
                      
                      <div>
                        <p className="font-medium">{teacher.reviewCount} reviews</p>
                        <p className="text-gray-500 text-sm">Last review {teacher.lastReviewDate || 'recently'}</p>
                      </div>
                    </div>
                    
                    {teacher.reviews && Array.isArray(teacher.reviews) ? (
                      teacher.reviews.map((review, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4 mb-4 last:border-0">
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                {review.userInitials}
                              </div>
                              <div>
                                <p className="font-medium">{review.userName}</p>
                                <p className="text-gray-500 text-sm">{review.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Star className="text-green-500 fill-green-500 mr-1" size={16} />
                              <span>{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No reviews yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right column - Booking */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Book a 1-on-1 session</h2>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Session Options</h3>
                  
                  <div className="space-y-3">
                    {teacher.sessionTypes && teacher.sessionTypes.map((session, index) => (
                      <Button 
                        key={index}
                        variant="outline" 
                        className="w-full justify-start h-auto py-3 px-4"
                        onClick={() => navigate(`/teachers/${teacher.id}/book?type=${session.id}`)}
                      >
                        <div className="flex-1 text-left">
                          <div className="flex items-start mb-1">
                            {session.type === 'video' && <Video className="mr-2 text-yoga-blue" size={18} />}
                            {session.type === 'call' && <Phone className="mr-2 text-yoga-blue" size={18} />}
                            {session.type === 'chat' && <MessageCircle className="mr-2 text-yoga-blue" size={18} />}
                            <span className="font-medium">{session.name}</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-500">
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              <span className="text-sm">{session.duration} mins</span>
                            </div>
                            <span className="font-medium">${session.price}</span>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => navigate(`/teachers/${teacher.id}/book`)}
                    className="w-full bg-orange-500 hover:bg-orange-600 mt-6"
                  >
                    See availability
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => {
                      // This would typically save to favorites in a real app
                      // For now, just a placeholder
                      alert('Added to favorites!');
                    }}
                  >
                    <Heart size={16} />
                    Save to favorites
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherDetail;
