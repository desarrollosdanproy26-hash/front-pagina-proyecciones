import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AgricultureIcon from '@mui/icons-material/Agriculture';

function Navbar({ user, onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'linear-gradient(90deg, #E31837 0%, #B71C1C 100%)',
        boxShadow: '0px 4px 12px rgba(227, 24, 55, 0.3)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        {/* Logo y Título */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2,
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0px 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <AgricultureIcon sx={{ fontSize: 32, color: '#E31837' }} />
          </Box>
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                color: 'white',
                letterSpacing: '0.5px',
                textShadow: '0px 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              DANPER
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 500,
                letterSpacing: '1px'
              }}
            >
              Sistema de Proyecciones
            </Typography>
          </Box>
        </Box>

        {/* Usuario */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Información del usuario */}
          <Box 
            sx={{ 
              display: { xs: 'none', sm: 'flex' }, 
              flexDirection: 'column', 
              alignItems: 'flex-end',
              mr: 1
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 600, 
                color: 'white',
                lineHeight: 1.2
              }}
            >
              {user.nombre}
            </Typography>
            <Chip
              label={user.rol}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 20,
                mt: 0.5,
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            />
          </Box>

          {/* Botón de usuario */}
          <IconButton
            size="large"
            onClick={handleMenu}
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.25)'
              },
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: 'white',
                color: '#E31837',
                width: 40,
                height: 40,
                fontWeight: 700
              }}
            >
              {user.nombre?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          {/* Menú desplegable */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 220,
                borderRadius: 2,
                overflow: 'visible',
                boxShadow: '0px 8px 24px rgba(0,0,0,0.15)',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                }
              }
            }}
          >
            {/* Información del usuario en el menú */}
            <Box sx={{ px: 2, py: 1.5, bgcolor: '#FAFAFA' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#212121' }}>
                {user.nombre}
              </Typography>
              <Typography variant="body2" sx={{ color: '#616161', fontSize: '0.875rem' }}>
                {user.username}
              </Typography>
              <Chip
                label={user.rol}
                size="small"
                color="primary"
                sx={{ mt: 1, fontWeight: 600 }}
              />
            </Box>

            <Divider />

            {/* Opción de perfil */}
            <MenuItem 
              onClick={handleClose}
              sx={{
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(227, 24, 55, 0.08)'
                }
              }}
            >
              <ListItemIcon>
                <PersonIcon sx={{ color: '#E31837' }} />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Mi Perfil
                </Typography>
              </ListItemText>
            </MenuItem>

            <Divider />

            {/* Opción de cerrar sesión */}
            <MenuItem 
              onClick={handleLogout}
              sx={{
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(227, 24, 55, 0.08)'
                }
              }}
            >
              <ListItemIcon>
                <LogoutIcon sx={{ color: '#E31837' }} />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Cerrar Sesión
                </Typography>
              </ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
