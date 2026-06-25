'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import { toast } from 'react-toastify';

// Validation schema
const loginSchema = z.object({
  matricule: z
    .string()
    .min(1, 'Le matricule est requis')
    .length(6, 'Le matricule doit contenir exactement 6 caractères')
    .regex(/^[A-Za-z0-9]+$/, 'Le matricule ne doit contenir que des lettres et chiffres'),
  password: z.string().min(1, 'Le mot de passe est requis'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      matricule: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matricule: data.matricule,
          password: data.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const result = await response.json();

      // Store token in cookie
      document.cookie = `token=${result.access_token}; path=/; max-age=${data.rememberMe ? 604800 : 86400}`; // 7 days or 1 day

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(result.user));

      toast.success('Connexion réussie!');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      toast.error('Matricule ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-black bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: 'url(/bg.webp)' }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-[#eabb1c]/30">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="MCA Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#eabb1c] mb-2">
              Connexion
            </h1>
            <p className="text-gray-300">
              Système de Gestion des Documents
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Matricule Field */}
            <div>
              <TextField
                {...register('matricule')}
                fullWidth
                label="Matricule"
                placeholder="Ex: ABC123"
                error={!!errors.matricule}
                helperText={errors.matricule?.message}
                disabled={isLoading}
                inputProps={{
                  maxLength: 6,
                  style: { textTransform: 'uppercase' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person className="text-[#eabb1c]" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': {
                      borderColor: 'rgba(234, 187, 28, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(234, 187, 28, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#eabb1c',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#d1d5db',
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                  '& .MuiFormHelperText-root': {
                    backgroundColor: 'transparent',
                  },
                }}
              />
            </div>

            {/* Password Field */}
            <div>
              <TextField
                {...register('password')}
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="Mot de passe"
                placeholder="Entrez votre mot de passe"
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="text-[#eabb1c]" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        disabled={isLoading}
                        sx={{ color: '#eabb1c' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': {
                      borderColor: 'rgba(234, 187, 28, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(234, 187, 28, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#eabb1c',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#d1d5db',
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                  '& .MuiFormHelperText-root': {
                    backgroundColor: 'transparent',
                  },
                }}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <FormControlLabel
                control={
                  <Checkbox
                    {...register('rememberMe')}
                    disabled={isLoading}
                    sx={{
                      color: '#eabb1c',
                      '&.Mui-checked': {
                        color: '#eabb1c',
                      },
                    }}
                  />
                }
                label={
                  <span className="text-gray-300 text-sm">Se souvenir de moi</span>
                }
              />
              <Link
                href="/forgot-password"
                className="text-[#eabb1c] hover:text-[#d4a818] text-sm font-medium transition-colors"
              >
                Mot de passe oublié?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                backgroundColor: '#eabb1c',
                color: '#000000',
                fontWeight: 'bold',
                fontSize: '1rem',
                padding: '12px',
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#d4a818',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(234, 187, 28, 0.5)',
                  color: 'rgba(0, 0, 0, 0.5)',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: '#000000' }} />
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 MCA Document Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
