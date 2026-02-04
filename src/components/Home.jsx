import React from 'react';
import { Box, Card, CardContent, Typography, CardActionArea, Container } from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import SpaIcon from '@mui/icons-material/Spa';
import AgricultureIcon from '@mui/icons-material/Agriculture';

function Home({ onModuleSelect }) {
  const modules = [
    //{
    //  id: 'tables',
    //  title: 'Gestión de Tablas',
    //  description: 'Administra y edita datos de las tablas del sistema',
    //  icon: TableChartIcon,
    //  color: '#2196F3'
   // },
    {
      id: 'fenologia',
      title: 'Fenología',
      description: 'Registro y seguimiento de evaluaciones fenológicas',
      icon: SpaIcon,
      color: '#4CAF50'
    },
    {
      id: 'conteo-frutos',
      title: 'Conteo de Frutos',
      description: 'Control y análisis del conteo de frutos de pimiento',
      icon: AgricultureIcon,
      color: '#FF9800'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 80px)',
        backgroundImage: 'url(https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }
      }}
    >
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 2,
          pt: 8,
          pb: 8
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              color: 'white', 
              fontWeight: 700,
              mb: 2,
              textShadow: '0px 4px 12px rgba(0,0,0,0.5)'
            }}
          >
            Sistema de Proyecciones
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 400,
              textShadow: '0px 2px 8px rgba(0,0,0,0.5)'
            }}
          >
            Selecciona un módulo para comenzar
          </Typography>
        </Box>

        {/* Cards */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.id}
                elevation={8}
                sx={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: '0px 16px 40px rgba(0,0,0,0.3)',
                    background: 'rgba(255, 255, 255, 1)'
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => onModuleSelect(module.id)}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'flex-start',
                    p: 0
                  }}
                >
                  {/* Icon Header */}
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${module.color} 0%, ${module.color}CC 100%)`,
                      p: 4,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Icon 
                      sx={{ 
                        fontSize: 80, 
                        color: 'white',
                        filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))'
                      }} 
                    />
                  </Box>

                  {/* Content */}
                  <CardContent sx={{ p: 3, flexGrow: 1 }}>
                    <Typography 
                      variant="h5" 
                      component="div" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 2,
                        color: '#212121'
                      }}
                    >
                      {module.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#616161',
                        lineHeight: 1.6
                      }}
                    >
                      {module.description}
                    </Typography>
                  </CardContent>

                  {/* Footer */}
                  <Box
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      borderTop: '1px solid #E0E0E0',
                      bgcolor: 'rgba(0,0,0,0.02)'
                    }}
                  >
                    <Typography 
                      variant="button" 
                      sx={{ 
                        color: module.color,
                        fontWeight: 600
                      }}
                    >
                      Acceder →
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>

        {/* Footer Info */}
        <Box sx={{ textAlign: 'center', mt: 14 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              textShadow: '0px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            © Sistema de Proyecciones Agrícolas Pimiento
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;
