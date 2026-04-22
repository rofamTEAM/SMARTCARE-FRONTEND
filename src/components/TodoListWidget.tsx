import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  AlertCircle,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import { todosApi } from '../utils/api';

interface TodoItem {
  id: string | number;
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

interface TodoListWidgetProps {
  session?: any;
  maxItems?: number;
}

export function TodoListWidget({ session, maxItems = 5 }: TodoListWidgetProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'Medium' as const,
    assignedTo: '',
    department: '',
    dueDate: ''
  });

  const departments = [
    'Administration', 'Cardiology', 'Emergency', 'Laboratory',
    'Neurology', 'Nursing', 'Orthopedics', 'Pediatrics',
    'Pharmacy', 'Radiology'
  ];

  const staff = [
    'Dr. Smith', 'Dr. Johnson', 'Dr. Brown', 'Nurse Mary',
    'Nurse John', 'Admin Staff', 'Lab Tech', 'Pharmacist'
  ];

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todosApi.getAll();
      if (data && Array.isArray(data)) {
        const formattedTodos = data.map((todo: any) => ({
          id: todo.id,
          title: todo.title || todo.name || 'Untitled',
          description: todo.description || todo.notes || '',
          priority: todo.priority || 'Medium',
          status: todo.status || 'Pending',
          assignedTo: todo.assignedTo || todo.assignee || 'Unassigned',
          department: todo.department || 'General',
          dueDate: todo.dueDate || todo.date || new Date().toISOString().split('T')[0],
          createdDate: todo.createdDate || todo.createdAt || new Date().toISOString().split('T')[0],
          createdBy: todo.createdBy || 'System',
          completed: todo.completed || todo.status === 'Completed'
        }));
        setTodos(formattedTodos);
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      // Fall back to empty list if API fails
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      const todoData = {
        title: newTodo.title,
        description: newTodo.description,
        priority: newTodo.priority,
        assignedTo: newTodo.assignedTo,
        department: newTodo.department,
        dueDate: newTodo.dueDate ? new Date(newTodo.dueDate) : new Date(),
        status: 'Pending',
        createdBy: session?.name || 'User'
      };

      const savedTodo = await todosApi.create(todoData);
      
      const formattedTodo: TodoItem = {
        id: savedTodo.id,
        title: savedTodo.title || newTodo.title,
        description: savedTodo.description || newTodo.description,
        priority: savedTodo.priority || newTodo.priority,
        status: 'Pending',
        assignedTo: savedTodo.assignedTo || newTodo.assignedTo,
        department: savedTodo.department || newTodo.department,
        dueDate: newTodo.dueDate,
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: session?.name || 'User',
        completed: false
      };

      setTodos([...todos, formattedTodo]);
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
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error('Failed to add task');
    }
  };

  const handleToggleComplete = async (id: string | number) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const newStatus = todo.completed ? 'Pending' : 'Completed';
      await todosApi.update(id, {
        status: newStatus,
        completed: !todo.completed
      });

      setTodos(todos.map(t => 
        t.id === id 
          ? { 
              ...t, 
              completed: !t.completed,
              status: newStatus
            }
          : t
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTodo = async (id: string | number) => {
    try {
      await todosApi.delete(id);
      setTodos(todos.filter(todo => todo.id !== id));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Failed to delete task');
    }
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

  const displayTodos = todos.slice(0, maxItems);
  const pendingTasks = todos.filter(t => !t.completed).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="size-5 text-primary" />
            To Do List
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {pendingTasks} pending
            </Badge>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="size-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      value={newTodo.title}
                      onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                      placeholder="Task title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      value={newTodo.description}
                      onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                      placeholder="Description"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={newTodo.priority} onValueChange={(value: any) => setNewTodo({...newTodo, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={newTodo.dueDate}
                      onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
                    />
                  </div>
                  <Select value={newTodo.assignedTo} onValueChange={(value) => setNewTodo({...newTodo, assignedTo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map(person => (
                        <SelectItem key={person} value={person}>{person}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={newTodo.department} onValueChange={(value) => setNewTodo({...newTodo, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayTodos.map((todo) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 border rounded-lg ${todo.completed ? 'bg-muted/50' : 'bg-card'}`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => handleToggleComplete(todo.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {todo.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{todo.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getPriorityColor(todo.priority)} className="text-xs">
                      {todo.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{todo.assignedTo}</span>
                    {todo.dueDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {todo.dueDate}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </motion.div>
          ))}
          {displayTodos.length === 0 && (
            <div className="text-center py-6">
              <CheckSquare className="size-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No tasks yet</p>
            </div>
          )}
          {todos.length > maxItems && (
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                +{todos.length - maxItems} more tasks
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

