import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle, 
  Edit, 
  Trash2, 
  Filter,
  Search,
  Save,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';

interface TodoItem {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedTo: string;
  department: string;
  dueDate: string;
  createdDate: string;
  createdBy: string;
  completed: boolean;
}

interface TodoListProps {
  session?: any;
}

export function TodoList({ session }: TodoListProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<TodoItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'Medium' as const,
    assignedTo: '',
    department: '',
    dueDate: ''
  });

  const departments = [
    'Administration',
    'Cardiology', 
    'Emergency',
    'Laboratory',
    'Neurology',
    'Nursing',
    'Orthopedics',
    'Pediatrics',
    'Pharmacy',
    'Radiology'
  ];

  const staff = [
    'Dr. Smith',
    'Dr. Johnson', 
    'Dr. Brown',
    'Nurse Mary',
    'Nurse John',
    'Admin Staff',
    'Lab Tech',
    'Pharmacist'
  ];

  // Sample data
  const sampleTodos: TodoItem[] = [
    {
      id: '1',
      title: 'Update Patient Records System',
      description: 'Migrate patient records to new digital format',
      priority: 'High',
      status: 'In Progress',
      assignedTo: 'Admin Staff',
      department: 'Administration',
      dueDate: '2024-01-20',
      createdDate: '2024-01-15',
      createdBy: 'Super Admin',
      completed: false
    },
    {
      id: '2',
      title: 'Equipment Maintenance Check',
      description: 'Monthly maintenance of cardiology equipment',
      priority: 'Medium',
      status: 'Pending',
      assignedTo: 'Dr. Smith',
      department: 'Cardiology',
      dueDate: '2024-01-18',
      createdDate: '2024-01-10',
      createdBy: 'Department Head',
      completed: false
    },
    {
      id: '3',
      title: 'Staff Training Session',
      description: 'Emergency response training for nursing staff',
      priority: 'Critical',
      status: 'Pending',
      assignedTo: 'Nurse Mary',
      department: 'Nursing',
      dueDate: '2024-01-17',
      createdDate: '2024-01-12',
      createdBy: 'HR Manager',
      completed: false
    }
  ];

  useEffect(() => {
    setTodos(sampleTodos);
  }, []);

  useEffect(() => {
    let filtered = todos.filter(todo => {
      const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           todo.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || todo.status === filterStatus;
      const matchesDepartment = filterDepartment === 'all' || todo.department === filterDepartment;
      
      return matchesSearch && matchesPriority && matchesStatus && matchesDepartment;
    });
    setFilteredTodos(filtered);
  }, [todos, searchTerm, filterPriority, filterStatus, filterDepartment]);

  const handleAddTodo = () => {
    if (!newTodo.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const todo: TodoItem = {
      id: Date.now().toString(),
      ...newTodo,
      status: 'Pending',
      createdDate: new Date().toISOString().split('T')[0],
      createdBy: session?.name || 'User',
      completed: false
    };

    setTodos([...todos, todo]);
    setNewTodo({
      title: '',
      description: '',
      priority: 'Medium',
      assignedTo: '',
      department: '',
      dueDate: ''
    });
    setIsAddDialogOpen(false);
    toast.success('Task added successfully');
  };

  const handleToggleComplete = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id 
        ? { 
            ...todo, 
            completed: !todo.completed,
            status: !todo.completed ? 'Completed' : 'Pending'
          }
        : todo
    ));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
    toast.success('Task deleted successfully');
  };

  const handleEditTodo = (todo: TodoItem) => {
    setEditingTodo(todo);
  };

  const handleUpdateTodo = () => {
    if (!editingTodo) return;

    setTodos(todos.map(todo => 
      todo.id === editingTodo.id ? editingTodo : todo
    ));
    setEditingTodo(null);
    toast.success('Task updated successfully');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'destructive';
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'In Progress': return 'secondary';
      case 'Pending': return 'outline';
      default: return 'outline';
    }
  };

  const pendingTasks = todos.filter(t => !t.completed).length;
  const completedTasks = todos.filter(t => t.completed).length;
  const overdueTasks = todos.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <CheckSquare className="size-8 text-primary" />
              To Do List
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage hospital tasks and assignments
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                    placeholder="Enter task title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={newTodo.priority} onValueChange={(value: any) => setNewTodo({...newTodo, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={newTodo.dueDate}
                      onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select value={newTodo.assignedTo} onValueChange={(value) => setNewTodo({...newTodo, assignedTo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map(person => (
                        <SelectItem key={person} value={person}>{person}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={newTodo.department} onValueChange={(value) => setNewTodo({...newTodo, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddTodo} className="flex-1">
                    <Save className="size-4 mr-2" />
                    Add Task
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold text-foreground">{todos.length}</p>
              </div>
              <CheckSquare className="size-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{pendingTasks}</p>
              </div>
              <Clock className="size-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">{completedTasks}</p>
              </div>
              <CheckSquare className="size-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-foreground">{overdueTasks}</p>
              </div>
              <AlertCircle className="size-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterPriority('all');
                  setFilterStatus('all');
                  setFilterDepartment('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks ({filteredTodos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTodos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 border rounded-lg ${todo.completed ? 'bg-muted/50' : 'bg-card'}`}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => handleToggleComplete(todo.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {todo.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{todo.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1">
                            <User className="size-4 text-muted-foreground" />
                            <span className="text-sm">{todo.assignedTo}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="size-4 text-muted-foreground" />
                            <span className="text-sm">{todo.dueDate}</span>
                          </div>
                          <Badge variant={getPriorityColor(todo.priority)}>
                            {todo.priority}
                          </Badge>
                          <Badge variant={getStatusColor(todo.status)}>
                            {todo.status}
                          </Badge>
                          <Badge variant="outline">
                            {todo.department}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTodo(todo)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTodo(todo.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredTodos.length === 0 && (
              <div className="text-center py-8">
                <CheckSquare className="size-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tasks found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingTodo && (
        <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingTodo.title}
                  onChange={(e) => setEditingTodo({...editingTodo, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingTodo.description}
                  onChange={(e) => setEditingTodo({...editingTodo, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={editingTodo.priority} onValueChange={(value: any) => setEditingTodo({...editingTodo, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editingTodo.status} onValueChange={(value: any) => setEditingTodo({...editingTodo, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateTodo} className="flex-1">
                  <Save className="size-4 mr-2" />
                  Update
                </Button>
                <Button variant="outline" onClick={() => setEditingTodo(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

