
import React, { useState } from 'react';
import { 
  CreditPackage, 
  useTeachers 
} from '@/contexts/TeacherContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Pencil, Trash, Coins, DollarSign, Star, Award } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, { message: "Package name is required" }),
  price: z.number().min(1, { message: "Price must be at least $1" }),
  credits: z.number().min(1, { message: "Credits must be at least 1" }),
  popular: z.boolean().default(false),
  mostValue: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const CreditPackageManager: React.FC = () => {
  const { creditPackages, addCreditPackage, updateCreditPackage, deleteCreditPackage } = useTeachers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      credits: 0,
      popular: false,
      mostValue: false,
    },
  });
  
  const handleOpenDialog = (pkg?: CreditPackage) => {
    if (pkg) {
      setSelectedPackage(pkg);
      form.reset({
        name: pkg.name,
        price: pkg.price,
        credits: pkg.credits,
        popular: pkg.popular || false,
        mostValue: pkg.mostValue || false,
      });
    } else {
      setSelectedPackage(null);
      form.reset({
        name: "",
        price: 0,
        credits: 0,
        popular: false,
        mostValue: false,
      });
    }
    setIsDialogOpen(true);
  };
  
  const handleDelete = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setIsDeleteDialogOpen(true);
  };
  
  const onSubmit = (values: FormValues) => {
    if (selectedPackage) {
      // Update existing package
      updateCreditPackage({
        ...selectedPackage,
        name: values.name,
        price: values.price,
        credits: values.credits,
        popular: values.popular,
        mostValue: values.mostValue,
      });
    } else {
      // Add new package
      addCreditPackage({
        name: values.name,
        price: values.price,
        credits: values.credits,
        popular: values.popular,
        mostValue: values.mostValue,
      });
    }
    setIsDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Credit Packages</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Package
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditPackages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>${pkg.price.toFixed(2)}</TableCell>
                  <TableCell className="flex items-center">
                    <Coins className="h-4 w-4 text-amber-500 mr-1.5" /> {pkg.credits}
                  </TableCell>
                  <TableCell>
                    {pkg.credits > pkg.price ? (
                      <span className="text-green-600">+{pkg.credits - pkg.price} bonus</span>
                    ) : (
                      <span>--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {pkg.popular && <Star className="h-4 w-4 text-yoga-blue" title="Popular" />}
                    {pkg.mostValue && <Award className="h-4 w-4 text-amber-500" title="Best Value" />}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(pkg)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(pkg)}>
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedPackage ? 'Edit Credit Package' : 'Add Credit Package'}</DialogTitle>
            <DialogDescription>
              {selectedPackage 
                ? 'Update the details of this credit package.'
                : 'Create a new credit package for users to purchase.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Basic Pack" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this credit package
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input 
                            type="number"
                            className="pl-8"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credits</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Coins className="absolute left-2.5 top-2.5 h-4 w-4 text-amber-500" />
                          <Input 
                            type="number"
                            className="pl-8"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="popular"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            // Uncheck "Most Value" if "Popular" is checked
                            if (checked) {
                              form.setValue('mostValue', false);
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1.5 text-yoga-blue" />
                            <span>Mark as Popular</span>
                          </div>
                        </FormLabel>
                        <FormDescription>
                          Highlight as a popular choice
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mostValue"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            // Uncheck "Popular" if "Most Value" is checked
                            if (checked) {
                              form.setValue('popular', false);
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          <div className="flex items-center">
                            <Award className="h-4 w-4 mr-1.5 text-amber-500" />
                            <span>Mark as Best Value</span>
                          </div>
                        </FormLabel>
                        <FormDescription>
                          Highlight as the best value option
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit">
                  {selectedPackage ? 'Save Changes' : 'Add Package'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Credit Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{selectedPackage?.name}" package? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedPackage) {
                  deleteCreditPackage(selectedPackage.id);
                  setIsDeleteDialogOpen(false);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreditPackageManager;
