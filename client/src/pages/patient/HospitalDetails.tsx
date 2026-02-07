import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Bed, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Building2,
  Heart,
  Shield,
  Award,
  CheckCircle,
  AlertCircle,
  User,
  Stethoscope,
  Calendar,
  MessageCircle
} from 'lucide-react';

const HospitalDetails: React.FC = () => {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const hospital = location.state?.hospital;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (!hospital) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-7xl mx-auto">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-health-charcoal mb-2">Hospital Not Found</h2>
          <p className="text-health-charcoal/60 mb-4">The hospital information could not be loaded.</p>
          <Button onClick={() => navigate('/patient/bed-availability')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bed Availability
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/patient/bed-availability')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bed Availability
        </Button>
        
        <h1 className="text-3xl font-montserrat font-bold text-health-teal mb-1">{hospital.hospitalName}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {renderStars(hospital.rating)}
            <span className="text-sm text-health-charcoal/60 ml-1">({hospital.rating})</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-health-charcoal/60">
            <MapPin className="h-4 w-4" />
            {hospital.location}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-health-aqua" />
                </div>
                Hospital Information
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="amenities">Amenities</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-health-charcoal mb-4">About {hospital.hospitalName}</h3>
                    <p className="text-health-charcoal/80 leading-relaxed">
                      {hospital.description}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold text-health-charcoal mb-4">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      {hospital.specializations.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-health-aqua border-health-aqua/20">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold text-health-charcoal mb-4">Insurance Accepted</h3>
                    <div className="flex flex-wrap gap-2">
                      {hospital.insuranceAccepted.map((insurance, index) => (
                        <Badge key={index} variant="secondary">
                          {insurance}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold text-health-charcoal mb-4">Bed Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${hospital.bedFeatures.privateBathroom ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className="text-sm text-health-charcoal">Private Bathroom</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${hospital.bedFeatures.tv ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className="text-sm text-health-charcoal">TV</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${hospital.bedFeatures.wifi ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className="text-sm text-health-charcoal">WiFi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${hospital.bedFeatures.airConditioning ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className="text-sm text-health-charcoal">Air Conditioning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${hospital.bedFeatures.mealService ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className="text-sm text-health-charcoal">Meal Service</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${hospital.bedFeatures.nursingCare ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className="text-sm text-health-charcoal">Nursing Care</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="amenities" className="space-y-6 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-health-charcoal mb-4">General Amenities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hospital.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-health-charcoal">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold text-health-charcoal mb-4">Emergency Services</h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${hospital.emergencyServices ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className="text-sm text-health-charcoal">
                        {hospital.emergencyServices ? '24/7 Emergency Services Available' : 'Emergency Services Not Available'}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-health-charcoal mb-4">Patient Reviews</h3>
                    <div className="space-y-4">
                      {hospital.reviews.map((review, index) => (
                        <div key={index} className="border border-health-blue-gray/20 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-health-aqua/10 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-health-aqua" />
                              </div>
                              <span className="font-medium text-health-charcoal">{review.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <p className="text-health-charcoal/80 text-sm">{review.comment}</p>
                          <p className="text-health-charcoal/60 text-xs mt-2">{review.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <Bed className="h-5 w-5 text-health-aqua" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white"
                onClick={() => navigate('/patient/book-bed', { state: { hospital } })}
              >
                <Bed className="h-4 w-4 mr-2" />
                Book Bed
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(`tel:${hospital.contactNumber}`)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Hospital
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(`mailto:${hospital.email}`)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(hospital.website, '_blank')}
              >
                <Globe className="h-4 w-4 mr-2" />
                Visit Website
              </Button>
            </CardContent>
          </Card>

          {/* Hospital Stats */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <Award className="h-5 w-5 text-health-aqua" />
                </div>
                Hospital Stats
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-health-charcoal/60">Rating</span>
                <div className="flex items-center gap-1">
                  {renderStars(hospital.rating)}
                  <span className="font-medium text-health-charcoal">({hospital.rating})</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-health-charcoal/60">Available Beds</span>
                <span className="font-medium text-health-charcoal">{hospital.availableBeds}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-health-charcoal/60">Wait Time</span>
                <span className="font-medium text-health-charcoal">{hospital.waitingTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-health-charcoal/60">Price per Day</span>
                <span className="font-bold text-health-aqua">₹{hospital.price.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <Phone className="h-5 w-5 text-health-aqua" />
                </div>
                Contact Information
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-health-aqua" />
                <span className="text-sm text-health-charcoal">{hospital.contactNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-health-aqua" />
                <span className="text-sm text-health-charcoal">{hospital.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-health-aqua" />
                <span className="text-sm text-health-charcoal">{hospital.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-health-aqua" />
                <span className="text-sm text-health-charcoal">24/7 Emergency</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetails;
