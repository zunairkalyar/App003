import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, Eye, MessageSquare, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMessageTemplates } from '@/hooks/useMessageTemplates';

const MessageTemplates = () => {
  const { toast } = useToast();
  const { templates, saveTemplate, deleteTemplate } = useMessageTemplates();
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    status: '',
    name: '',
    content: '',
  });

  const statusOptions = [
    { value: 'pending', label: 'Pending Payment' },
    { value: 'processing', label: 'Processing' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'failed', label: 'Failed' },
  ];

  const placeholders = [
    { key: '{customer_name}', description: 'Customer\'s full name' },
    { key: '{order_id}', description: 'Order number' },
    { key: '{order_total}', description: 'Order total amount' },
    { key: '{store_name}', description: 'Your store name' },
  ];

  const handleSave = () => {
    if (!formData.status || !formData.name || !formData.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      saveTemplate(formData.status, {
        name: formData.name,
        content: formData.content,
      });
      
      setFormData({ status: '', name: '', content: '' });
      setEditingTemplate(null);
      
      toast({
        title: "Template Saved",
        description: `Message template for ${formData.status} status has been saved.`,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (status: string) => {
    const template = templates[status];
    if (template) {
      setFormData({
        status,
        name: template.name,
        content: template.content,
      });
      setEditingTemplate(status);
    }
  };

  const handleDelete = (status: string) => {
    try {
      deleteTemplate(status);
      toast({
        title: "Template Deleted",
        description: `Message template for ${status} status has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({ status: '', name: '', content: '' });
    setEditingTemplate(null);
  };

  const getPreviewContent = (content: string) => {
    return content
      .replace('{customer_name}', 'John Doe')
      .replace('{order_id}', '#123')
      .replace('{order_total}', '$99.99')
      .replace('{store_name}', 'Your Store');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Message Templates
          </CardTitle>
          <CardDescription>
            Create custom SMS templates for different order statuses with dynamic placeholders.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Template Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Order Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                disabled={!!editingTemplate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Order Confirmation"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Message Content *</Label>
            <Textarea
              id="content"
              placeholder="Hi {customer_name}, your order {order_id} for {order_total} has been confirmed!"
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          {/* Placeholders Help */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Available placeholders:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {placeholders.map((placeholder) => (
                    <div key={placeholder.key} className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {placeholder.key}
                      </Badge>
                      <span className="text-muted-foreground">{placeholder.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Preview */}
          {formData.content && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm">{getPreviewContent(formData.content)}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1">
              {editingTemplate ? 'Update Template' : 'Save Template'}
            </Button>
            {editingTemplate && (
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Templates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Existing Templates</h3>
        {Object.keys(templates).length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No templates created yet. Create your first template above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {Object.entries(templates).map(([status, template]) => (
              <Card key={status}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline">
                          {statusOptions.find(opt => opt.value === status)?.label || status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.content}
                      </p>
                      {previewTemplate === status && (
                        <div className="mt-2 p-2 border rounded bg-muted/50">
                          <p className="text-sm">
                            <strong>Preview:</strong> {getPreviewContent(template.content)}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewTemplate(previewTemplate === status ? null : status)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(status)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(status)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageTemplates;
