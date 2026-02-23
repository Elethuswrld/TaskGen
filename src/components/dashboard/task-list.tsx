'use client';

import type { Task } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TaskListItem } from './task-list-item';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export function TaskList({ tasks, onEdit }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-md border border-dashed">
        <h3 className="text-lg font-semibold">No tasks yet</h3>
        <p className="text-sm text-muted-foreground">
          Create a new task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[150px]'>Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Due Date</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TaskListItem key={task.id} task={task} onEdit={onEdit} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
