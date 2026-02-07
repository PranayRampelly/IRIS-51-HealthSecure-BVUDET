
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Filter } from 'lucide-react';

const ResearcherQueryResults = () => {
  const { queryId } = useParams();

  const mockResults = [
    { id: 1, age: '25-30', condition: 'Diabetes', treatment: 'Metformin', outcome: 'Improved' },
    { id: 2, age: '31-35', condition: 'Hypertension', treatment: 'Lisinopril', outcome: 'Stable' },
    { id: 3, age: '26-30', condition: 'Diabetes', treatment: 'Insulin', outcome: 'Improved' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-health-teal">Query Results</h1>
          <p className="text-health-charcoal">Results for Query ID: {queryId}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-health-teal">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Query Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-health-charcoal">Total Records</p>
              <p className="text-2xl font-bold text-health-teal">{mockResults.length}</p>
            </div>
            <div>
              <p className="text-sm text-health-charcoal">Age Range</p>
              <p className="text-lg font-semibold">25-35</p>
            </div>
            <div>
              <p className="text-sm text-health-charcoal">Conditions</p>
              <p className="text-lg font-semibold">2</p>
            </div>
            <div>
              <p className="text-sm text-health-charcoal">Status</p>
              <Badge className="bg-health-success">Complete</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Age Range</th>
                  <th className="text-left p-2">Condition</th>
                  <th className="text-left p-2">Treatment</th>
                  <th className="text-left p-2">Outcome</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockResults.map((result) => (
                  <tr key={result.id} className="border-b hover:bg-health-light-gray/50">
                    <td className="p-2">{result.id}</td>
                    <td className="p-2">{result.age}</td>
                    <td className="p-2">{result.condition}</td>
                    <td className="p-2">{result.treatment}</td>
                    <td className="p-2">
                      <Badge variant={result.outcome === 'Improved' ? 'default' : 'secondary'}>
                        {result.outcome}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearcherQueryResults;
