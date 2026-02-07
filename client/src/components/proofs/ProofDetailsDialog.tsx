import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProofDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    proof: any;
    onShare: () => void;
    onDownload: () => void;
}

export const ProofDetailsDialog: React.FC<ProofDetailsDialogProps> = ({
    open,
    onOpenChange,
    proof,
    onShare,
    onDownload
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Proof Details</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                    <p className="text-sm text-gray-500">
                        Proof details will be displayed here.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
