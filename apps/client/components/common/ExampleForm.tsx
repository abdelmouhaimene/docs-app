'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, TextField, Button } from '@mui/material';
import { toast } from 'react-toastify';

// Define validation schema with Zod
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof formSchema>;

export default function ExampleForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      email: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Form data:', data);
      toast.success('Form submitted successfully!');
      reset();
    } catch (error) {
      toast.error('Failed to submit form');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <TextField
        {...register('title')}
        label="Title"
        fullWidth
        margin="normal"
        error={!!errors.title}
        helperText={errors.title?.message}
      />

      <TextField
        {...register('description')}
        label="Description"
        fullWidth
        margin="normal"
        multiline
        rows={4}
        error={!!errors.description}
        helperText={errors.description?.message}
      />

      <TextField
        {...register('email')}
        label="Email"
        fullWidth
        margin="normal"
        type="email"
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={isSubmitting}
        sx={{ mt: 2 }}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </Box>
  );
}
