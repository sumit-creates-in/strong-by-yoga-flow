
import React from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const TeacherLearn = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Learn About Teaching</h1>
        
        <Tabs defaultValue="getting-started">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="getting-started">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started as a Teacher</CardTitle>
                <CardDescription>
                  Learn how to set up your profile, schedule sessions, and connect with students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Complete Your Profile</h3>
                    <p className="mb-4">A complete and detailed profile helps students find you and understand your teaching style.</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Upload a professional profile photo</li>
                      <li>Write a comprehensive bio highlighting your experience and approach</li>
                      <li>List your certifications and specialties</li>
                      <li>Share your teaching philosophy</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Set Your Availability</h3>
                    <p className="mb-4">Make sure to keep your calendar updated so students can book sessions when you're available.</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Set recurring availability for consistency</li>
                      <li>Block off time when you have other commitments</li>
                      <li>Consider time zones of your potential students</li>
                      <li>Allow buffer time between sessions (recommended 15-30 minutes)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Create Session Types</h3>
                    <p className="mb-4">Offer different types of sessions to cater to various student needs.</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Define session durations (e.g., 30, 60, 90 minutes)</li>
                      <li>Set appropriate credit prices based on your expertise and session length</li>
                      <li>Provide detailed descriptions of what each session type includes</li>
                      <li>Consider offering introductory sessions for new students</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Connect Your Zoom Account</h3>
                    <p className="mb-4">Virtual sessions are conducted through Zoom. Make sure your account is properly connected.</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Link your professional Zoom account</li>
                      <li>Test your audio and video setup regularly</li>
                      <li>Ensure you have a stable internet connection</li>
                      <li>Set up a dedicated, distraction-free teaching space</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="best-practices">
            <Card>
              <CardHeader>
                <CardTitle>Teaching Best Practices</CardTitle>
                <CardDescription>
                  Tips and guidelines for providing the best possible experience for your students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Before the Session</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Review the student's information and any notes from previous sessions</li>
                      <li>Prepare your teaching space 15 minutes before the session starts</li>
                      <li>Test your camera and microphone</li>
                      <li>Have all necessary props and equipment ready</li>
                      <li>Send a reminder message if the platform allows</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">During the Session</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Start on time and welcome the student warmly</li>
                      <li>Ask about any specific concerns or goals for the session</li>
                      <li>Offer modifications for different skill levels</li>
                      <li>Provide clear, concise instructions</li>
                      <li>Balance demonstration with observation of the student</li>
                      <li>Give constructive feedback in a supportive manner</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">After the Session</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Thank the student for participating</li>
                      <li>Summarize key points from the session</li>
                      <li>Suggest home practice if appropriate</li>
                      <li>Encourage booking future sessions if they found value</li>
                      <li>Make notes about the session for future reference</li>
                      <li>Ask for feedback to improve your teaching</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Building Student Relationships</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Remember personal details shared by students</li>
                      <li>Track progress and acknowledge improvements</li>
                      <li>Maintain professional boundaries</li>
                      <li>Be responsive to messages and questions</li>
                      <li>Show genuine interest in their wellness journey</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Common questions from yoga teachers on our platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">How am I paid for sessions?</h3>
                    <p>Teachers are paid based on the credits earned from sessions. The platform handles all payment processing, and you'll receive payouts according to the schedule specified in your teacher agreement. Each credit has a monetary value that is converted to your local currency.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">What happens if a student cancels?</h3>
                    <p>Our cancellation policy protects teachers from last-minute cancellations. If a student cancels within your specified minimum cancellation window (which you can set for each session type), you'll still receive a percentage of the credits. The exact percentage depends on how close to the session time the cancellation occurred.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Can I offer group sessions?</h3>
                    <p>Yes, you can create group session types that allow multiple students to book the same time slot. You can set a minimum and maximum number of participants. Group sessions typically have a lower per-student credit cost but can be more profitable overall.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">How do I handle technical difficulties?</h3>
                    <p>If you experience technical issues during a session, first try simple troubleshooting like refreshing the browser or restarting the Zoom call. If problems persist, contact our support team immediately. We recommend having a backup plan (like phone call instructions) to share with students in case of severe technical problems.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Can I offer downloadable materials to my students?</h3>
                    <p>Yes, you can upload supplementary materials like practice guides, pose breakdowns, or meditation scripts for your students. These can be attached to specific session types or made available to all your students. This is a great way to provide additional value and help students practice between sessions.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Resources for Teachers</CardTitle>
                <Badge className="ml-2">New</Badge>
              </div>
              <CardDescription>
                Helpful materials to enhance your teaching practice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium mb-2">Teaching Online: Best Practices</h3>
                  <p className="text-muted-foreground mb-4">A comprehensive guide to creating engaging virtual yoga sessions</p>
                  <a href="#" className="text-primary hover:underline">Download PDF →</a>
                </div>
                
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium mb-2">Verbal Cues Cheat Sheet</h3>
                  <p className="text-muted-foreground mb-4">Clear, concise language to guide students through poses safely</p>
                  <a href="#" className="text-primary hover:underline">Download PDF →</a>
                </div>
                
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium mb-2">Sequencing Templates</h3>
                  <p className="text-muted-foreground mb-4">Sample class plans for different durations and focus areas</p>
                  <a href="#" className="text-primary hover:underline">Download PDF →</a>
                </div>
                
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium mb-2">Marketing Your Services</h3>
                  <p className="text-muted-foreground mb-4">Tips for promoting your sessions and building your student base</p>
                  <a href="#" className="text-primary hover:underline">Download PDF →</a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherLearn;
