import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Home, Building2, Truck, Clock, ShieldCheck, Lock, FileCheck, HelpCircle, Package, Percent, CheckCircle2, Phone } from 'lucide-react';
import patientCartService from '@/services/patientCartService';
import { useToast } from '@/hooks/use-toast';
import { OrderReceipt, type OrderReceiptData } from '@/components/orders/OrderReceipt';

type PaymentUiMethod = 'online'|'cod';

const formatINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

const Checkout: React.FC = () => {
  const [address, setAddress] = useState<'home'|'work'|'new'>('home');
  const [deliveryOption, setDeliveryOption] = useState<'sameDay'|'standard'|'pickup'>('sameDay');
  const [deliverySlot, setDeliverySlot] = useState('Today, 4-6 PM');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentUiMethod>('online');
  const [coupon, setCoupon] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [billingSame, setBillingSame] = useState(true);
  const [giftNote, setGiftNote] = useState('');
  const [gstInvoice, setGstInvoice] = useState(false);
  const [gstin, setGstin] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<OrderReceiptData | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionError, setPrescriptionError] = useState('');

  // New address form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('400001');
  const [city, setCity] = useState('Mumbai');
  const [stateName, setStateName] = useState('Maharashtra');
  const [addressType, setAddressType] = useState<'home'|'work'|'other'>('home');

  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Array<{ id: string; name: string; dosage: string; quantity: number; packSize: number; unitPrice: number; totalPrice: number }>>([]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const items = await patientCartService.getCart();
        setCart(items.map(i => ({
          id: i.id,
          name: i.name,
          dosage: i.dosage,
          quantity: i.quantity,
          packSize: i.packSize,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
        })));
      } catch (e) {
        console.error('Checkout: failed to load cart', e);
        toast({ title: 'Error', description: 'Failed to load cart', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchCart();

    // One-time delayed refresh to catch any in-flight autosaves from cart page
    const t = setTimeout(fetchCart, 800);

    // Refresh when tab regains focus
    const onFocus = () => { fetchCart(); };
    window.addEventListener('focus', onFocus);
    return () => { clearTimeout(t); window.removeEventListener('focus', onFocus); };
  }, []);

  const subtotal = useMemo(() =>
    cart.reduce((sum, it) => sum + (Number(it.unitPrice) * Number(it.packSize) * Number(it.quantity)), 0)
  , [cart]);
  const deliveryFee = deliveryOption === 'sameDay' ? 49 : 0;
  const discount = coupon.trim().toUpperCase() === 'SAVE10' ? subtotal * 0.10 : 0;
  const tax = (subtotal - discount) * 0.05;
  const total = subtotal - discount + tax + deliveryFee;
  const estimatedDelivery = useMemo(() => {
    const base = new Date();
    if (deliveryOption === 'sameDay') return 'Today';
    if (deliveryOption === 'standard') {
      const d = new Date(base);
      d.setDate(d.getDate() + 1);
      return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    return 'Select pickup slot';
  }, [deliveryOption]);

  const doCheckout = async () => {
    try {
      if (!agreeTerms) {
        toast({ title: 'Please accept terms', description: 'You must accept terms to proceed', variant: 'destructive' });
        return;
      }
      const deliveryDetails = {
        option: deliveryOption,
        slot: deliverySlot,
        address: address === 'home' ? 'Home • 221B Baker Street, Mumbai' : address === 'work' ? 'Work • Tech Park, Andheri' : `${line1}, ${line2}, ${city} ${pincode}, ${stateName}`,
        instructions,
      };
      let paymentStatus: 'pending' | 'completed' = 'pending';
      let isPaid = false;

      if (paymentMethod === 'online') {
        const amountPaise = Math.round(total * 100);
        // Always pull key from backend for security and single source of truth
        let key: string | undefined = undefined;
        try {
          const keyResp = await fetch('/api/payments/key', { credentials: 'include' });
          if (keyResp.ok) {
            const d = await keyResp.json();
            key = d?.keyId || d?.key || undefined;
          }
        } catch {}
        // Fallback to env if backend route is unavailable
        if (!key) key = (import.meta as any)?.env?.VITE_RAZORPAY_KEY;

        // Ensure Razorpay script is loaded
        const ensureRazorpay = () => new Promise<void>((resolve, reject) => {
          if ((window as any).Razorpay) return resolve();
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay'));
          document.body.appendChild(script);
        });

        try {
          await ensureRazorpay();
        } catch (loadErr) {
          console.error('Razorpay load error', loadErr);
        }

        if ((window as any).Razorpay && key) {
          await new Promise<void>((resolve, reject) => {
            const rzp = new (window as any).Razorpay({
              key,
              amount: amountPaise,
              currency: 'INR',
              name: 'HealthSecure',
              description: 'Pharmacy Order Payment',
              handler: function () { isPaid = true; paymentStatus = 'completed'; resolve(); },
              modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
              theme: { color: '#0d9488' },
            });
            rzp.on('payment.failed', (resp: any) => reject(resp?.error || new Error('Payment failed')));
            rzp.open();
          });
          toast({ title: 'Payment successful', description: 'Online payment completed via Razorpay' });
        } else {
          console.warn('Razorpay missing or key not set. key present?', Boolean(key));
          toast({ title: 'Razorpay not configured', description: 'Set VITE_RAZORPAY_KEY and restart the dev server', variant: 'destructive' });
        }
      }

      const paymentDetails = {
        method: paymentMethod === 'online' ? 'online' : 'cod',
        status: paymentStatus,
      } as const;

      try {
        await patientCartService.checkout({
          deliveryDetails,
          paymentDetails,
          prescriptionFile: prescriptionFile || undefined,
        });
      } catch (e) {
        // Non-blocking for showing receipt; backend may not exist for pharmacy checkout yet
        console.warn('Checkout API failed, showing local receipt anyway', e);
      }

      const receipt: OrderReceiptData = {
        orderNumber: 'HS-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        createdAt: new Date().toISOString(),
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        items: cart.map(it => ({ id: it.id, name: it.name, dosage: it.dosage, quantity: it.quantity, packSize: it.packSize, unitPrice: it.unitPrice, totalPrice: it.totalPrice })),
        subtotal,
        discount,
        tax,
        deliveryFee,
        total,
        delivery: deliveryDetails,
      };
      setReceiptData(receipt);
      // Show receipt for COD immediately, for online only after attempting payment
      setShowReceipt(paymentMethod === 'cod' || (paymentMethod === 'online'));
      toast({ title: 'Order created', description: paymentMethod === 'online' ? (isPaid ? 'Payment completed.' : 'Payment pending.') : 'Pay on delivery.' });
    } catch (e: any) {
      console.error('Checkout error', e);
      toast({ title: 'Checkout failed', description: e?.response?.data?.message || 'Unable to place order', variant: 'destructive' });
    }
  };

  const getOptionClasses = (opt: 'sameDay'|'standard'|'pickup') => (
    `flex items-center justify-between p-3 border rounded-lg transition-colors ${
      deliveryOption === opt
        ? 'bg-emerald-50/60 border-emerald-200 ring-1 ring-emerald-200'
        : 'hover:bg-gray-50'
    }`
  );

  const getAddressClasses = (opt: 'home'|'work'|'new') => (
    `p-3 border rounded-lg transition-colors ${
      address === opt ? 'bg-emerald-50/60 border-emerald-200 ring-1 ring-emerald-200' : 'hover:bg-gray-50'
    }`
  );

  const instructionChips = [
    'Call on arrival',
    'Leave at security',
    'Hand to family',
    'Avoid ringing bell'
  ];

  const applyCoupon = (code: string) => setCoupon(code);
  const giftSuggestions = ['Get well soon', 'Wishing you a speedy recovery', 'Take care and stay healthy'];
  const giftNoteLimit = 160;
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
  const isGstinInvalid = gstInvoice && gstin.length > 0 && !gstinRegex.test(gstin);

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-0 md:px-4 lg:px-6 py-8">
        <div className="mb-6 rounded-2xl overflow-hidden mx-4 md:mx-0">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-teal-700 p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-white">Checkout</h1>
            <p className="text-teal-100 mt-2">Enter address and payment to complete your order</p>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                <span className="text-sm">Items Reviewed</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                <span className="text-sm">Address & Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                <span className="text-sm">Payment</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 md:px-0">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-700" />
                  <CardTitle className="text-base">Delivery Address</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <RadioGroup value={address} onValueChange={(v)=>setAddress(v as any)}>
                  <div className={getAddressClasses('home')}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="home" id="addr-home" />
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="addr-home" className="cursor-pointer">Home • 221B Baker Street, Mumbai</Label>
                        <Badge variant="outline" className="ml-2 border-emerald-300 text-emerald-800">Default</Badge>
                      </div>
                    </div>
                  </div>
                  <div className={getAddressClasses('work')}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="work" id="addr-work" />
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="addr-work" className="cursor-pointer">Work • Tech Park, Andheri</Label>
                      </div>
                    </div>
                  </div>
                  <div className={getAddressClasses('new')}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="new" id="addr-new" />
                      <Label htmlFor="addr-new" className="cursor-pointer">Add new address</Label>
                    </div>
                  </div>
                </RadioGroup>
                {address === 'new' && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Full Name</Label>
                      <Input placeholder="e.g., Rahul Sharma" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-sm">Phone</Label>
                      <Input placeholder="10-digit mobile" value={phone} onChange={(e)=>setPhone(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm">Address Line 1</Label>
                      <Input placeholder="House/Flat, Building, Street" value={line1} onChange={(e)=>setLine1(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm">Address Line 2</Label>
                      <Input placeholder="Area, Locality" value={line2} onChange={(e)=>setLine2(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-sm">Landmark</Label>
                      <Input placeholder="Nearby landmark" value={landmark} onChange={(e)=>setLandmark(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-sm">Pincode</Label>
                      <Input placeholder="e.g., 400001" value={pincode} onChange={(e)=>setPincode(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-sm">City</Label>
                      <Input placeholder="e.g., Mumbai" value={city} onChange={(e)=>setCity(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-sm">State</Label>
                      <Select value={stateName} onValueChange={setStateName}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['Maharashtra','Karnataka','Delhi','Gujarat','Tamil Nadu','Telangana'].map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">Address Type</Label>
                      <Select value={addressType} onValueChange={(v)=>setAddressType(v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <Checkbox id="default-addr" />
                      <Label htmlFor="default-addr" className="text-sm text-gray-700">Set as default address</Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-emerald-700" />
                  <CardTitle className="text-base">Delivery Options</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <RadioGroup value={deliveryOption} onValueChange={(v)=>setDeliveryOption(v as any)}>
                  <div className={getOptionClasses('sameDay')}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="sameDay" id="opt-same" />
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="opt-same" className="cursor-pointer">Same-day (2-4 hrs)</Label>
                        <Badge variant="outline" className="border-emerald-300 text-emerald-800">Fastest</Badge>
                      </div>
                    </div>
                    <span className="text-sm">{formatINR(49)}</span>
                  </div>
                  <div className={getOptionClasses('standard')}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="standard" id="opt-std" />
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="opt-std" className="cursor-pointer">Standard (Next day)</Label>
                        <Badge variant="outline" className="border-blue-200 text-blue-800">Popular</Badge>
                      </div>
                    </div>
                    <span className="text-sm">Free</span>
                  </div>
                  <div className={getOptionClasses('pickup')}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="pickup" id="opt-pick" />
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="opt-pick" className="cursor-pointer">Store Pickup</Label>
                      </div>
                    </div>
                    <span className="text-sm">Free</span>
                  </div>
                </RadioGroup>

                {(deliveryOption === 'standard' || deliveryOption === 'pickup') && (
                  <div>
                    <Label className="text-sm">Preferred Slot</Label>
                    <Select value={deliverySlot} onValueChange={setDeliverySlot}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {deliveryOption === 'standard' 
                          ? ['Tomorrow, 10-12 AM','Tomorrow, 2-4 PM','Tomorrow, 4-6 PM','Day after tomorrow, 10-12 AM'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)
                          : ['Today, 10-12 AM','Today, 2-4 PM','Today, 4-6 PM','Tomorrow, 10-12 AM'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)
                        }
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label className="text-sm">Delivery Instructions</Label>
                  <div className="flex flex-wrap gap-2 my-2">
                    {instructionChips.map(c => (
                      <Button key={c} type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={()=>setInstructions(prev => (prev ? prev + '; ' + c : c))}>{c}</Button>
                    ))}
                  </div>
                  <Textarea rows={2} placeholder="e.g., Call on arrival, leave at security" value={instructions} onChange={(e)=>setInstructions(e.target.value)} />
                </div>
                <div className="text-xs text-gray-600">Estimated delivery: <span className="font-medium text-gray-800">{estimatedDelivery}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                  <CardTitle className="text-base">Payment</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <RadioGroup value={paymentMethod} onValueChange={(v)=>setPaymentMethod(v as any)}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="online" id="pm-online" /><Label htmlFor="pm-online" className="flex items-center gap-2 cursor-pointer">Online (Razorpay)</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="cod" id="pm-cod" /><Label htmlFor="pm-cod" className="flex items-center gap-2 cursor-pointer">Cash on Delivery</Label></div>
                </RadioGroup>
                {paymentMethod === 'cod' && (
                  <div className="text-xs text-gray-600">Pay in cash/UPI on delivery. Please keep exact change ready.</div>
                )}
                <div className="pt-1 flex items-center gap-2 text-xs text-gray-600"><Lock className="h-4 w-4" /> 256-bit SSL secure payment • PCI-DSS compliant</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-emerald-700" />
                  <CardTitle className="text-base">Prescription Upload (if required)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className={`border rounded-lg p-4 cursor-pointer ${prescriptionFile ? 'bg-emerald-50/40 border-emerald-200' : 'hover:bg-gray-50'}`}
                  onClick={()=>fileInputRef.current?.click()}
                >
                  {!prescriptionFile ? (
                    <div className="text-sm text-gray-700">Click to upload or drag & drop prescription here</div>
                  ) : (
                    <div className="flex items-center justify-between text-sm">
                      <div className="truncate">
                        <span className="font-medium text-gray-800">{prescriptionFile.name}</span>
                        <span className="ml-2 text-gray-500">({(prescriptionFile.size/1024/1024).toFixed(2)} MB)</span>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={(e)=>{e.stopPropagation(); fileInputRef.current?.click();}}>Change</Button>
                        <Button type="button" variant="outline" size="sm" onClick={(e)=>{e.stopPropagation(); setPrescriptionFile(null); setPrescriptionError('');}}>Remove</Button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e)=>{
                      const f = e.target.files?.[0] || null;
                      if (!f) { setPrescriptionFile(null); return; }
                      const okType = ['application/pdf','image/jpeg','image/png'].includes(f.type);
                      const okSize = f.size <= 5 * 1024 * 1024;
                      if (!okType) { setPrescriptionError('Only PDF/JPG/PNG are allowed'); setPrescriptionFile(null); return; }
                      if (!okSize) { setPrescriptionError('File must be under 5 MB'); setPrescriptionFile(null); return; }
                      setPrescriptionError('');
                      setPrescriptionFile(f);
                    }}
                  />
                </div>
                {prescriptionError && <div className="text-xs text-red-600">{prescriptionError}</div>}
                <div className="text-xs text-gray-600">Accepted: PDF/JPG/PNG up to 5 MB. Upload only if your items require a prescription.</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-emerald-700" />
                  <CardTitle className="text-base">Offers & Coupons</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input placeholder="Enter code" value={coupon} onChange={(e)=>setCoupon(e.target.value)} className="h-8 w-40" />
                  <Button size="sm" variant="outline" onClick={()=>applyCoupon(coupon)}>Apply</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <button type="button" className="p-2 border rounded text-left hover:bg-gray-50" onClick={()=>applyCoupon('SAVE10')}>SAVE10 • 10% off up to {formatINR(100)}</button>
                  <button type="button" className="p-2 border rounded text-left hover:bg-gray-50" onClick={()=>applyCoupon('FREESHIP')}>FREESHIP • Free delivery on orders above {formatINR(499)}</button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                  <CardTitle className="text-base">Billing</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox id="same" checked={billingSame} onCheckedChange={(v)=>setBillingSame(Boolean(v))} />
                  <Label htmlFor="same" className="text-sm">Billing address same as delivery</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="gst" checked={gstInvoice} onCheckedChange={(v)=>setGstInvoice(Boolean(v))} />
                  <Label htmlFor="gst" className="text-sm">I need a GST invoice</Label>
                </div>
                {gstInvoice && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input placeholder="Company Name" value={companyName} onChange={(e)=>setCompanyName(e.target.value)} />
                    <div>
                      <Input placeholder="GSTIN" value={gstin} onChange={(e)=>setGstin(e.target.value.toUpperCase())} className={isGstinInvalid ? 'border-red-300' : ''} />
                      {isGstinInvalid && <div className="text-[11px] text-red-600 mt-1">Enter a valid GSTIN (15 characters)</div>}
                    </div>
                    <Input placeholder="Billing Email" value={billingEmail} onChange={(e)=>setBillingEmail(e.target.value)} className="md:col-span-2" />
                  </div>
                )}
                {!billingSame && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input placeholder="Full Name" />
                    <Input placeholder="Phone" />
                    <Input placeholder="Address Line 1" className="md:col-span-2" />
                    <Input placeholder="Address Line 2" className="md:col-span-2" />
                    <Input placeholder="City" />
                    <Select>
                      <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                      <SelectContent>
                        {['Maharashtra','Karnataka','Delhi','Gujarat','Tamil Nadu','Telangana'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Pincode" />
                  </div>
                )}
                <div>
                  <Label className="text-sm">Gift Note (optional)</Label>
                  <div className="flex flex-wrap gap-2 my-2">
                    {giftSuggestions.map(s => (
                      <Button key={s} type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={()=>setGiftNote(s)}>{s}</Button>
                    ))}
                  </div>
                  <Textarea rows={2} maxLength={giftNoteLimit} placeholder="Write a message for the receiver" value={giftNote} onChange={(e)=>setGiftNote(e.target.value)} />
                  <div className="text-[11px] text-gray-500 mt-1">{giftNote.length}/{giftNoteLimit} characters</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-emerald-700" />
                  <CardTitle className="text-base">Order Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Progress</span>
                  <span>3 of 3</span>
                </div>
                <Progress value={100} className="h-2" />
                <div className="space-y-2 text-sm">
                  {loading ? (
                    <div className="text-gray-500">Loading items…</div>
                  ) : cart.length === 0 ? (
                    <div className="text-gray-500">No items in cart</div>
                  ) : (
                    cart.map(it => (
                      <div key={it.id} className="flex justify-between"><span>{it.name} {it.dosage} × {it.quantity}</span><span>{formatINR(it.totalPrice)}</span></div>
                    ))
                  )}
                </div>
                <Separator />
                <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-medium">{formatINR(subtotal)}</span></div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Coupon</span>
                  <div className="flex gap-2">
                    <Input placeholder="Enter code" value={coupon} onChange={(e)=>setCoupon(e.target.value)} className="h-8 w-32" />
                    <Button size="sm" variant="outline" onClick={()=>applyCoupon(coupon)}>Apply</Button>
                  </div>
                </div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Discount</span><span className="text-green-700">-{formatINR(discount)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Tax (5%)</span><span>{formatINR(tax)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Delivery</span><span>{deliveryFee ? formatINR(deliveryFee) : 'Free'}</span></div>
                <Separator />
                <div className="flex justify-between text-base font-semibold"><span>Total</span><span className="text-emerald-700">{formatINR(total)}</span></div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-1"><ShieldCheck className="h-4 w-4" /> 100% secure payments • Easy returns</div>
                <div className="flex items-start gap-2 text-xs text-gray-600 mt-1"><HelpCircle className="h-4 w-4 mt-0.5" /> By placing the order, you agree to our Terms, Privacy Policy, and Cancellation Policy.</div>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox id="agree" checked={agreeTerms} onCheckedChange={(v)=>setAgreeTerms(Boolean(v))} />
                  <Label htmlFor="agree" className="text-sm">I confirm the details are correct and I accept the Terms</Label>
                </div>
                <Button disabled={!agreeTerms} onClick={doCheckout} className="w-full bg-emerald-600 hover:bg-emerald-700 mt-2 flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4" /> Pay {formatINR(total)}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                  <CardTitle className="text-base">Trust & Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-700" /> WHO-GMP compliant partner pharmacies</div>
                <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-emerald-700" /> Encrypted & secure transactions</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-emerald-700" /> 24x7 support: 1800-000-000</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    <OrderReceipt open={showReceipt} data={receiptData} onClose={()=>setShowReceipt(false)} />
    </>
  );
};

export default Checkout;


