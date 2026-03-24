import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Navbar from "./Navbar";

export default function HeroBanner() {
  return (
    <Box
      component="section"
      sx={{ background: 'linear-gradient(135deg, #3D52D5 0%, #4A9FD4 55%, #43D8B0 100%)' }}
    >
      <Navbar />

      <Container
        maxWidth="xl"
        sx={{ pb: { xs: 8, sm: 12 }, pt: 3, px: { xs: 3, sm: 4 } }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
          }}
        >
          {/* Left: copy */}
          <Box sx={{ maxWidth: 560 }}>
            <Typography
              variant="h1"
              sx={{
                color: 'white',
                fontSize: { xs: '2.5rem', md: '3.25rem', lg: '3.75rem' },
                mb: 3,
              }}
            >
              Encuentra los mejores lugares{' '}
              <Box component="span" sx={{ color: '#43D696' }}>
                petfriendly cerca de ti
              </Box>
            </Typography>

            <Typography
              sx={{
                color: 'rgba(255,255,255,0.75)',
                mb: 4,
                maxWidth: 380,
                lineHeight: 1.75,
                fontSize: '0.9375rem',
              }}
            >
              Tiendas, veterinarias, cafes, restaurantes y profesionales que aman
              a las mascotas tanto como tu. Acumula puntos, canjea cupones y dale
              lo mejor a tu peludo.
            </Typography>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                component="a"
                href="#tiendas"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: '#1a1b3c',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
                }}
              >
                Explorar Tiendas
              </Button>
              <Button
                component="a"
                href="#planes"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(255,255,255,0.7)',
                  color: 'white',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Ver Planes
              </Button>
            </Stack>
          </Box>

          {/* Right: glass card */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              flexShrink: 0,
              width: 260,
              height: 260,
              borderRadius: '2rem',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
          >
            <Box sx={{ position: 'relative', width: 112, height: 112 }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.35)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%) rotate(12deg)',
                  width: 80,
                  height: 80,
                  borderRadius: '40%',
                  bgcolor: 'rgba(255,255,255,0.25)',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
