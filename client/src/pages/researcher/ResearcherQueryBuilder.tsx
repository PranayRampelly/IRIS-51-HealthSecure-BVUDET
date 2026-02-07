
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Database, Plus, X, Play, Save, Code, Eye, Filter, Calendar } from 'lucide-react';

const ResearcherQueryBuilder = () => {
  const [queryName, setQueryName] = useState('');
  const [queryDescription, setQueryDescription] = useState('');
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [sqlQuery, setSqlQuery] = useState('');

  const datasets = [
    { id: 'cardiovascular', name: 'Cardiovascular Health', records: 15420, description: 'Heart disease, blood pressure, cholesterol data' },
    { id: 'diabetes', name: 'Diabetes Management', records: 12350, description: 'Blood sugar, insulin, medication adherence' },
    { id: 'cancer', name: 'Cancer Research', records: 8960, description: 'Diagnosis, treatment, survival outcomes' },
    { id: 'mental-health', name: 'Mental Health', records: 18730, description: 'Depression, anxiety, therapy outcomes' },
    { id: 'pediatric', name: 'Pediatric Care', records: 9840, description: 'Child health, vaccination, growth data' },
    { id: 'emergency', name: 'Emergency Medicine', records: 22140, description: 'ER visits, trauma, critical care' }
  ];

  const fields = {
    patient: ['age', 'gender', 'ethnicity', 'location'],
    medical: ['diagnosis', 'treatment', 'medication', 'outcome'],
    temporal: ['admission_date', 'discharge_date', 'treatment_duration'],
    clinical: ['vital_signs', 'lab_results', 'imaging_results']
  };

  const operators = ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'between'];

  const addCondition = () => {
    setConditions([...conditions, {
      id: Date.now(),
      field: '',
      operator: '',
      value: '',
      connector: 'AND'
    }]);
  };

  const removeCondition = (id: number) => {
    setConditions(conditions.filter(condition => condition.id !== id));
  };

  const updateCondition = (id: number, field: string, value: any) => {
    setConditions(conditions.map(condition => 
      condition.id === id ? { ...condition, [field]: value } : condition
    ));
  };

  const generateSQL = () => {
    let query = `SELECT * FROM health_records WHERE `;
    conditions.forEach((condition, index) => {
      if (index > 0) query += ` ${condition.connector} `;
      query += `${condition.field} ${condition.operator} '${condition.value}'`;
    });
    setSqlQuery(query);
  };

  const runQuery = () => {
    console.log('Running query:', { queryName, selectedDatasets, conditions, sqlQuery });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Query Builder</h1>
          <p className="text-health-charcoal mt-2">Build complex queries for health data analysis</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save Query
          </Button>
          <Button className="bg-health-success hover:bg-health-success/90 text-white">
            <Play className="w-4 h-4 mr-2" />
            Run Query
          </Button>
        </div>
      </div>

      <Tabs defaultValue="visual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visual">Visual Builder</TabsTrigger>
          <TabsTrigger value="sql">SQL Editor</TabsTrigger>
          <TabsTrigger value="preview">Query Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-6">
          {/* Query Information */}
          <Card>
            <CardHeader>
              <CardTitle>Query Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="queryName">Query Name</Label>
                  <Input
                    id="queryName"
                    placeholder="Enter query name..."
                    value={queryName}
                    onChange={(e) => setQueryName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinical">Clinical Research</SelectItem>
                      <SelectItem value="epidemiological">Epidemiological Study</SelectItem>
                      <SelectItem value="outcomes">Outcomes Research</SelectItem>
                      <SelectItem value="safety">Safety Analysis</SelectItem>
                      <SelectItem value="quality">Quality Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="queryDescription">Description</Label>
                <Textarea
                  id="queryDescription"
                  placeholder="Describe the purpose and goals of this query..."
                  value={queryDescription}
                  onChange={(e) => setQueryDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dataset Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Select Datasets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-health-light-gray/50"
                  >
                    <Checkbox
                      checked={selectedDatasets.includes(dataset.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDatasets([...selectedDatasets, dataset.id]);
                        } else {
                          setSelectedDatasets(selectedDatasets.filter(id => id !== dataset.id));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-health-teal">{dataset.name}</h3>
                      <p className="text-sm text-health-charcoal/70">{dataset.description}</p>
                      <Badge variant="secondary" className="mt-1">
                        {dataset.records.toLocaleString()} records
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Query Conditions</span>
                </div>
                <Button onClick={addCondition} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Condition
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {conditions.length === 0 ? (
                <div className="text-center py-8 text-health-charcoal/70">
                  <Filter className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No conditions added yet. Click "Add Condition" to start building your query.</p>
                </div>
              ) : (
                conditions.map((condition, index) => (
                  <div key={condition.id} className="space-y-4">
                    {index > 0 && (
                      <div className="flex items-center justify-center">
                        <Select
                          value={condition.connector}
                          onValueChange={(value) => updateCondition(condition.id, 'connector', value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                        <Select
                          value={condition.field}
                          onValueChange={(value) => updateCondition(condition.id, 'field', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Field" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(fields).map(([category, fieldList]) => (
                              <div key={category}>
                                <div className="px-2 py-1 text-xs font-medium text-health-charcoal/70 uppercase">
                                  {category}
                                </div>
                                {fieldList.map(field => (
                                  <SelectItem key={field} value={field}>{field}</SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(condition.id, 'operator', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map(op => (
                              <SelectItem key={op} value={op}>
                                {op.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Value"
                          value={condition.value}
                          onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                        />

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCondition(condition.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Result Limit</Label>
                  <Select defaultValue="1000">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 records</SelectItem>
                      <SelectItem value="500">500 records</SelectItem>
                      <SelectItem value="1000">1,000 records</SelectItem>
                      <SelectItem value="5000">5,000 records</SelectItem>
                      <SelectItem value="10000">10,000 records</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Sort By</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="age">Age</SelectItem>
                      <SelectItem value="outcome">Outcome</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Date Range</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                      <SelectItem value="last-year">Last Year</SelectItem>
                      <SelectItem value="all-time">All Time</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sql">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="w-5 h-5" />
                <span>SQL Query Editor</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>SQL Query</Label>
                  <Button onClick={generateSQL} size="sm" variant="outline">
                    Generate from Conditions
                  </Button>
                </div>
                <Textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="SELECT * FROM health_records WHERE..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Validate Query
                </Button>
                <Button variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save as Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Query Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Query Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Query Name:</span>
                      <span className="font-medium">{queryName || 'Untitled Query'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Datasets:</span>
                      <span className="font-medium">{selectedDatasets.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conditions:</span>
                      <span className="font-medium">{conditions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Records:</span>
                      <span className="font-medium text-health-teal">~2,340</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Selected Datasets</h3>
                  <div className="space-y-1">
                    {selectedDatasets.map(id => {
                      const dataset = datasets.find(d => d.id === id);
                      return dataset ? (
                        <Badge key={id} variant="secondary">
                          {dataset.name}
                        </Badge>
                      ) : null;
                    })}
                    {selectedDatasets.length === 0 && (
                      <p className="text-sm text-health-charcoal/70">No datasets selected</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Query Conditions</h3>
                {conditions.length === 0 ? (
                  <p className="text-sm text-health-charcoal/70">No conditions defined</p>
                ) : (
                  <div className="space-y-2">
                    {conditions.map((condition, index) => (
                      <div key={condition.id} className="text-sm">
                        {index > 0 && <span className="text-health-aqua font-medium">{condition.connector} </span>}
                        <span className="font-medium">{condition.field}</span>
                        <span className="mx-2">{condition.operator.replace('_', ' ')}</span>
                        <span className="text-health-teal">"{condition.value}"</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button onClick={runQuery} className="bg-health-success hover:bg-health-success/90 text-white">
                  <Play className="w-4 h-4 mr-2" />
                  Execute Query
                </Button>
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Query
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResearcherQueryBuilder;
