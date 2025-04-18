
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  Star,
  Calendar,
  MoreHorizontal,
  ArrowUpDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import Layout from '@/components/Layout';
import { useTeachers } from '@/contexts/TeacherContext';
import TeacherForm from '@/components/TeacherForm';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminTeachers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { teachers, deleteTeacher, updateTeacher } = useTeachers();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Filter teachers based on search query
  const filteredTeachers = teachers.filter(teacher => {
    const searchLower = searchQuery.toLowerCase();
    return (
      teacher.name.toLowerCase().includes(searchLower) ||
      teacher.specialties.some(specialty => specialty.toLowerCase().includes(searchLower))
    );
  });
  
  // Sort teachers based on selected column and direction
  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let valueA, valueB;
    
    switch (sortColumn) {
      case 'name':
        valueA = a.name;
        valueB = b.name;
        break;
      case 'rating':
        valueA = a.rating;
        valueB = b.rating;
        break;
      case 'experience':
        valueA = a.experience;
        valueB = b.experience;
        break;
      case 'reviewCount':
        valueA = a.reviewCount;
        valueB = b.reviewCount;
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const handleEditTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsEditTeacherOpen(true);
  };
  
  const handleDeleteClick = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedTeacher) {
      deleteTeacher(selectedTeacher.id);
      toast({
        title: "Teacher deleted",
        description: `${selectedTeacher.name} has been removed from the platform.`
      });
      setIsDeleteDialogOpen(false);
    }
  };

  const handleTeacherAdded = () => {
    setIsAddTeacherOpen(false);
    toast({
      title: "Teacher added",
      description: "The new teacher has been added successfully."
    });
  };

  const handleTeacherUpdated = (updatedTeacher: any) => {
    updateTeacher(updatedTeacher.id, updatedTeacher);
    setIsEditTeacherOpen(false);
    toast({
      title: "Teacher updated",
      description: "The teacher information has been updated successfully."
    });
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Manage Teachers</h1>
            <p className="text-gray-600">
              Add, edit or remove yoga teachers for 1-on-1 sessions
            </p>
          </div>
          
          <Button 
            onClick={() => setIsAddTeacherOpen(true)}
            className="bg-yoga-blue hover:bg-yoga-blue/90 text-white"
          >
            <PlusCircle className="mr-2" size={16} />
            Add New Teacher
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <Input
              placeholder="Search teachers by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-500 whitespace-nowrap">
              {filteredTeachers.length} teachers
            </span>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button 
                    variant="ghost" 
                    className="px-0 font-semibold flex items-center"
                    onClick={() => handleSort('name')}
                  >
                    Teacher
                    <ArrowUpDown size={16} className="ml-2" />
                  </Button>
                </TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead className="text-center">
                  <Button 
                    variant="ghost" 
                    className="px-0 font-semibold flex items-center justify-center"
                    onClick={() => handleSort('rating')}
                  >
                    Rating
                    <ArrowUpDown size={16} className="ml-2" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button 
                    variant="ghost" 
                    className="px-0 font-semibold flex items-center justify-center"
                    onClick={() => handleSort('experience')}
                  >
                    Experience
                    <ArrowUpDown size={16} className="ml-2" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button 
                    variant="ghost" 
                    className="px-0 font-semibold flex items-center justify-center"
                    onClick={() => handleSort('reviewCount')}
                  >
                    Reviews
                    <ArrowUpDown size={16} className="ml-2" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Sessions</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTeachers.length > 0 ? (
                sortedTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                          <img 
                            src={teacher.avatarUrl || "/placeholder.svg"} 
                            alt={teacher.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          {teacher.name}
                          <Badge className="ml-2 bg-pink-500">Yoga Therapist</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.specialties.slice(0, 2).map((specialty, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-50">
                            {specialty}
                          </Badge>
                        ))}
                        {teacher.specialties.length > 2 && (
                          <Badge variant="outline" className="bg-gray-50">
                            +{teacher.specialties.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Star className="text-green-500 fill-green-500 mr-1" size={16} />
                        <span>{teacher.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {teacher.experience} years
                    </TableCell>
                    <TableCell className="text-center">{teacher.reviewCount}</TableCell>
                    <TableCell className="text-center flex items-center justify-center">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1 text-gray-500" />
                        <span>{teacher.totalSessions}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => navigate(`/teachers/${teacher.id}`)}
                          >
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditTeacher(teacher)}
                          >
                            <Edit className="mr-2" size={14} />
                            Edit Teacher
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(teacher)}
                          >
                            <Trash2 className="mr-2" size={14} />
                            Delete Teacher
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                    {searchQuery ? 'No teachers match your search' : 'No teachers available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Add Teacher Dialog */}
      <Dialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
            <DialogDescription>
              Add a new yoga teacher to offer 1-on-1 sessions for students.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh]">
            <TeacherForm 
              onComplete={handleTeacherAdded}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Edit Teacher Dialog */}
      <Dialog open={isEditTeacherOpen} onOpenChange={setIsEditTeacherOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>
              Update the teacher's information and availability.
            </DialogDescription>
          </DialogHeader>
          {selectedTeacher && (
            <ScrollArea className="max-h-[65vh]">
              <TeacherForm 
                teacher={selectedTeacher}
                onComplete={handleTeacherUpdated}
              />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedTeacher?.name}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:justify-center">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              <Trash2 className="mr-2" size={16} />
              Delete Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminTeachers;
