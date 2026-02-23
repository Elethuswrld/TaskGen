'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { createTask, updateTask } from '@/lib/actions';
import type { Task } from '@/lib/types';
import { useState } from 'react';
import { smartTaskTitler } from '@/ai/flows/smart-task-titler-flow';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.date({
    required_error: 'A due date is required.',
  }),
  status: z.enum(['todo', 'in-progress', 'done']),
});

interface TaskFormProps {
  userId: string;
  task?: Task | null;
  onSuccess: () => void;
}

export function TaskForm({ userId, task, onSuccess }: TaskFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      dueDate: task?.dueDate ? task.dueDate.toDate() : new Date(),
      status: task?.status || 'todo',
    },
  });
  
  const descriptionValue = form.watch('description');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    const result = task
      ? await updateTask(task.id, values)
      : await createTask(userId, values);
    setIsSaving(false);

    if (result.error) {
      toast({
        title: 'Error',
        description: `Failed to ${task ? 'update' : 'create'} task.`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: `Task has been ${task ? 'updated' : 'created'}.`,
      });
      onSuccess();
    }
  }

  async function handleSuggestTitles() {
    if (!descriptionValue || descriptionValue.length < 10) {
        toast({ title: 'Please enter a longer description (at least 10 characters).', variant: 'destructive' });
        return;
    }
    setIsSuggesting(true);
    setSuggestedTitles([]);
    try {
        const result = await smartTaskTitler({ description: descriptionValue });
        setSuggestedTitles(result.suggestedTitles);
    } catch (error) {
        toast({ title: 'Failed to suggest titles.', variant: 'destructive' });
    }
    setIsSuggesting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Design the new dashboard" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Add more details about the task..." {...field} />
              </FormControl>
                <div className="flex items-center justify-between pt-1">
                    <FormDescription>
                        Describe the task to get AI title suggestions.
                    </FormDescription>
                    <Button type="button" size="sm" variant="outline" onClick={handleSuggestTitles} disabled={isSuggesting || !descriptionValue}>
                        {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                        Suggest
                    </Button>
                </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {suggestedTitles.length > 0 && (
            <div className="space-y-2 rounded-md border bg-muted/50 p-3">
                <p className="text-sm font-medium">Suggested Titles</p>
                <div className="flex flex-wrap gap-2">
                    {suggestedTitles.map((title, index) => (
                        <Button key={index} size="sm" variant="secondary" onClick={() => form.setValue('title', title)}>
                            {title}
                        </Button>
                    ))}
                </div>
            </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
