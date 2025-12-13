import React from 'react';
import { Box, Typography, Paper, Avatar, Button, Chip } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 * ApplicationItem Component
 * Renders a single application card for the task requester.
 * Includes Accept/Reject actions.
 */
const ApplicationItem = ({ application, onAccept, onReject }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'accepted':
                return 'success';
            case 'rejected':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Paper sx={{ p: 2, border: '1px solid #eee' }}>
            <Box display="flex" alignItems="start" gap={2} sx={{ mb: 2 }}>
                <Avatar
                    sx={{
                        width: 48,
                        height: 48,
                        bgcolor: '#667eea',
                        textDecoration: 'none',
                        cursor: 'pointer',
                    }}
                    component={Link}
                    to={`/profile/${application.provider_id}`}
                >
                    {application.provider_name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box flex={1}>
                    <Typography
                        component={Link}
                        to={`/profile/${application.provider_id}`}
                        sx={{
                            fontWeight: 600,
                            color: '#667eea',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                    >
                        {application.provider_name}
                    </Typography>
                    <Chip
                        label={application.status}
                        size="small"
                        color={getStatusColor(application.status)}
                        variant="outlined"
                        sx={{ mt: 0.5, ml: 1 }}
                    />
                </Box>
            </Box>

            <Box sx={{ bgcolor: '#f9f9f9', p: 1.5, borderRadius: 1, mb: 2 }}>
                <Typography variant="body2">
                    <strong>Proposed price:</strong> ${application.proposed_price}
                </Typography>
                <Typography variant="body2">
                    <strong>Selected time:</strong> {new Date(application.start_time).toLocaleDateString()}{' '}
                    {new Date(application.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
            </Box>

            {application.status === 'pending' && (
                <Box display="flex" gap={1}>
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => onAccept(application.id)}
                    >
                        Accept
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => onReject(application.id)}
                    >
                        Reject
                    </Button>
                </Box>
            )}
        </Paper>
    );
};

export default ApplicationItem;
