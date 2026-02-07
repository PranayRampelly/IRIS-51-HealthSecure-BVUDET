
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'hello@healthtech.com',
      subtitle: 'support@healthtech.com'
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+1 (555) 123-4567',
      subtitle: 'Mon-Fri 9AM-6PM EST'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: '123 Innovation Drive',
      subtitle: 'San Francisco, CA 94105'
    },
    {
      icon: Clock,
      title: 'Response Time',
      content: '< 24 hours',
      subtitle: 'Average response time'
    }
  ];

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-montserrat font-bold text-health-teal mb-6">
            Get in Touch
          </h2>
          <div className="w-24 h-1 bg-health-aqua mx-auto mb-6"></div>
          <p className="text-xl text-health-charcoal/80 font-open-sans max-w-3xl mx-auto">
            Ready to revolutionize your healthcare data management? Let's discuss how HealthTech can transform your organization.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="border-health-blue-gray/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-montserrat font-semibold text-health-teal">
                Request a Demo
              </CardTitle>
              <p className="text-health-charcoal/70 font-open-sans">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-open-sans font-medium text-health-charcoal mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-health-blue-gray/30 rounded-lg focus:ring-2 focus:ring-health-aqua focus:border-health-aqua transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-open-sans font-medium text-health-charcoal mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-health-blue-gray/30 rounded-lg focus:ring-2 focus:ring-health-aqua focus:border-health-aqua transition-colors"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company" className="block text-sm font-open-sans font-medium text-health-charcoal mb-2">
                      Company/Organization
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-health-blue-gray/30 rounded-lg focus:ring-2 focus:ring-health-aqua focus:border-health-aqua transition-colors"
                      placeholder="Healthcare Corp"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-open-sans font-medium text-health-charcoal mb-2">
                      Your Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-health-blue-gray/30 rounded-lg focus:ring-2 focus:ring-health-aqua focus:border-health-aqua transition-colors"
                    >
                      <option value="">Select your role</option>
                      <option value="patient">Patient</option>
                      <option value="doctor">Healthcare Provider</option>
                      <option value="admin">Hospital Administrator</option>
                      <option value="insurer">Insurance Professional</option>
                      <option value="researcher">Researcher</option>
                      <option value="developer">Developer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-open-sans font-medium text-health-charcoal mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-health-blue-gray/30 rounded-lg focus:ring-2 focus:ring-health-aqua focus:border-health-aqua transition-colors resize-none"
                    placeholder="Tell us about your needs and how we can help..."
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-health-aqua hover:bg-health-aqua/90 text-white py-3 text-lg font-open-sans font-medium"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="grid gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="border-health-blue-gray/20 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-health-aqua/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-health-aqua" />
                      </div>
                      <div>
                        <h3 className="font-montserrat font-semibold text-health-teal mb-1">
                          {info.title}
                        </h3>
                        <p className="text-health-charcoal font-open-sans">
                          {info.content}
                        </p>
                        <p className="text-sm text-health-charcoal/60 font-open-sans">
                          {info.subtitle}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="border-health-blue-gray/20 bg-gradient-to-br from-health-teal/5 to-health-aqua/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-montserrat font-semibold text-health-teal mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-health-teal text-health-teal hover:bg-health-teal hover:text-white"
                    onClick={() => window.location.href = '/contact'}
                  >
                    <Mail className="w-4 h-4 mr-3" />
                    Schedule Live Demo
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-health-aqua text-health-aqua hover:bg-health-aqua hover:text-white"
                    onClick={() => window.location.href = '/contact'}
                  >
                    <Phone className="w-4 h-4 mr-3" />
                    Request Callback
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-health-success text-health-success hover:bg-health-success hover:text-white"
                    onClick={() => window.location.href = '/resources'}
                  >
                    <MapPin className="w-4 h-4 mr-3" />
                    Download White Paper
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
