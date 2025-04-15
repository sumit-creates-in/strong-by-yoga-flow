
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Star, Check, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTeachers } from '@/contexts/TeacherContext';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

const TeacherShowcase = () => {
  const { teachers } = useTeachers();
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  
  const displayedTeachers = teachers.slice(0, 3);
  
  React.useEffect(() => {
    if (!api) {
      return;
    }
 
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">1-on-1 Classes</h2>
        <Button
          variant="link"
          onClick={() => navigate('/teachers')}
          className="text-yoga-blue"
        >
          See all teachers <ChevronRight className="ml-1" size={16} />
        </Button>
      </div>
      
      <div className="relative overflow-hidden md:px-10">
        <Carousel
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent>
            {displayedTeachers.map((teacher) => (
              <CarouselItem key={teacher.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="overflow-hidden border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                          <Badge className="absolute -top-1 -right-1 bg-pink-500">Yoga Therapist</Badge>
                          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                            <img 
                              src={teacher.avatarUrl || "/placeholder.svg"} 
                              alt={teacher.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center mb-1">
                          <Star className="text-green-500 fill-green-500 mr-1" size={16} />
                          <span className="text-green-500 font-bold text-lg">{teacher.rating}</span>
                          <span className="text-gray-500 ml-2 text-sm">from {teacher.reviewCount} Reviews</span>
                        </div>
                        
                        <h3 className="text-lg font-bold flex items-center mb-1">
                          {teacher.name}
                          <ChevronRight className="ml-1" size={16} />
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4">Available for a session tomorrow</p>
                        
                        <div className="w-full space-y-2 mb-6">
                          <div className="flex items-start">
                            <Check className="text-orange-500 mr-2 mt-1 flex-shrink-0" size={14} />
                            <p className="text-gray-700 text-sm">Friendly and always happy to help</p>
                          </div>
                          <div className="flex items-start">
                            <Check className="text-orange-500 mr-2 mt-1 flex-shrink-0" size={14} />
                            <p className="text-gray-700 text-sm">{teacher.experience} years teaching experience</p>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="flex items-center justify-center w-full mb-4 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                          size="sm"
                          onClick={() => navigate(`/teachers/${teacher.id}/about`)}
                        >
                          <Play className="mr-2 text-blue-500" size={14} />
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
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="hidden md:flex absolute top-0 left-0 bottom-0 items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white shadow hover:bg-gray-100"
            onClick={() => api?.scrollPrev()}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        <div className="hidden md:flex absolute top-0 right-0 bottom-0 items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white shadow hover:bg-gray-100"
            onClick={() => api?.scrollNext()}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      <div className="flex justify-center mt-2">
        {Array.from({ length: count }).map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className={`w-2 h-2 p-0 rounded-full mx-1 ${
              index === current - 1 
                ? "bg-yoga-blue" 
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TeacherShowcase;
