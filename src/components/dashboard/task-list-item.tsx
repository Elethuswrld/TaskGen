'use client';

import type { Task } from '@/lib/types';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { deleteTask } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskListItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const statusVariantMap: { [key in Task['status']]: "default" | "secondary" | "outline" } = {
    'todo': 'secondary',
    'in-progress': 'default',
    'done': 'outline'
}

export function TaskListItem({ task, onEdit }: TaskListItemProps) {
  const { toast } = useToast();

  const handleDelete = async () => {
    const result = await deleteTask(task.id);
    if (result.error) {
      toast({
        title: 'Error',
        description: 'Failed to delete the task.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Task deleted successfully.',
      });
    }
  };

  const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate as any);


  return (
    <TableRow>
      <TableCell>
        <Badge variant={statusVariantMap[task.status]}>
            {task.status.replace('-', ' ')}
        </Badge>
      </TableCell>
      <TableCell className="font-medium">{task.title}</TableCell>
      <TableCell className={cn("hidden md:table-cell", new Date() > dueDate && task.status !== 'done' ? 'text-destructive' : 'text-muted-foreground')}>
        {format(dueDate, 'PPP')}
      </TableCell>
      <TableCell className="text-right">
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                task &quot;{task.title}&quot;.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}
