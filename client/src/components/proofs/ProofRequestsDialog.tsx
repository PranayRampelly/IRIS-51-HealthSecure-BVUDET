import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProofRequestsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ProofRequestsDialog: React.FC<ProofRequestsDialogProps> = ({
    open,
    onOpenChange
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Proof Requests</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                    <p className="text-sm text-gray-500">
                        Proof requests will be displayed here.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
