'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Drawer,
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    Paper,
    Avatar,
    Divider,
    IconButton,
    CircularProgress,
    Chip,
} from '@mui/material';
import {
    Close as CloseIcon,
    Send as SendIcon,
    Chat as ChatIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface Comment {
    _id: string;
    content: string;
    matricule: string;
    role: string;
    directionName?: string;
    createdAt: string;
}

interface CommentDrawerProps {
    open: boolean;
    onClose: () => void;
    targetId: string;
    targetType: 'demande' | 'document';
    targetName: string;
}

export default function CommentDrawer({
    open,
    onClose,
    targetId,
    targetType,
    targetName,
}: CommentDrawerProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const commentsEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (open && targetId) {
            fetchComments();
        }
    }, [open, targetId]);

    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    const getAuthToken = () => {
        return document.cookie
            .split('; ')
            .find((row) => row.startsWith('token='))
            ?.split('=')[1];
    };

    const fetchComments = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/comments/${targetType}/${targetId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) throw new Error('Failed to fetch comments');
            const data = await response.json();
            setComments(data);
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast.error('Erreur lors du chargement des commentaires');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setSending(true);
            const token = getAuthToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    targetId,
                    targetType,
                    content: newComment,
                }),
            });

            if (!response.ok) throw new Error('Failed to post comment');

            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error('Error posting comment:', error);
            toast.error('Erreur lors de l\'envoi du commentaire');
        } finally {
            setSending(false);
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 400 },
                    backgroundColor: '#1a1a1a',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(234, 187, 28, 0.2)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ChatIcon sx={{ color: '#eabb1c' }} />
                    <Typography variant="h6" sx={{ color: '#eabb1c', fontWeight: 'bold' }}>
                        Commentaires
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Target Info */}
            <Box sx={{ p: 2, backgroundColor: 'rgba(234, 187, 28, 0.05)' }}>
                <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block' }}>
                    {targetType === 'demande' ? 'Demande' : 'Document'}:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {targetName}
                </Typography>
            </Box>

            {/* Comments List */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress sx={{ color: '#eabb1c' }} />
                    </Box>
                ) : comments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', mt: 4, color: '#9ca3af' }}>
                        <Typography variant="body2">Aucun commentaire pour le moment.</Typography>
                    </Box>
                ) : (
                    comments.map((comment) => (
                        <Box key={comment._id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" sx={{ color: '#eabb1c', fontSize: '0.8rem' }}>
                                    {comment.matricule}
                                </Typography>
                                <Chip 
                                    label={comment.role.toUpperCase()} 
                                    size="small" 
                                    sx={{ 
                                        height: 16, 
                                        fontSize: '0.6rem', 
                                        backgroundColor: comment.role === 'doc' ? '#22c55e' : '#3b82f6',
                                        color: 'white'
                                    }} 
                                />
                                {comment.directionName && (
                                    <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.7rem' }}>
                                        ({comment.directionName})
                                    </Typography>
                                )}
                            </Box>
                            <Paper sx={{ p: 1.5, backgroundColor: '#262626', color: '#d1d5db', borderRadius: '12px 12px 12px 0' }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {comment.content}
                                </Typography>
                            </Paper>
                            <Typography variant="caption" sx={{ color: '#6b7280', alignSelf: 'flex-end', fontSize: '0.7rem' }}>
                                {new Date(comment.createdAt).toLocaleString()}
                            </Typography>
                        </Box>
                    ))
                )}
                <div ref={commentsEndRef} />
            </Box>

            {/* Footer / Input */}
            <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, borderTop: '1px solid rgba(234, 187, 28, 0.2)', backgroundColor: '#111' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Ajouter un commentaire..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                backgroundColor: '#1a1a1a',
                                '& fieldset': { borderColor: 'rgba(234, 187, 28, 0.3)' },
                                '&:hover fieldset': { borderColor: 'rgba(234, 187, 28, 0.5)' },
                                '&.Mui-focused fieldset': { borderColor: '#eabb1c' },
                            },
                        }}
                    />
                    <IconButton 
                        type="submit" 
                        disabled={!newComment.trim() || sending}
                        sx={{ 
                            color: '#eabb1c', 
                            '&.Mui-disabled': { color: 'rgba(234, 187, 28, 0.3)' },
                            alignSelf: 'flex-end'
                        }}
                    >
                        {sending ? <CircularProgress size={24} sx={{ color: '#eabb1c' }} /> : <SendIcon />}
                    </IconButton>
                </Box>
            </Box>
        </Drawer>
    );
}
