import React, { useState, useEffect } from 'react';
import pharmacyPriceComparisonService from '@/services/pharmacyPriceComparisonService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, Search, Filter, Star, DollarSign, Truck, ShoppingCart,
  Heart, Share2, Info, Clock, Package, MapPin, Phone, MessageSquare,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, TrendingUp,
  TrendingDown, Minus, Award, CreditCard, Building, Download, Printer, Shield
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import patientCartService from '@/services/patientCartService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  distance: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  insuranceAccepted: boolean;
  discountPrograms: string[];
  contact: {
    phone: string;
    email: string;
  };
}

interface MedicinePrice {
  medicineId: string | number;
  medicineName: string;
  dosage: string;
  form: string;
  manufacturer?: string;
  description?: string;
  cloudinaryUrl?: string;
  category?: string;
  prescriptionRequired?: boolean;
  pharmacies: Array<{
    pharmacyId: string | number;
    pharmacyName: string;
    genericPrice: number;
    brandPrice: number;
    insurancePrice?: number;
    savings: number;
    inStock: boolean;
    quantity: number;
    deliveryTime: string;
    rating: number;
    reviews?: number;
  }>;
}


const PriceComparison = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<MedicinePrice[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<MedicinePrice[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicinePrice | null>(null);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('savings');
  const [selectedInsurance, setSelectedInsurance] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [timeRange, setTimeRange] = useState<'30'|'90'|'365'|'all'>('90');
  const [dialogSortBy, setDialogSortBy] = useState<'generic'|'brand'|'savings'|'rating'|'delivery'>('generic');
  const [activeChips, setActiveChips] = useState<string[]>([]); // reserved (not shown in UI)
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareMethod, setShareMethod] = useState<'email'|'whatsapp'|'copy'>('email');
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  // Mock data
  const mockMedicines: MedicinePrice[] = [
    {
      medicineId: 1,
      medicineName: 'Amoxicillin',
      dosage: '500mg',
      form: 'Capsule',
      pharmacies: [
        {
          pharmacyId: 1,
          pharmacyName: 'City Pharmacy',
          genericPrice: 12.50,
          brandPrice: 45.00,
          insurancePrice: 8.75,
          savings: 32.50,
          inStock: true,
          quantity: 50,
          deliveryTime: '2-3 hours',
          rating: 4.5
        },
        {
          pharmacyId: 2,
          pharmacyName: 'Metro Drugs',
          genericPrice: 13.00,
          brandPrice: 48.00,
          insurancePrice: 9.10,
          savings: 35.00,
          inStock: true,
          quantity: 30,
          deliveryTime: '3-4 hours',
          rating: 4.2
        },
        {
          pharmacyId: 3,
          pharmacyName: 'Health Plus',
          genericPrice: 11.75,
          brandPrice: 42.00,
          insurancePrice: 8.23,
          savings: 30.25,
          inStock: true,
          quantity: 25,
          deliveryTime: '1-2 hours',
          rating: 4.8
        }
      ]
    },
    {
      medicineId: 2,
      medicineName: 'Ibuprofen',
      dosage: '400mg',
      form: 'Tablet',
      pharmacies: [
        {
          pharmacyId: 1,
          pharmacyName: 'City Pharmacy',
          genericPrice: 8.75,
          brandPrice: 28.00,
          savings: 19.25,
          inStock: true,
          quantity: 100,
          deliveryTime: '1-2 hours',
          rating: 4.5
        },
        {
          pharmacyId: 2,
          pharmacyName: 'Metro Drugs',
          genericPrice: 9.00,
          brandPrice: 30.00,
          savings: 21.00,
          inStock: true,
          quantity: 75,
          deliveryTime: '2-3 hours',
          rating: 4.2
        },
        {
          pharmacyId: 4,
          pharmacyName: 'Quick Pharmacy',
          genericPrice: 8.50,
          brandPrice: 27.50,
          savings: 19.00,
          inStock: true,
          quantity: 60,
          deliveryTime: 'Same day',
          rating: 4.6
        }
      ]
    },
    {
      medicineId: 3,
      medicineName: 'Vitamin D3',
      dosage: '1000IU',
      form: 'Softgel',
      pharmacies: [
        {
          pharmacyId: 1,
          pharmacyName: 'City Pharmacy',
          genericPrice: 15.00,
          brandPrice: 35.00,
          insurancePrice: 12.00,
          savings: 20.00,
          inStock: true,
          quantity: 75,
          deliveryTime: '2-4 hours',
          rating: 4.5
        },
        {
          pharmacyId: 5,
          pharmacyName: 'Wellness Pharmacy',
          genericPrice: 15.50,
          brandPrice: 36.00,
          insurancePrice: 12.40,
          savings: 20.50,
          inStock: true,
          quantity: 40,
          deliveryTime: '3-5 hours',
          rating: 4.7
        },
        {
          pharmacyId: 6,
          pharmacyName: 'Natural Health',
          genericPrice: 14.25,
          brandPrice: 33.00,
          insurancePrice: 11.40,
          savings: 18.75,
          inStock: true,
          quantity: 50,
          deliveryTime: '2-3 hours',
          rating: 4.4
        }
      ]
    },
    {
      medicineId: 4,
      medicineName: 'Omeprazole',
      dosage: '20mg',
      form: 'Capsule',
      pharmacies: [
        {
          pharmacyId: 1,
          pharmacyName: 'City Pharmacy',
          genericPrice: 22.50,
          brandPrice: 65.00,
          insurancePrice: 15.75,
          savings: 42.50,
          inStock: true,
          quantity: 30,
          deliveryTime: '3-4 hours',
          rating: 4.5
        },
        {
          pharmacyId: 7,
          pharmacyName: 'Digestive Care',
          genericPrice: 23.00,
          brandPrice: 68.00,
          insurancePrice: 16.10,
          savings: 45.00,
          inStock: true,
          quantity: 20,
          deliveryTime: '4-6 hours',
          rating: 4.6
        },
        {
          pharmacyId: 8,
          pharmacyName: 'Gastro Pharmacy',
          genericPrice: 21.75,
          brandPrice: 62.00,
          insurancePrice: 15.23,
          savings: 40.25,
          inStock: true,
          quantity: 35,
          deliveryTime: '2-3 hours',
          rating: 4.3
        }
      ]
    }
  ];

  // Removed Insurance Plans summary block per request

  useEffect(() => {
    const load = async () => {
      try {
    setLoading(true);
        const data = await pharmacyPriceComparisonService.getPriceComparison();
        if (Array.isArray((data as any)?.medicines) && (data as any).medicines.length > 0) {
          setMedicines((data as any).medicines);
          setFilteredMedicines((data as any).medicines);
        } else {
      setMedicines(mockMedicines);
      setFilteredMedicines(mockMedicines);
        }
      } catch (e) {
        setMedicines(mockMedicines);
        setFilteredMedicines(mockMedicines);
      } finally {
      setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let filtered = medicines;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(medicine =>
        medicine.medicineName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply quick chips filters
    if (activeChips.includes('insurance')) {
      filtered = filtered.filter(m => m.pharmacies.some(p => typeof p.insurancePrice === 'number'));
    }
    if (activeChips.includes('inStock')) {
      filtered = filtered.filter(m => m.pharmacies.some(p => (p as any).inStock === true));
    }
    if (activeChips.includes('sameDay')) {
      filtered = filtered.filter(m => m.pharmacies.some(p => (p.deliveryTime || '').toLowerCase().includes('same')));
    }

    // Apply sorting
    switch (sortBy) {
      case 'savings':
        filtered.sort((a, b) => {
          const maxSavingsA = Math.max(...a.pharmacies.map(p => p.savings));
          const maxSavingsB = Math.max(...b.pharmacies.map(p => p.savings));
          return maxSavingsB - maxSavingsA;
        });
        break;
      case 'priceLow':
        filtered.sort((a, b) => {
          const minPriceA = Math.min(...a.pharmacies.map(p => p.genericPrice));
          const minPriceB = Math.min(...b.pharmacies.map(p => p.genericPrice));
          return minPriceA - minPriceB;
        });
        break;
      case 'priceHigh':
        filtered.sort((a, b) => {
          const maxPriceA = Math.max(...a.pharmacies.map(p => p.genericPrice));
          const maxPriceB = Math.max(...b.pharmacies.map(p => p.genericPrice));
          return maxPriceB - maxPriceA;
        });
        break;
      case 'rating':
        filtered.sort((a, b) => {
          const avgRatingA = a.pharmacies.reduce((sum, p) => sum + p.rating, 0) / a.pharmacies.length;
          const avgRatingB = b.pharmacies.reduce((sum, p) => sum + p.rating, 0) / b.pharmacies.length;
          return avgRatingB - avgRatingA;
        });
        break;
      case 'name':
        filtered.sort((a, b) => a.medicineName.localeCompare(b.medicineName));
        break;
    }

    setFilteredMedicines(filtered);
  }, [searchQuery, sortBy, medicines, activeChips]);

  const getBestPrice = (medicine: MedicinePrice) => {
    return Math.min(...medicine.pharmacies.map(p => p.genericPrice));
  };

  const getBestSavings = (medicine: MedicinePrice) => {
    return Math.max(...medicine.pharmacies.map(p => p.savings));
  };

  const getAverageRating = (medicine: MedicinePrice) => {
    const avg = medicine.pharmacies.reduce((sum, p) => sum + p.rating, 0) / medicine.pharmacies.length;
    return avg.toFixed(1);
  };

  const getPriceTrend = (medicine: MedicinePrice) => {
    const prices = medicine.pharmacies.map(p => p.genericPrice);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const variance = maxPrice - minPrice;
    
    if (variance < 2) return 'stable';
    if (minPrice < avgPrice * 0.9) return 'decreasing';
    return 'increasing';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'decreasing':
        return 'Prices decreasing';
      case 'increasing':
        return 'Prices increasing';
      default:
        return 'Prices stable';
    }
  };

  // Aggregated KPIs for header
  const totalMedicines = medicines.length;
  const allPharmacies = new Set<string | number>();
  medicines.forEach(m => m.pharmacies.forEach(p => allPharmacies.add(p.pharmacyId)));
  const pharmaciesCount = allPharmacies.size;
  const overallBestSavings = medicines.length ? Math.max(...medicines.map(getBestSavings)) : 0;
  const overallBestPrice = medicines.length ? Math.min(...medicines.map(getBestPrice)) : 0;
  const overallAvgRating = medicines.length ? (
    medicines.reduce((sum, m) => sum + Number(getAverageRating(m)), 0) / medicines.length
  ).toFixed(1) : '0.0';

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

  const exportSelectedToCSV = (m: MedicinePrice) => {
    try {
    const headers = ['Pharmacy','Generic Price','Brand Price','Insurance Price','Savings','Rating','Delivery','Stock'];
    const rows = m.pharmacies.map(p => [
      p.pharmacyName,
      p.genericPrice,
      p.brandPrice,
      p.insurancePrice ?? '',
      p.savings,
      p.rating,
      p.deliveryTime,
      p.inStock ? 'In Stock' : 'Out of Stock'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
      a.download = `${m.medicineName}-price-comparison.csv`;
    a.click();
    URL.revokeObjectURL(url);
      toast({ title: 'Success', description: 'CSV exported successfully' });
    } catch (error) {
      console.error('Export failed:', error);
      toast({ title: 'Export Failed', description: 'Could not export CSV', variant: 'destructive' });
    }
  };
  const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase();

  // Highlights for header left-bottom
  const allPharmacyRows = medicines.flatMap(m => m.pharmacies.map(p => ({ ...p, medicineName: m.medicineName })));
  const cheapestOverall = allPharmacyRows.length ? allPharmacyRows.reduce((b,p)=> p.genericPrice < b.genericPrice ? p : b, allPharmacyRows[0]) : null;
  const median = (arr: number[]) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a,b)=>a-b);
    const mid = Math.floor(s.length/2);
    return s.length % 2 ? s[mid] : (s[mid-1] + s[mid]) / 2;
  };
  const minPerMedicine = medicines.map(m => Math.min(...m.pharmacies.map(p=>p.genericPrice)));
  const medianMinPrice = median(minPerMedicine);
  const firstHour = (txt?: string) => { const m = /(\d+)/.exec(txt || ''); return m ? Number(m[1]) : Infinity; };
  const fastestOverall = allPharmacyRows.length ? allPharmacyRows.reduce((b,p)=> firstHour(p.deliveryTime) < firstHour(b.deliveryTime) ? p : b, allPharmacyRows[0]) : null;

  const printComparison = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow && selectedMedicine) {
        const printContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Price Comparison - ${selectedMedicine.medicineName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .medicine-info { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .summary { margin-top: 30px; padding: 15px; background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Price Comparison Report</h1>
              <h2>${selectedMedicine.medicineName}</h2>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="medicine-info">
              <p><strong>Dosage:</strong> ${selectedMedicine.dosage}</p>
              <p><strong>Form:</strong> ${selectedMedicine.form}</p>
              <p><strong>Category:</strong> ${selectedMedicine.category || 'General'}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Pharmacy</th>
                  <th>Generic Price</th>
                  <th>Brand Price</th>
                  <th>Insurance Price</th>
                  <th>Savings</th>
                  <th>Rating</th>
                  <th>Delivery</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                ${selectedMedicine.pharmacies.map(p => `
                  <tr>
                    <td>${p.pharmacyName}</td>
                    <td>₹${p.genericPrice}</td>
                    <td>₹${p.brandPrice}</td>
                    <td>${p.insurancePrice ? '₹' + p.insurancePrice : '-'}</td>
                    <td>₹${p.savings}</td>
                    <td>${p.rating}/5</td>
                    <td>${p.deliveryTime}</td>
                    <td>${p.inStock ? 'In Stock' : 'Out of Stock'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="summary">
              <h3>Summary</h3>
              <p><strong>Best Price:</strong> ₹${getBestPrice(selectedMedicine)}</p>
              <p><strong>Best Savings:</strong> ₹${getBestSavings(selectedMedicine)}</p>
              <p><strong>Average Rating:</strong> ${getAverageRating(selectedMedicine)}/5</p>
              <p><strong>Total Pharmacies:</strong> ${selectedMedicine.pharmacies.length}</p>
            </div>
          </body>
          </html>
        `;
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        toast({ title: 'Success', description: 'Print window opened' });
      }
    } catch (error) {
      console.error('Print failed:', error);
      toast({ title: 'Print Failed', description: 'Could not open print window', variant: 'destructive' });
    }
  };

  const shareComparison = async () => {
    if (!selectedMedicine) return;
    
    try {
      const comparisonData = {
        medicine: selectedMedicine.medicineName,
        dosage: selectedMedicine.dosage,
        bestPrice: getBestPrice(selectedMedicine),
        bestSavings: getBestSavings(selectedMedicine),
        pharmacies: selectedMedicine.pharmacies.length,
        url: window.location.href
      };

      if (shareMethod === 'copy') {
        const text = `Check out ${comparisonData.medicine} price comparison:\nBest Price: ₹${comparisonData.bestPrice}\nBest Savings: ₹${comparisonData.bestSavings}\nAvailable at ${comparisonData.pharmacies} pharmacies\n\nView full comparison: ${comparisonData.url}`;
        await navigator.clipboard.writeText(text);
        toast({ title: 'Copied!', description: 'Comparison details copied to clipboard' });
        setShowShareDialog(false);
      } else if (shareMethod === 'whatsapp') {
        const text = encodeURIComponent(`Check out ${comparisonData.medicine} price comparison:\nBest Price: ₹${comparisonData.bestPrice}\nBest Savings: ₹${comparisonData.bestSavings}\nAvailable at ${comparisonData.pharmacies} pharmacies\n\nView full comparison: ${comparisonData.url}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
        setShowShareDialog(false);
      } else if (shareMethod === 'email') {
        if (!shareEmail.trim()) {
          toast({ title: 'Error', description: 'Please enter an email address', variant: 'destructive' });
          return;
        }
        
        const subject = encodeURIComponent(`Price Comparison: ${comparisonData.medicine}`);
        const body = encodeURIComponent(`Hi,\n\nI found this great price comparison for ${comparisonData.medicine}:\n\nBest Price: ₹${comparisonData.bestPrice}\nBest Savings: ₹${comparisonData.bestSavings}\nAvailable at ${comparisonData.pharmacies} pharmacies\n\nView full comparison: ${comparisonData.url}\n\nBest regards`);
        
        window.open(`mailto:${shareEmail}?subject=${subject}&body=${body}`, '_blank');
        setShowShareDialog(false);
        toast({ title: 'Email Opened', description: 'Email client opened with comparison details' });
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast({ title: 'Share Failed', description: 'Could not share comparison', variant: 'destructive' });
    }
  };

  const addToCart = async (medicine: MedicinePrice, pharmacyId?: string | number) => {
    try {
      const targetPharmacy = pharmacyId 
        ? medicine.pharmacies.find(p => p.pharmacyId === pharmacyId)
        : medicine.pharmacies.find(p => p.inStock) || medicine.pharmacies[0];
      
      if (!targetPharmacy) {
        toast({ title: 'Error', description: 'No pharmacy available', variant: 'destructive' });
        return;
      }

      await patientCartService.addToCart({
        medicineId: String(medicine.medicineId),
        variant: 'generic',
        quantity: 1,
        packSize: 10,
        pharmacy: String(targetPharmacy.pharmacyId || '68a7441bd3e6a75f76e88955'),
        insuranceApplied: !!targetPharmacy.insurancePrice,
      });
      
      toast({ title: 'Success', description: `${medicine.medicineName} added to cart` });
      navigate('/patient/pharmacy/cart');
    } catch (error) {
      console.error('Add to cart failed:', error);
      toast({ title: 'Error', description: 'Failed to add item to cart', variant: 'destructive' });
    }
  };

  const orderBestPrice = async () => {
    if (!selectedMedicine) return;
    
    try {
      const bestPrice = Math.min(...selectedMedicine.pharmacies.map(p => p.genericPrice));
      const bestPharmacy = selectedMedicine.pharmacies.find(p => p.genericPrice === bestPrice) || selectedMedicine.pharmacies[0];
      
      if (!bestPharmacy) {
        toast({ title: 'Error', description: 'No pharmacy available', variant: 'destructive' });
        return;
      }

      await patientCartService.addToCart({
        medicineId: String(selectedMedicine.medicineId),
        variant: 'generic',
        quantity: 1,
        packSize: 10,
        pharmacy: String(bestPharmacy.pharmacyId || '68a7441bd3e6a75f76e88955'),
        insuranceApplied: !!bestPharmacy.insurancePrice,
      });
      
      toast({ title: 'Success', description: `${selectedMedicine.medicineName} added to cart at best price` });
      navigate('/patient/pharmacy/cart');
    } catch (error) {
      console.error('Order best price failed:', error);
      toast({ title: 'Error', description: 'Failed to add item at best price', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-health-teal"></div>
          <p className="mt-4 text-gray-600">Loading price comparisons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <button 
              onClick={() => window.location.href = '/patient/pharmacy'}
              className="hover:text-health-teal transition-colors"
            >
              Pharmacy Services
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">Price Comparison</span>
          </nav>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-teal-700">
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="max-w-xl">
                    <h1 className="text-3xl font-bold text-white">Price Comparison</h1>
                    <p className="text-teal-100 mt-2">Compare prices across pharmacies and maximize savings.</p>
                    {/* Highlights */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-md border border-white/20 bg-white/10 p-3 text-white">
                        <div className="text-xs text-teal-100">Cheapest Pharmacy</div>
                        <div className="text-sm font-semibold">{cheapestOverall ? cheapestOverall.pharmacyName : '—'}</div>
                        <div className="text-xs">{cheapestOverall ? formatCurrency(cheapestOverall.genericPrice) : ''}</div>
                      </div>
                      <div className="rounded-md border border-white/20 bg-white/10 p-3 text-white">
                        <div className="text-xs text-teal-100">Median Price</div>
                        <div className="text-sm font-semibold">{formatCurrency(medianMinPrice || 0)}</div>
                        <div className="text-xs">Across medicines</div>
                      </div>
                      <div className="rounded-md border border-white/20 bg-white/10 p-3 text-white">
                        <div className="text-xs text-teal-100">Fastest Delivery</div>
                        <div className="text-sm font-semibold">{fastestOverall?.deliveryTime || '—'}</div>
                        <div className="text-xs">{fastestOverall?.pharmacyName || ''}</div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-white/40 bg-white/90 backdrop-blur p-3 min-w-[200px] flex items-center gap-3 shadow-sm">
                      <div className="h-9 w-9 rounded-full bg-health-aqua/10 ring-1 ring-health-aqua/20 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-health-teal" />
                      </div>
                      <div>
                        <div className="text-xs text-health-blue-gray">Best Price</div>
                        <div className="text-xl font-semibold text-health-teal">{formatCurrency(Number(overallBestPrice.toFixed ? overallBestPrice.toFixed(2) : overallBestPrice))}</div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/40 bg-white/90 backdrop-blur p-3 min-w-[200px] flex items-center gap-3 shadow-sm">
                      <div className="h-9 w-9 rounded-full bg-health-aqua/10 ring-1 ring-health-aqua/20 flex items-center justify-center">
                        <TrendingDown className="h-4 w-4 text-health-teal" />
                      </div>
                      <div>
                        <div className="text-xs text-health-blue-gray">Best Savings</div>
                        <div className="text-xl font-semibold text-health-teal">{formatCurrency(Number(overallBestSavings.toFixed ? overallBestSavings.toFixed(2) : overallBestSavings))}</div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/40 bg-white/90 backdrop-blur p-3 min-w-[200px] flex items-center gap-3 shadow-sm">
                      <div className="h-9 w-9 rounded-full bg-yellow-50 ring-1 ring-yellow-100 flex items-center justify-center">
                        <Star className="h-4 w-4 text-yellow-700" />
                      </div>
                      <div>
                        <div className="text-xs text-health-blue-gray">Avg Rating</div>
                        <div className="text-xl font-semibold">{overallAvgRating}</div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/40 bg-white/90 backdrop-blur p-3 min-w-[200px] flex items-center gap-3 shadow-sm">
                      <div className="h-9 w-9 rounded-full bg-purple-50 ring-1 ring-purple-100 flex items-center justify-center">
                        <Building className="h-4 w-4 text-purple-700" />
                      </div>
                      <div>
                        <div className="text-xs text-health-blue-gray">Pharmacies</div>
                        <div className="text-xl font-semibold">{pharmaciesCount}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end">
                  <ToggleGroup type="single" value={timeRange} onValueChange={(v)=>v && setTimeRange(v as any)} className="bg-white/90 rounded-md p-1">
                    <ToggleGroupItem value="30" className="px-2">30d</ToggleGroupItem>
                    <ToggleGroupItem value="90" className="px-2">90d</ToggleGroupItem>
                    <ToggleGroupItem value="365" className="px-2">1y</ToggleGroupItem>
                    <ToggleGroupItem value="all" className="px-2">All</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search medicines to compare prices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Best Savings</SelectItem>
                  <SelectItem value="priceLow">Lowest Price</SelectItem>
                  <SelectItem value="priceHigh">Highest Price</SelectItem>
                  <SelectItem value="rating">Best Rated</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Insurance Plan</label>
                  <Select value={selectedInsurance} onValueChange={setSelectedInsurance}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Insurance Plans" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Insurance Plans</SelectItem>
                      <SelectItem value="bcbs">Blue Cross Blue Shield</SelectItem>
                      <SelectItem value="aetna">Aetna</SelectItem>
                      <SelectItem value="cigna">Cigna</SelectItem>
                      <SelectItem value="none">No Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
                  <Select value="all" onValueChange={() => {}}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under10">Under ₹10</SelectItem>
                      <SelectItem value="10-25">₹10 - ₹25</SelectItem>
                      <SelectItem value="25-50">₹25 - ₹50</SelectItem>
                      <SelectItem value="over50">Over ₹50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Delivery</label>
                  <Select value="all" onValueChange={() => {}}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Delivery" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Delivery</SelectItem>
                      <SelectItem value="sameDay">Same Day</SelectItem>
                      <SelectItem value="nextDay">Next Day</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insurance Plans Summary removed */}

        {/* Results */}
        <div className="space-y-4">
          {filteredMedicines.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">Showing {filteredMedicines.length} of {medicines.length} medicines</p>
                <div className="text-xs text-gray-500">Time range: {timeRange}</div>
              </div>

              {filteredMedicines.map((medicine) => (
                <Card key={medicine.medicineId} className="hover:shadow-md transition-all border border-emerald-100/70 rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-emerald-50 rounded-xl ring-1 ring-emerald-200">
                          {medicine.cloudinaryUrl ? (
                            <img 
                              src={medicine.cloudinaryUrl} 
                              alt={medicine.medicineName}
                              className="h-12 w-12 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const nextElement = target.nextElementSibling as HTMLElement;
                                if (nextElement) {
                                  nextElement.style.display = 'block';
                                }
                              }}
                            />
                          ) : null}
                          <BarChart3 className={`h-6 w-6 text-emerald-700 ${medicine.cloudinaryUrl ? 'hidden' : ''}`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">{medicine.medicineName}</h3>
                            <Badge variant="outline">{medicine.dosage}</Badge>
                              {medicine.prescriptionRequired && (
                                <Badge className="bg-rose-100 text-rose-800">Prescription Required</Badge>
                              )}
                              {medicine.category && (
                                <Badge className="bg-blue-100 text-blue-800">{medicine.category}</Badge>
                              )}
                          </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedMedicine(medicine);
                                  setShowComparisonDialog(true);
                                }}
                              >
                                <BarChart3 className="h-4 w-4 text-emerald-700" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // In a real app, this would save to user's favorites
                                  const isFavorite = Math.random() > 0.5; // Simulate toggle
                                  toast({ 
                                    title: isFavorite ? 'Added to Favorites' : 'Removed from Favorites', 
                                    description: `${medicine.medicineName} ${isFavorite ? 'added to' : 'removed from'} your favorites` 
                                  });
                                }}
                              >
                                <Heart className="h-4 w-4 text-gray-400" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={async () => {
                                try {
                                  const shareText = `${medicine.medicineName} - ${medicine.dosage} ${medicine.form}\nBest Price: ₹${getBestPrice(medicine)}\nBest Savings: ₹${getBestSavings(medicine)}\nAvailable at ${medicine.pharmacies.length} pharmacies`;
                                  await navigator.clipboard.writeText(shareText);
                                  toast({ title: 'Copied!', description: 'Medicine details copied to clipboard' });
                                } catch (error) {
                                  toast({ title: 'Error', description: 'Could not copy to clipboard', variant: 'destructive' });
                                }
                              }}>
                                <Share2 className="h-4 w-4 text-gray-400" />
                              </Button>
                            </div>
                          </div>

                          {medicine.description && (
                            <p className="text-sm text-gray-600 mb-3">{medicine.description}</p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-gray-600">
                                {getAverageRating(medicine)} ({medicine.pharmacies.reduce((sum, p) => sum + (p.reviews || 0), 0)} reviews)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-emerald-700" />
                              <span className="text-sm font-medium text-green-600">
                                From {formatCurrency(getBestPrice(medicine))}
                              </span>
                              {medicine.pharmacies.some(p => p.insurancePrice) && (
                                <Badge className="bg-green-100 text-green-800">Insurance</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <TrendingDown className="h-4 w-4 text-emerald-700" />
                              <span className="text-sm text-gray-600">
                                Save up to {formatCurrency(getBestSavings(medicine))}
                              </span>
                            </div>
                          </div>

                          {/* Pharmacy Options */}
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Available at {medicine.pharmacies.length} pharmacies:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {medicine.pharmacies.map((pharmacy, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded">
                                  <div>
                                    <p className="text-sm font-medium">{pharmacy.pharmacyName}</p>
                                    <p className="text-xs text-gray-500">{pharmacy.deliveryTime}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">{formatCurrency(pharmacy.genericPrice)}</p>
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 text-yellow-500" />
                                      <span className="text-xs">{pharmacy.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMedicine(medicine);
                            setShowComparisonDialog(true);
                          }}
                        >
                          <BarChart3 className="h-4 w-4 mr-1 text-emerald-700" />
                          Compare
                        </Button>
                        <Button 
                          size="sm" 
                          disabled={!medicine.pharmacies.some(p => p.inStock)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => addToCart(medicine)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          toast({ 
                            title: 'Location Services', 
                            description: 'Opening map to find nearby pharmacies...' 
                          });
                          // In a real app, this would open a map or location picker
                          setTimeout(() => {
                            toast({ 
                              title: 'Map Opened', 
                              description: 'Showing pharmacies within 5km radius' 
                            });
                          }, 1000);
                        }}>
                          <MapPin className="h-4 w-4 mr-1" />
                          Find Nearby
                                    </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>

        {/* Detailed Comparison Dialog */}
        <Dialog open={showComparisonDialog} onOpenChange={setShowComparisonDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-health-teal" />
                <span>Detailed Price Comparison</span>
              </DialogTitle>
            </DialogHeader>
            {selectedMedicine && (
              <div className="space-y-6">
                {/* Header */}
                <div className="rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-teal-700">
                    <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-4 bg-white/20 rounded-lg ring-1 ring-white/30">
                          {selectedMedicine.cloudinaryUrl ? (
                            <img 
                              src={selectedMedicine.cloudinaryUrl} 
                              alt={selectedMedicine.medicineName}
                              className="h-16 w-16 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const nextElement = target.nextElementSibling as HTMLElement;
                                if (nextElement) {
                                  nextElement.style.display = 'block';
                                }
                              }}
                            />
                          ) : null}
                          <BarChart3 className={`h-10 w-10 text-white ${selectedMedicine.cloudinaryUrl ? 'hidden' : ''}`} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{selectedMedicine.medicineName}</h3>
                          <p className="text-teal-100">{selectedMedicine.dosage} • {selectedMedicine.form}</p>
                          {selectedMedicine.category && (
                            <p className="text-teal-200 text-sm">{selectedMedicine.category}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={dialogSortBy} onValueChange={(v)=>setDialogSortBy(v as any)}>
                          <SelectTrigger className="w-40 bg-white/90 border-white/30 text-gray-900">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="generic">Generic Price</SelectItem>
                            <SelectItem value="brand">Brand Price</SelectItem>
                            <SelectItem value="savings">Savings</SelectItem>
                            <SelectItem value="rating">Rating</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                          </SelectContent>
                        </Select>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="bg-white/90 border-white/30 text-gray-900 hover:bg-white" onClick={()=>exportSelectedToCSV(selectedMedicine)}>
                                <Download className="h-4 w-4 mr-1" /> Export CSV
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Export comparison as CSV</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="bg-white/90 border-white/30 text-gray-900 hover:bg-white" onClick={printComparison}>
                                <Printer className="h-4 w-4 mr-1" /> Print
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Print this comparison</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg bg-health-teal/5 border-health-teal/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-5 w-5 text-health-teal" />
                      <span className="font-semibold text-health-teal">Best Price</span>
                    </div>
                    <p className="text-2xl font-bold text-health-teal">{formatCurrency(getBestPrice(selectedMedicine))}</p>
                    <p className="text-sm text-health-teal/80">Generic version</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-emerald-50 border-emerald-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingDown className="h-5 w-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-800">Best Savings</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(getBestSavings(selectedMedicine))}</p>
                    <p className="text-sm text-emerald-700">vs brand name</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-5 w-5 text-amber-600" />
                      <span className="font-semibold text-amber-800">Avg Rating</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{getAverageRating(selectedMedicine)}</p>
                    <p className="text-sm text-amber-700">Across pharmacies</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-slate-50 border-slate-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="h-5 w-5 text-slate-600" />
                      <span className="font-semibold text-slate-800">Pharmacies</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-600">{selectedMedicine.pharmacies.length}</p>
                    <p className="text-sm text-slate-700">Available options</p>
                  </div>
                </div>

                {/* Detailed Comparison Table */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Detailed Comparison</h4>
                  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-50/90 backdrop-blur border-b border-gray-200">
                        <tr>
                          <th className="text-left p-4 font-semibold text-gray-700">Pharmacy</th>
                          <th className="text-right p-4 font-semibold text-gray-700">Generic Price</th>
                          <th className="text-right p-4 font-semibold text-gray-700">Brand Price</th>
                          <th className="text-right p-4 font-semibold text-gray-700">Insurance Price</th>
                          <th className="text-right p-4 font-semibold text-gray-700">Savings</th>
                          <th className="text-left p-4 font-semibold text-gray-700">Rating</th>
                          <th className="text-left p-4 font-semibold text-gray-700">Delivery</th>
                          <th className="text-left p-4 font-semibold text-gray-700">Stock</th>
                          <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedMedicine.pharmacies
                          .slice()
                          .sort((a,b)=>{
                            switch(dialogSortBy){
                              case 'brand': return a.brandPrice - b.brandPrice;
                              case 'savings': return b.savings - a.savings;
                              case 'rating': return b.rating - a.rating;
                              case 'delivery': return (a.deliveryTime||'').localeCompare(b.deliveryTime||'');
                              default: return a.genericPrice - b.genericPrice;
                            }
                          })
                          .map((pharmacy, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-health-teal/10 text-health-teal flex items-center justify-center text-xs font-semibold">
                                  {pharmacy.pharmacyName.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase()}
                                </div>
                                <p className="font-medium text-gray-900">{pharmacy.pharmacyName}</p>
                              </div>
                            </td>
                            <td className="p-4 text-right tabular-nums">
                              <span className="font-semibold text-health-teal text-lg">{formatCurrency(pharmacy.genericPrice)}</span>
                            </td>
                            <td className="p-4 text-right tabular-nums text-gray-600">{formatCurrency(pharmacy.brandPrice)}</td>
                            <td className="p-4 text-right tabular-nums">
                              {pharmacy.insurancePrice ? (
                                <span className="font-medium text-emerald-600">{formatCurrency(pharmacy.insurancePrice)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-4 text-right tabular-nums">
                              <span className="font-semibold text-emerald-600">{formatCurrency(pharmacy.savings)}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${i < Math.floor(pharmacy.rating) ? 'text-amber-500 fill-current' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{pharmacy.rating}</span>
                              </div>
                            </td>
                            <td className="p-4 text-gray-600">{pharmacy.deliveryTime}</td>
                            <td className="p-4">
                              <Badge className={pharmacy.inStock ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-red-100 text-red-800 border-red-200'}>
                                {pharmacy.inStock ? 'In Stock' : 'Out of Stock'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button size="sm" className="bg-health-teal hover:bg-teal-700 text-white" aria-label={`Order from ${pharmacy.pharmacyName}`}
                                  onClick={() => addToCart(selectedMedicine!, pharmacy.pharmacyId)}
                                >
                                  <ShoppingCart className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm" className="border-health-teal/30 text-health-teal hover:bg-health-teal/5" aria-label={`Call ${pharmacy.pharmacyName}`} onClick={() => {
                                  toast({ 
                                    title: 'Contact Information', 
                                    description: `Calling ${pharmacy.pharmacyName}...` 
                                  });
                                  // In a real app, this would initiate a call or show contact details
                                  setTimeout(() => {
                                    toast({ 
                                      title: 'Call Initiated', 
                                      description: `Connecting to ${pharmacy.pharmacyName}` 
                                    });
                                  }, 1000);
                                }}>
                                  <Phone className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-4 bg-health-teal/5 border border-health-teal/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="h-5 w-5 text-health-teal" />
                    <span className="font-semibold text-health-teal">Recommendations</span>
                  </div>
                  <div className="space-y-2 text-sm text-health-teal/80">
                    <p>• Choose generic versions to save up to {formatCurrency(getBestSavings(selectedMedicine))} per prescription</p>
                    <p>• Consider insurance coverage for additional savings</p>
                    <p>• Compare delivery times and pharmacy ratings for the best experience</p>
                    <p>• Contact pharmacies directly for bulk order discounts</p>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  <Button className="flex-1 bg-health-teal hover:bg-teal-700 text-white" onClick={orderBestPrice}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Order Best Price
                  </Button>
                  <Button variant="outline" className="flex-1 border-health-teal/30 text-health-teal hover:bg-health-teal/5" onClick={() => setShowShareDialog(true)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Comparison
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Share2 className="h-5 w-5 text-health-teal" />
                <span>Share Comparison</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Share Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={shareMethod === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShareMethod('email')}
                    className="text-xs"
                  >
                    Email
                  </Button>
                  <Button
                    variant={shareMethod === 'whatsapp' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShareMethod('whatsapp')}
                    className="text-xs"
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant={shareMethod === 'copy' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShareMethod('copy')}
                    className="text-xs"
                  >
                    Copy Link
                  </Button>
                </div>
              </div>

              {shareMethod === 'email' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Email Address</label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                  />
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button className="flex-1" onClick={shareComparison}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PriceComparison;   