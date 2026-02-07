import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Pill, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import patientCartService, { CartItem } from '@/services/patientCartService';

type CartVariant = 'generic' | 'brand';

const formatINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  // Draft state for per-item inputs to avoid cursor jumps while typing
  const [draftPack, setDraftPack] = useState<Record<string, string>>({});
  const [draftQty, setDraftQty] = useState<Record<string, string>>({});
  const [proceeding, setProceeding] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<'sameDay'|'standard'|'pickup'>('sameDay');
  const [deliverySlot, setDeliverySlot] = useState('Today, 4-6 PM');
  const [address, setAddress] = useState<'home'|'work'|'new'>('home');
  const [coupon, setCoupon] = useState('');
  const [instructions, setInstructions] = useState('');

  // Load cart data from backend
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartItems = await patientCartService.getCart();
      setItems(cartItems);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEffectivePack = (item: CartItem) => Number(draftPack[item.id] ?? item.packSize);
  const getEffectiveQty = (item: CartItem) => Number(draftQty[item.id] ?? item.quantity);
  const getMaxQty = (item: CartItem) => {
    const stock = (item as any).stock as number | undefined;
    const pack = Math.max(1, getEffectivePack(item));
    if (!stock || stock <= 0) return undefined;
    return Math.max(1, Math.floor(stock / pack));
  };
  const lineTotal = (item: CartItem) => item.unitPrice * getEffectivePack(item) * getEffectiveQty(item);

  const subtotal = useMemo(() =>
    items.reduce((s, it) => s + lineTotal(it), 0)
  , [items, draftPack, draftQty]);
  const deliveryFee = deliveryOption === 'sameDay' ? 49 : 0;
  const discount = coupon.trim().toUpperCase() === 'SAVE10' ? subtotal * 0.10 : 0;
  const tax = (subtotal - discount) * 0.05;
  const grandTotal = subtotal - discount + tax + deliveryFee;

  const updateItem = async (id: string, update: Partial<CartItem>) => {
    try {
      setUpdating(id);
      const updatedItem: any = await patientCartService.updateCartItem(id, update);
      setItems(prev => prev.map(i => i.id === id ? updatedItem : i));
      // Sync drafts with server-accepted values (handles stock capping adjustments)
      setDraftPack(prev => ({ ...prev, [id]: String(updatedItem.packSize ?? prev[id]) }));
      setDraftQty(prev => ({ ...prev, [id]: String(updatedItem.quantity ?? prev[id]) }));
      if (updatedItem.warning) {
        toast({ title: 'Adjusted to stock', description: updatedItem.warning });
      } else {
        toast({ title: 'Success', description: 'Cart item updated' });
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await patientCartService.removeFromCart(id);
      setItems(prev => prev.filter(i => i.id !== id));
      toast({
        title: "Success",
        description: "Item removed from cart",
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  const savePendingChanges = async () => {
    const updates: Array<Promise<any>> = [];
    for (const it of items) {
      const desiredPack = Math.max(1, Number(draftPack[it.id] ?? it.packSize));
      const desiredQty = Math.max(1, Number(draftQty[it.id] ?? it.quantity));
      if (desiredPack !== it.packSize) {
        updates.push(updateItem(it.id, { packSize: desiredPack }));
      }
      if (desiredQty !== it.quantity) {
        updates.push(updateItem(it.id, { quantity: desiredQty }));
      }
    }
    if (updates.length) {
      await Promise.allSettled(updates);
      await loadCart();
    }
  };

  // Removed autosave during typing to prevent focus loss; we save on blur/Enter and before checkout

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-0 md:px-4 lg:px-6 py-8">
        <div className="mb-6 rounded-2xl overflow-hidden mx-4 md:mx-0">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-teal-700 p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-white">Your Cart</h1>
            <p className="text-teal-100 mt-2">Review items, choose delivery, apply offers, and checkout</p>
          </div>
        </div>

        <div className="mt-4 space-y-4 px-4 md:px-0">
            {loading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-sm text-gray-600">Loading cart items...</p>
                </CardContent>
              </Card>
            ) : items.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-sm text-gray-600">Your cart is empty.</CardContent></Card>
            ) : (
              <>
                <Card>
                  <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {items.map(ci => (
                      <div key={ci.id} className="p-3 border rounded-lg flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded">
                            {ci.cloudinaryUrl ? (
                              <img 
                                src={ci.cloudinaryUrl} 
                                alt={ci.name}
                                className="h-8 w-8 object-cover rounded"
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
                            <Pill className={`h-4 w-4 text-blue-600 ${ci.cloudinaryUrl ? 'hidden' : ''}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{ci.name}</span>
                              <Badge variant="outline">{ci.dosage}</Badge>
                              <Badge className="bg-blue-100 text-blue-800">{ci.variant}</Badge>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">{ci.pharmacy}</div>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              <div>
                                <Label className="text-xs text-gray-600">Pack</Label>
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  min="1"
                                  className="h-8"
                                  value={draftPack[ci.id] ?? String(ci.packSize)}
                                  onChange={(e)=>{
                                    const next = e.target.value.replace(/[^0-9]/g, '');
                                    setDraftPack(prev => ({ ...prev, [ci.id]: next }));
                                  }}
                                  onBlur={async (e)=>{
                                    const raw = (draftPack[ci.id] ?? String(ci.packSize)).trim();
                                    const parsed = Math.max(1, Number(raw || ci.packSize));
                                    if (parsed !== ci.packSize) {
                                      await updateItem(ci.id, { packSize: parsed });
                                    }
                                    setDraftPack(prev => ({ ...prev, [ci.id]: String(parsed) }));
                                  }}
                                  onKeyDown={(e)=>{
                                    if (e.key === 'Enter') {
                                      (e.target as HTMLInputElement).blur();
                                    }
                                  }}
                                  disabled={updating === ci.id}
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Qty</Label>
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  min="1"
                                  className="h-8"
                                  value={draftQty[ci.id] ?? String(ci.quantity)}
                                  onChange={(e)=>{
                                    const next = e.target.value.replace(/[^0-9]/g, '');
                                    setDraftQty(prev => ({ ...prev, [ci.id]: next }));
                                  }}
                                  onBlur={async ()=>{
                                    const raw = (draftQty[ci.id] ?? String(ci.quantity)).trim();
                                    const parsedInput = Math.max(1, Number(raw || ci.quantity));
                                    const max = getMaxQty(ci);
                                    const parsed = (typeof max === 'number') ? Math.min(parsedInput, max) : parsedInput;
                                    if (parsed !== ci.quantity) {
                                      await updateItem(ci.id, { quantity: parsed });
                                    }
                                    setDraftQty(prev => ({ ...prev, [ci.id]: String(parsed) }));
                                  }}
                                  onKeyDown={(e)=>{ if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } }}
                                  disabled={updating === ci.id}
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Variant</Label>
                                <Select 
                                  value={ci.variant} 
                                  onValueChange={(v)=>updateItem(ci.id, { variant: v as CartVariant })}
                                  disabled={updating === ci.id}
                                >
                                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="generic">Generic</SelectItem>
                                    <SelectItem value="brand">Brand</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Unit</div>
                          <div className="text-base font-semibold text-gray-900">{formatINR(ci.unitPrice)}</div>
                          <div className="text-xs text-gray-500 mt-1">Line total</div>
                          <div className="text-base font-bold text-emerald-700">{formatINR(lineTotal(ci))}</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 text-red-600" 
                            onClick={() => removeItem(ci.id)}
                            disabled={updating === ci.id}
                          >
                            {updating === ci.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="md:col-span-2">
                    <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-medium">{formatINR(subtotal)}</span></div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Coupon</span>
                        <div className="flex gap-2">
                          <Input placeholder="Enter code" value={coupon} onChange={(e)=>setCoupon(e.target.value)} className="h-8 w-32" />
                          <Button size="sm" variant="outline">Apply</Button>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">Discount</span><span className="text-green-700">-{formatINR(discount)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">Tax (5%)</span><span>{formatINR(tax)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">Delivery</span><span>{deliveryFee ? formatINR(deliveryFee) : 'Free'}</span></div>
                      <Separator />
                      <div className="flex justify-between text-base font-semibold"><span>Total</span><span className="text-emerald-700">{formatINR(grandTotal)}</span></div>
                      <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 mt-2" 
                        disabled={proceeding}
                        onClick={async ()=>{
                          try {
                            setProceeding(true);
                            await savePendingChanges();
                            navigate('/patient/pharmacy/checkout');
                          } finally {
                            setProceeding(false);
                          }
                        }}
                      >{proceeding ? 'Saving…' : 'Proceed to Checkout'}</Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">Savings</CardTitle></CardHeader>
                    <CardContent>
                      <div className="p-3 border rounded-lg bg-emerald-50">
                        <div className="flex items-center gap-2 text-emerald-800"><DollarSign className="h-4 w-4" /> Choose Generic where possible to reduce cost.</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  );
};

export default Cart;


