import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface EditField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
}

interface EditEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: EditField[];
  initialValues: Record<string, string | number>;
  onSave: (values: Record<string, string | number>) => Promise<void>;
}

const EditEntryDialog = ({
  open,
  onOpenChange,
  title,
  fields,
  initialValues,
  onSave,
}: EditEntryDialogProps) => {
  const [values, setValues] = useState<Record<string, string | number>>(initialValues);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(values);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (name: string, value: string | number) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {title}</DialogTitle>
          <DialogDescription>
            Make changes to your entry. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {fields.map((field) => (
            <div key={field.name} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={field.name} className="text-right">
                {field.label}
              </Label>
              {field.type === 'select' && field.options ? (
                <Select
                  value={String(values[field.name])}
                  onValueChange={(value) => handleChange(field.name, value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  value={values[field.name]}
                  onChange={(e) =>
                    handleChange(
                      field.name,
                      field.type === 'number' ? Number(e.target.value) : e.target.value
                    )
                  }
                  className="col-span-3"
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditEntryDialog;
