
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTeachers } from '@/contexts/TeacherContext';
import { Play, ArrowLeft, Clock, Check } from 'lucide-react';

const TeacherLearn = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTeacher } = useTeachers();
  
  const teacher = id ? getTeacher(id) : undefined;
  
  if (!teacher) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Teacher Not Found</h1>
            <p className="mb-4">The teacher you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/teachers')}>Back to Teachers</Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  const videoData = {
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual video URL
    duration: "60 seconds",
    title: `Meet ${teacher.name} in 60 Seconds`,
    description: `Get to know ${teacher.name}'s teaching style, background, and approach to yoga in this quick introduction video.`,
    highlights: [
      "Teaching philosophy",
      "Yoga experience",
      "Specialties and expertise",
      "What to expect in sessions"
    ]
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/teachers/${id}`)} 
          className="mb-6 flex items-center"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Teacher Profile
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="overflow-hidden">
              <div className="relative pb-[56.25%]">
                <iframe 
                  src={videoData.url} 
                  title={videoData.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-yoga-light-blue flex items-center justify-center">
                    <Play className="text-yoga-blue h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Video Introduction</p>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 text-gray-500 mr-1" />
                      <span className="text-xs text-gray-500">{videoData.duration}</span>
                    </div>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-2">{videoData.title}</h2>
                <p className="text-gray-600 mb-6">{videoData.description}</p>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Video Highlights</h3>
                  <ul className="space-y-2">
                    {videoData.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-1" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">About {teacher.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <img 
                      src={teacher.avatarUrl} 
                      alt={teacher.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="font-bold">{teacher.name}</h4>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span>{teacher.rating}</span>
                      <span className="text-gray-500">({teacher.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {teacher.specialties.slice(0, 3).map((specialty, index) => (
                        <span key={index} className="bg-yoga-light-blue/20 text-yoga-blue px-2 py-1 rounded-full text-xs">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Experience</h4>
                    <p>{teacher.experience} years</p>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      onClick={() => navigate(`/teachers/${id}`)}
                      className="w-full"
                    >
                      View Full Profile
                    </Button>
                  </div>
                  
                  <div className="pt-1">
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/teachers/${id}/book`)}
                      className="w-full"
                    >
                      Book a Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Related Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center py-4 text-gray-500">
                  Explore more teachers with similar specialties
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/teachers')}
                  className="w-full"
                >
                  Browse All Teachers
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherLearn;
