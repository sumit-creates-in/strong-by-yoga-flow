
import React from 'react';
import Layout from '@/components/Layout';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Clock, Calendar, Video, Star, Sparkles } from 'lucide-react';

const TeacherLearn = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">Learn About 1-on-1 Sessions with Yoga Teachers</h1>
        <p className="text-gray-600 mb-8">
          Personalized yoga instruction tailored to your specific needs and goals
        </p>
        
        <Separator className="my-8" />
        
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Why Choose 1-on-1 Sessions?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="bg-yoga-blue/10 p-3 rounded-full">
                      <Check className="h-6 w-6 text-yoga-blue" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Personalized Attention</h3>
                      <p className="text-gray-600">
                        Receive dedicated instruction focused entirely on your needs, goals, and abilities.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="bg-yoga-blue/10 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-yoga-blue" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Flexible Scheduling</h3>
                      <p className="text-gray-600">
                        Book sessions at times that work best for your schedule, without being tied to fixed class times.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="bg-yoga-blue/10 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-yoga-blue" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Progress at Your Pace</h3>
                      <p className="text-gray-600">
                        Move forward at a speed that feels comfortable for you, with adjustments made in real-time.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="bg-yoga-blue/10 p-3 rounded-full">
                      <Video className="h-6 w-6 text-yoga-blue" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Remote Convenience</h3>
                      <p className="text-gray-600">
                        Access expert teachers from anywhere in the world through high-quality video sessions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
          
          <Separator />
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">What to Expect</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <ol className="space-y-4 list-decimal list-inside">
                  <li className="text-lg">
                    <span className="font-medium">Initial Consultation</span>
                    <p className="text-gray-600 ml-6 mt-1">
                      Your first session typically begins with a discussion about your goals, physical condition, and any specific concerns or limitations.
                    </p>
                  </li>
                  <li className="text-lg">
                    <span className="font-medium">Personalized Practice Design</span>
                    <p className="text-gray-600 ml-6 mt-1">
                      Your teacher will create a custom sequence of poses and techniques specifically for your needs.
                    </p>
                  </li>
                  <li className="text-lg">
                    <span className="font-medium">Detailed Instructions</span>
                    <p className="text-gray-600 ml-6 mt-1">
                      Receive precise guidance on alignment, breathing, and modifications for each pose.
                    </p>
                  </li>
                  <li className="text-lg">
                    <span className="font-medium">Immediate Feedback</span>
                    <p className="text-gray-600 ml-6 mt-1">
                      Get real-time corrections and suggestions to improve your practice.
                    </p>
                  </li>
                  <li className="text-lg">
                    <span className="font-medium">Practice Materials</span>
                    <p className="text-gray-600 ml-6 mt-1">
                      Many teachers provide notes, recordings, or practice guides to help you continue your practice between sessions.
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          </section>
          
          <Separator />
          
          <section>
            <h2 className="text-2xl font-semibold mb-6">Our Teacher Standards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-yoga-blue/10 p-4 rounded-full mb-3">
                  <Star className="h-6 w-6 text-yoga-blue" />
                </div>
                <h3 className="font-medium text-lg">Certified Expertise</h3>
                <p className="text-gray-600 mt-2">
                  All our teachers have reputable certifications and extensive training in their yoga specialties.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-yoga-blue/10 p-4 rounded-full mb-3">
                  <Clock className="h-6 w-6 text-yoga-blue" />
                </div>
                <h3 className="font-medium text-lg">Experience</h3>
                <p className="text-gray-600 mt-2">
                  Teachers have demonstrated teaching experience and a proven track record of student satisfaction.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-yoga-blue/10 p-4 rounded-full mb-3">
                  <Sparkles className="h-6 w-6 text-yoga-blue" />
                </div>
                <h3 className="font-medium text-lg">Continuous Learning</h3>
                <p className="text-gray-600 mt-2">
                  Our teachers regularly update their knowledge and skills through continuing education.
                </p>
              </div>
            </div>
          </section>
          
          <Separator />
          
          <section className="bg-yoga-blue/5 p-8 rounded-lg">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
              <p className="text-gray-700 mb-6">
                Browse our selection of expert yoga teachers and book your first 1-on-1 session today. 
                Your personalized yoga journey begins with just a few clicks.
              </p>
              <div className="flex justify-center gap-4">
                <a 
                  href="/teachers" 
                  className="bg-yoga-blue hover:bg-yoga-blue/90 text-white px-6 py-3 rounded-md font-medium"
                >
                  Find a Teacher
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherLearn;
