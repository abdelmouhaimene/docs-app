'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Divider,
    Avatar,
    InputAdornment,
    IconButton,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Badge as BadgeIcon,
    Work as WorkIcon,
    Business as BusinessIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Lock as LockIcon,
    Phone as PhoneIcon,
    History as HistoryIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        } else {
            router.push('/login');
        }
    }, [router]);

    const getAuthToken = () => {
        return document.cookie
            .split('; ')
            .find((row) => row.startsWith('token='))
            ?.split('=')[1];
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword.length < 8) {
            toast.error('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ password: passwordData.newPassword }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Erreur lors de la modification du mot de passe');
            }

            toast.success('Mot de passe modifié avec succès');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) return null;

    return (
        <Box className="p-4 md:p-8 max-w-4xl mx-auto">
            <Typography variant="h4" sx={{ color: '#eabb1c', fontWeight: 'bold', mb: 4 }}>
                Paramètres du compte
            </Typography>

            <Grid container spacing={4}>
                {/* Profile Information */}
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            p: 3,
                            backgroundColor: '#1a1a1a',
                            color: 'white',
                            height: '100%',
                            border: '1px solid rgba(234, 187, 28, 0.1)',
                        }}
                    >
                        <Box className="flex items-center mb-4">
                            <Avatar sx={{ bgcolor: '#eabb1c', width: 56, height: 56, mr: 2 }}>
                                {currentUser.name?.charAt(0) || currentUser.matricule?.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ color: '#eabb1c' }}>
                                    {currentUser.name || 'Utilisateur'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'gray' }}>
                                    {currentUser.role?.toUpperCase()}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                        <Box className="space-y-4">
                            <Box className="flex items-center">
                                <BadgeIcon sx={{ color: '#eabb1c', mr: 2 }} />
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'gray' }}>Matricule</Typography>
                                    <Typography variant="body1">{currentUser.matricule}</Typography>
                                </Box>
                            </Box>

                            <Box className="flex items-center">
                                <EmailIcon sx={{ color: '#eabb1c', mr: 2 }} />
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'gray' }}>Email</Typography>
                                    <Typography variant="body1">{currentUser.email}</Typography>
                                </Box>
                            </Box>

                            <Box className="flex items-center">
                                <BusinessIcon sx={{ color: '#eabb1c', mr: 2 }} />
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'gray' }}>Direction</Typography>
                                    <Typography variant="body1">
                                        {currentUser.directionId?.name || currentUser.directionName || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box className="flex items-center">
                                <PhoneIcon sx={{ color: '#eabb1c', mr: 2 }} />
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'gray' }}>Téléphone</Typography>
                                    <Typography variant="body1">{currentUser.phoneNumber || 'Non renseigné'}</Typography>
                                </Box>
                            </Box>

                            <Box className="flex items-center">
                                <HistoryIcon sx={{ color: '#eabb1c', mr: 2 }} />
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'gray' }}>Dernière connexion</Typography>
                                    <Typography variant="body1">
                                        {currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : 'Première connexion'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Password Change */}
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            p: 3,
                            backgroundColor: '#1a1a1a',
                            color: 'white',
                            height: '100%',
                            border: '1px solid rgba(234, 187, 28, 0.1)',
                        }}
                    >
                        <Box className="flex items-center mb-4">
                            <LockIcon sx={{ color: '#eabb1c', mr: 2 }} />
                            <Typography variant="h6" sx={{ color: '#eabb1c' }}>
                                Changer le mot de passe
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                        <form onSubmit={handleSubmitPassword} className="space-y-4">
                            <TextField
                                fullWidth
                                label="Nouveau mot de passe"
                                type={showPassword ? 'text' : 'password'}
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                variant="outlined"
                                disabled={loading}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{ color: 'gray' }}
                                            >
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }
                                }}
                                InputLabelProps={{ sx: { color: 'gray' } }}
                            />

                            <TextField
                                fullWidth
                                label="Confirmer le nouveau mot de passe"
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                variant="outlined"
                                disabled={loading}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                                sx={{ color: 'gray' }}
                                            >
                                                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }
                                }}
                                InputLabelProps={{ sx: { color: 'gray' } }}
                            />

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    mt: 2,
                                    backgroundColor: '#eabb1c',
                                    color: 'black',
                                    '&:hover': { backgroundColor: '#d1a91a' },
                                    '&.Mui-disabled': { backgroundColor: 'rgba(234, 187, 28, 0.3)' }
                                }}
                            >
                                {loading ? 'Enregistrement...' : 'Mettre à jour'}
                            </Button>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
