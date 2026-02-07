import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2, Plus, Save, Shield } from 'lucide-react';

const mockTemplates = [
  { id: 'TEMPLATE-001', name: 'Insurance Claim', purpose: 'Insurance Claim Verification', fields: ['Medical History', 'Lab Results'], urgency: 'normal', message: 'Please provide these for insurance.' },
  { id: 'TEMPLATE-002', name: 'Specialist Referral', purpose: 'Specialist Referral', fields: ['Diagnostic Images'], urgency: 'high', message: '' },
];

const availableDataFields = [
  'Basic Demographics',
  'Medical History',
  'Current Medications',
  'Lab Results',
  'Diagnostic Images',
  'Vital Signs',
  'Allergies',
  'Immunization Records',
  'Surgical History',
  'Family Medical History'
];

const DoctorCreateTemplate = () => {
  const [templates, setTemplates] = useState(mockTemplates);
  const [editing, setEditing] = useState(null as null | string);
  const [form, setForm] = useState({
    name: '',
    purpose: '',
    fields: [] as string[],
    urgency: 'normal',
    message: '',
  });

  const handleEdit = (template: typeof mockTemplates[0]) => {
    setEditing(template.id);
    setForm({
      name: template.name,
      purpose: template.purpose,
      fields: template.fields,
      urgency: template.urgency,
      message: template.message,
    });
  };

  const handleDelete = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    if (editing === id) setEditing(null);
  };

  const handleSave = () => {
    if (editing) {
      setTemplates(templates.map(t => t.id === editing ? { ...t, ...form } : t));
    } else {
      setTemplates([...templates, { id: `TEMPLATE-${templates.length + 1}`, ...form }]);
    }
    setEditing(null);
    setForm({ name: '', purpose: '', fields: [], urgency: 'normal', message: '' });
  };

  const handleFieldChange = (field: string, checked: boolean) => {
    setForm({ ...form, fields: checked ? [...form.fields, field] : form.fields.filter(f => f !== field) });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Proof Request Templates</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-health-charcoal">Create and manage reusable proof request templates</span>
            <span className="flex items-center ml-2 text-xs text-health-success font-semibold"><span className="w-2 h-2 rounded-full bg-health-success mr-1"></span>Live</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setEditing(null); setForm({ name: '', purpose: '', fields: [], urgency: 'normal', message: '' }); }}><Plus className="w-4 h-4 mr-2" />New Template</Button>
        </div>
      </div>

      {/* Template List */}
      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.length === 0 ? (
              <div className="text-center text-health-charcoal/60 py-8">No templates found.</div>
            ) : (
              templates.map(template => (
                <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-health-light-gray/40 transition">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-health-charcoal/70">{template.purpose}</p>
                    <p className="text-xs text-health-charcoal/50">Fields: {template.fields.join(', ')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" onClick={() => handleEdit(template)}><Edit className="w-4 h-4" /></Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(template.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Template Form */}
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>{editing ? 'Edit Template' : 'New Template'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Input
              placeholder="Template Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="mb-2"
            />
            <Input
              placeholder="Purpose"
              value={form.purpose}
              onChange={e => setForm({ ...form, purpose: e.target.value })}
              className="mb-2"
            />
            <Select value={form.urgency} onValueChange={urgency => setForm({ ...form, urgency })}>
              <SelectTrigger>
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="mb-1 font-medium">Data Fields</div>
            <div className="grid grid-cols-2 gap-2">
              {availableDataFields.map(field => (
                <div key={field} className="flex items-center gap-2">
                  <Checkbox
                    id={field}
                    checked={form.fields.includes(field)}
                    onCheckedChange={checked => handleFieldChange(field, checked as boolean)}
                  />
                  <label htmlFor={field} className="text-sm cursor-pointer">{field}</label>
                </div>
              ))}
            </div>
          </div>
          <Textarea
            placeholder="Default message (optional)"
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            rows={3}
          />
          <Button className="w-full bg-health-teal hover:bg-health-teal/90 text-white mt-2" onClick={handleSave} disabled={!form.name || !form.purpose || form.fields.length === 0}>
            <Save className="w-4 h-4 mr-2" />Save Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorCreateTemplate; 