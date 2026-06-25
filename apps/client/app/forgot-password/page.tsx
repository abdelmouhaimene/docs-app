'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, CircularProgress, InputAdornment } from '@mui/material';
import { Person, Email, ArrowBack } from '@mui/icons-material';
import { toast } from 'react-toastify';

// Validation schema
const forgotPasswordSchema = z.object({
  matricule: z
    .string()
    .min(1, 'Le matricule est requis')
    .length(6, 'Le matricule doit contenir exactement 6 caractères')
    .regex(/^[A-Za-z0-9]+$/, 'Le matricule ne doit contenir que des lettres et chiffres'),
  email: z.string().min(1, 'L\'email est requis').email('Email invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      matricule: '',
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Forgot password data:', data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSubmitted(true);
      toast.success('Instructions envoyées par email!');
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-black bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: 'url(/bg.webp)' }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Card */}
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

          {!isSubmitted ? (
            <>
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#eabb1c] mb-2">
                  Mot de passe oublié
                </h1>
                <p className="text-gray-300">
                  Entrez votre matricule et email pour réinitialiser votre mot de passe
                </p>
              </div>

              {/* Form */}
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

                {/* Email Field */}
                <div>
                  <TextField
                    {...register('email')}
                    fullWidth
                    type="email"
                    label="Email"
                    placeholder="votre.email@exemple.com"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email className="text-[#eabb1c]" />
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
                    'Envoyer les instructions'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-[#eabb1c] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Email className="text-black text-4xl" />
                </div>
                <h1 className="text-3xl font-bold text-[#eabb1c] mb-2">
                  Email envoyé!
                </h1>
                <p className="text-gray-300 mb-4">
                  Nous avons envoyé les instructions de réinitialisation à votre adresse email.
                </p>
                <p className="text-gray-400 text-sm">
                  Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
                </p>
              </div>
            </>
          )}

          {/* Back to Login */}
          <div className="mt-6">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-[#eabb1c] hover:text-[#d4a818] transition-colors"
            >
              <ArrowBack className="text-sm" />
              <span className="font-medium">Retour à la connexion</span>
            </Link>
          </div>

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
