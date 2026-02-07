import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CreateClaim: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Insurance Claim</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Claim creation form will be implemented here. For now, return to the claims list.
          </p>
          <Button variant="outline" onClick={() => navigate('/insurance/claims')}>
            Back to Claims
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateClaim;




