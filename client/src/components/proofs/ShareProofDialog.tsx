import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ShareProofDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    proofId: string;
    proofTitle: string;
}

export const ShareProofDialog: React.FC<ShareProofDialogProps> = ({
    open,
    onOpenChange,
    proofId,
    proofTitle
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Proof: {proofTitle}</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                    <p className="text-sm text-gray-500">
                        Proof sharing functionality will be implemented here.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
