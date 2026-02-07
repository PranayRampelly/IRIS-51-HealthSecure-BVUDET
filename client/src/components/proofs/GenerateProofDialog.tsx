import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface GenerateProofDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProofGenerated: () => void;
}

export const GenerateProofDialog: React.FC<GenerateProofDialogProps> = ({
    open,
    onOpenChange,
    onProofGenerated
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate New Proof</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                    <p className="text-sm text-gray-500">
                        Proof generation functionality will be implemented here.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
