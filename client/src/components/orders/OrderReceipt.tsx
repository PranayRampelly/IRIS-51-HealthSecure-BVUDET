import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Package, MapPin, IndianRupee, Calendar, Clock, ShieldCheck, FileText, Download, Printer } from 'lucide-react';

export interface OrderReceiptItem {
  id: string;
  name: string;
  dosage?: string;
  quantity: number;
  packSize?: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderReceiptData {
  orderNumber: string;
  createdAt: string;
  paymentMethod: 'online' | 'cod';
  paymentStatus: 'pending' | 'completed';
  items: OrderReceiptItem[];
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  delivery: {
    option: 'sameDay' | 'standard' | 'pickup';
    slot?: string;
    address: string;
    instructions?: string;
  };
}

interface Props {
  open: boolean;
  data: OrderReceiptData | null;
  onClose: () => void;
}

const formatINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

export const OrderReceipt: React.FC<Props> = ({ open, data, onClose }) => {
  if (!data) return null;
  const { orderNumber, createdAt, paymentMethod, paymentStatus, items, subtotal, discount, tax, deliveryFee, total, delivery } = data;

  const handlePrint = () => window.print();
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-receipt-${orderNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-emerald-700">
            <CheckCircle2 className="h-5 w-5" /> Order Confirmed
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="border-emerald-200 bg-emerald-50/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <FileText className="h-4 w-4" /> Receipt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-600">Order #</span><div className="font-medium">{orderNumber}</div></div>
                <div><span className="text-gray-600">Date</span><div className="font-medium">{new Date(createdAt).toLocaleString('en-IN')}</div></div>
                <div><span className="text-gray-600">Payment</span><div className="font-medium capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'} <Badge variant="outline" className="ml-2 border-emerald-300 text-emerald-800">{paymentStatus}</Badge></div></div>
                <div className="col-span-2"><span className="text-gray-600">Delivery</span><div className="font-medium flex items-center gap-2"><Package className="h-4 w-4" /> {delivery.option === 'sameDay' ? 'Same-day' : delivery.option === 'standard' ? 'Standard' : 'Store Pickup'} {delivery.slot ? <><Calendar className="h-4 w-4 ml-2" /> {delivery.slot}</> : null}</div></div>
                <div className="col-span-2"><span className="text-gray-600">Address</span><div className="font-medium flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5" /> <span>{delivery.address}</span></div></div>
              </div>
              <Separator />
              <div className="space-y-2">
                {items.map(it => (
                  <div key={it.id} className="flex justify-between text-sm">
                    <div>
                      <div className="font-medium">{it.name} {it.dosage ? `• ${it.dosage}` : ''}</div>
                      <div className="text-gray-600">Qty {it.quantity}{it.packSize ? ` • Pack ${it.packSize}` : ''}</div>
                    </div>
                    <div className="text-right">
                      <div>{formatINR(it.totalPrice)}</div>
                      <div className="text-xs text-gray-500">@ {formatINR(it.unitPrice)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">{formatINR(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Discount</span><span className="text-green-700">-{formatINR(discount)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>{formatINR(tax)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span>{deliveryFee ? formatINR(deliveryFee) : 'Free'}</span></div>
                <Separator />
                <div className="flex justify-between text-base font-semibold"><span>Total</span><span className="text-emerald-700">{formatINR(total)}</span></div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-3.5 w-3.5 mr-1"/> Print</Button>
                <Button variant="outline" size="sm" onClick={handleDownload}><Download className="h-3.5 w-3.5 mr-1"/> Download</Button>
              </div>
              <div className="pt-1 flex items-center gap-2 text-xs text-gray-600"><ShieldCheck className="h-4 w-4" /> Thank you for shopping with HealthSecure</div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderReceipt;


