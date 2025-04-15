
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Star, Check, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTeachers } from '@/contexts/TeacherContext';

const TeachersList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { teachers } = useTeachers();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              1-on-1 Classes
            </h1>
            <p className="text-gray-600">
              Book a personalized session with our expert yoga teachers
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              onClick={() => {
                const element = document.getElementById('what-is-1on1');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              What is a 1-on-1 class?
            </Button>
          </div>
        </div>

        {teachers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <Card key={teacher.id} className="overflow-hidden border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <Badge className="absolute -top-1 -right-1 bg-pink-500">Yoga Therapist</Badge>
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img 
                          src={teacher.avatarUrl || "/placeholder.svg"} 
                          alt={teacher.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-1">
                      <Star className="text-green-500 fill-green-500 mr-1" size={20} />
                      <span className="text-green-500 font-bold text-xl">{teacher.rating}</span>
                      <span className="text-gray-500 ml-2">from {teacher.reviewCount} Reviews</span>
                    </div>
                    
                    <h2 className="text-xl font-bold flex items-center">
                      {teacher.name}
                      <ChevronRight className="ml-1" size={20} />
                    </h2>
                    
                    <p className="text-gray-600 mb-4">Available for a session tomorrow</p>
                    
                    <div className="w-full space-y-2 mb-6">
                      <div className="flex items-start">
                        <Check className="text-orange-500 mr-2 mt-1 flex-shrink-0" size={18} />
                        <p className="text-gray-700">Friendly and always happy to help</p>
                      </div>
                      <div className="flex items-start">
                        <Check className="text-orange-500 mr-2 mt-1 flex-shrink-0" size={18} />
                        <p className="text-gray-700">{teacher.experience} years teaching experience</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center w-full mb-4 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      onClick={() => navigate(`/teachers/${teacher.id}/about`)}
                    >
                      <Play className="mr-2 text-blue-500" size={16} />
                      Learn about me in 60 secs
                    </Button>
                    
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={() => navigate(`/teachers/${teacher.id}/book`)}
                    >
                      Book
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="yoga-card bg-yoga-light-blue/30 text-center py-12">
            <p className="text-xl">No teachers available at the moment</p>
            <p className="text-gray-600 mt-2">
              Please check back soon
            </p>
          </div>
        )}
        
        <div id="what-is-1on1" className="bg-gray-50 rounded-lg p-6 mt-12">
          <h2 className="text-2xl font-bold mb-4">What is a 1-on-1 class?</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              A 1-on-1 class is a personalized yoga session where you get undivided attention from one of our expert yoga teachers. These sessions are tailored to your specific needs, goals, and experience level.
            </p>
            <p className="text-gray-700">
              Whether you're a beginner looking to learn the basics, an experienced practitioner wanting to perfect your technique, or someone seeking therapeutic yoga for specific health concerns, our teachers will customize the session just for you.
            </p>
            <h3 className="text-xl font-semibold mt-4 mb-2">Benefits of 1-on-1 classes:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Personalized attention and feedback</li>
              <li>Sessions tailored to your specific needs</li>
              <li>Flexible scheduling to fit your calendar</li>
              <li>Progress at your own pace</li>
              <li>Address specific concerns or limitations</li>
              <li>Learn advanced techniques safely</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            className="flex items-center gap-2 text-yoga-blue border-yoga-blue hover:bg-yoga-blue hover:text-white"
            onClick={() => navigate('/teachers')}
          >
            See all teachers
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default TeachersList;
