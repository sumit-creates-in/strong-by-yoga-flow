
import React, { useState } from 'react';
import { useTeachers, CreditPackage } from '../contexts/TeacherContext';
import { Pencil, Trash, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';

interface CreditPackageFormData {
  name: string;
  price: number;
  credits: number;
  popular: boolean;
  mostValue: boolean;
}

interface EditPackageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: CreditPackageFormData;
  onSave: (data: CreditPackageFormData) => void;
  mode: 'add' | 'edit';
}

const EditPackageDialog: React.FC<EditPackageDialogProps> = ({ 
  isOpen, onClose, initialData, onSave, mode 
}) => {
  const [formData, setFormData] = useState<CreditPackageFormData>(initialData);
  
  const handleChange = (field: keyof CreditPackageFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Package' : 'Edit Package'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Create a new credit package for users to purchase.' 
              : 'Make changes to the credit package.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Basic Package"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.price}
                  onChange={(e) => handleChange('price', Number(e.target.value))}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.credits}
                  onChange={(e) => handleChange('credits', Number(e.target.value))}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="popular"
                  checked={formData.popular}
                  onCheckedChange={(checked) => handleChange('popular', checked)}
                />
                <Label htmlFor="popular">Mark as Popular</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="mostValue"
                  checked={formData.mostValue}
                  onCheckedChange={(checked) => handleChange('mostValue', checked)}
                />
                <Label htmlFor="mostValue">Mark as Best Value</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Create Package' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CreditPackageManager: React.FC = () => {
  const { creditPackages, addCreditPackage, updateCreditPackage, deleteCreditPackage } = useTeachers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreditPackageFormData>({
    name: '',
    price: 0,
    credits: 0,
    popular: false,
    mostValue: false
  });
  
  const handleAddPackage = () => {
    setDialogMode('add');
    setFormData({
      name: '',
      price: 0,
      credits: 0,
      popular: false,
      mostValue: false
    });
    setIsDialogOpen(true);
  };
  
  const handleEditPackage = (pkg: CreditPackage) => {
    setDialogMode('edit');
    setEditingPackageId(pkg.id);
    setFormData({
      name: pkg.name,
      price: pkg.price,
      credits: pkg.credits,
      popular: pkg.popular || false,
      mostValue: pkg.mostValue || false
    });
    setIsDialogOpen(true);
  };
  
  const handleSavePackage = (data: CreditPackageFormData) => {
    if (dialogMode === 'add') {
      addCreditPackage(data);
    } else {
      if (editingPackageId) {
        updateCreditPackage({
          id: editingPackageId,
          ...data
        });
      }
    }
    
    setIsDialogOpen(false);
  };
  
  const handleDeletePackage = (id: string) => {
    deleteCreditPackage(id);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Packages</CardTitle>
        <CardDescription>Manage credit packages available for purchase</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button onClick={handleAddPackage}>
            Add New Package
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price ($)</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Value Ratio</TableHead>
              <TableHead>Labels</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creditPackages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">{pkg.name}</TableCell>
                <TableCell>${pkg.price}</TableCell>
                <TableCell>{pkg.credits}</TableCell>
                <TableCell>{pkg.credits / pkg.price} per $</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {pkg.popular && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        Popular
                      </span>
                    )}
                    {pkg.mostValue && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                        Best Value
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditPackage(pkg)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Package</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this package? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {creditPackages.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No credit packages found. Click "Add New Package" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <EditPackageDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          initialData={formData}
          onSave={handleSavePackage}
          mode={dialogMode}
        />
      </CardContent>
    </Card>
  );
};

export default CreditPackageManager;
