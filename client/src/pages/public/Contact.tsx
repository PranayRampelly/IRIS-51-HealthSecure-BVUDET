
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-white font-open-sans">
      <Header />
      
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-montserrat font-bold text-health-teal mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-health-charcoal max-w-3xl mx-auto">
              Ready to implement secure healthcare data exchange? Get in touch with our team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-montserrat">Request a Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Enter your first name" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Enter your last name" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="Enter your email" />
                  </div>

                  <div>
                    <Label htmlFor="organization">Organization</Label>
                    <Input id="organization" placeholder="Your hospital, clinic, or company" />
                  </div>

                  <div>
                    <Label htmlFor="role">Your Role</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="healthcare-provider">Healthcare Provider</SelectItem>
                        <SelectItem value="insurance">Insurance Professional</SelectItem>
                        <SelectItem value="researcher">Medical Researcher</SelectItem>
                        <SelectItem value="it-admin">IT Administrator</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us about your use case and requirements"
                      rows={4}
                    />
                  </div>

                  <Button className="w-full bg-health-teal hover:bg-health-teal/90">
                    Request Demo
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-health-teal mt-1" />
                    <div>
                      <h3 className="font-semibold text-health-teal mb-2">Email</h3>
                      <p className="text-health-charcoal">contact@healthtech.com</p>
                      <p className="text-health-charcoal">support@healthtech.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-health-aqua mt-1" />
                    <div>
                      <h3 className="font-semibold text-health-teal mb-2">Phone</h3>
                      <p className="text-health-charcoal">+1 (555) 123-4567</p>
                      <p className="text-sm text-health-charcoal/70">24/7 Support Available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-health-success mt-1" />
                    <div>
                      <h3 className="font-semibold text-health-teal mb-2">Office</h3>
                      <p className="text-health-charcoal">123 Healthcare Blvd</p>
                      <p className="text-health-charcoal">Medical District, CA 90210</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Clock className="w-6 h-6 text-health-warning mt-1" />
                    <div>
                      <h3 className="font-semibold text-health-teal mb-2">Business Hours</h3>
                      <p className="text-health-charcoal">Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                      <p className="text-health-charcoal">Emergency Support: 24/7</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
