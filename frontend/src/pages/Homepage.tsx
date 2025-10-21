import React from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Container,
  Avatar,
  Chip,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  LocalHospital,
  People,
  Schedule,
  Assessment,
  Phone,
  Email,
  LocationOn,
  Star,
  ArrowForward,
  PlayArrow,
  CheckCircle,
  AccessTime,
  Security,
  VerifiedUser
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MargaLogo from '../components/MargaLogo';

// Animated Background Component
const AnimatedMedicalBackground = () => {
  return (
    <motion.div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 400' preserveAspectRatio='xMidYMid slice'%3E%3Cdefs%3E%3ClinearGradient id='gMain' x1='0' x2='1' y1='0' y2='0'%3E%3Cstop offset='0' stop-color='%239feaf3'/%3E%3Cstop offset='0.25' stop-color='%2383e1ef'/%3E%3Cstop offset='0.5' stop-color='%237bdcf0'/%3E%3Cstop offset='0.75' stop-color='%236bd6e9'/%3E%3Cstop offset='1' stop-color='%23a0f0f6'/%3E%3C/linearGradient%3E%3CradialGradient id='gGlow' cx='50%25' cy='45%25' r='60%25'%3E%3Cstop offset='0' stop-color='%23ffffff' stop-opacity='0.25'/%3E%3Cstop offset='0.4' stop-color='%23e9fdff' stop-opacity='0.14'/%3E%3Cstop offset='1' stop-color='%23ffffff' stop-opacity='0'/%3E%3C/radialGradient%3E%3Cfilter id='blurSoft' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeGaussianBlur in='SourceGraphic' stdDeviation='28' /%3E%3C/filter%3E%3CradialGradient id='vignette' cx='50%25' cy='50%25' r='70%25'%3E%3Cstop offset='0' stop-color='%23ffffff' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%23000000' stop-opacity='0.08'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect x='0' y='0' width='1600' height='400' fill='url(%23gMain)' /%3E%3Crect x='0' y='0' width='1600' height='400' fill='url(%23gGlow)' /%3E%3Cg filter='url(%23blurSoft)'%3E%3Cpath d='M-200 230 C 200 100, 400 310, 900 180 C 1200 90, 1400 260, 1800 210 L 1800 500 L -200 500 Z' fill='%23e7fbff' fill-opacity='0.32'/%3E%3Cpath d='M-200 270 C 200 180, 500 340, 900 240 C 1200 170, 1500 300, 1800 260 L 1800 500 L -200 500 Z' fill='%23daf7fb' fill-opacity='0.25'/%3E%3Cpath d='M-200 210 C 250 80, 600 260, 900 200 C 1200 140, 1500 230, 1800 200 L 1800 0 L -200 0 Z' fill='%23bff2f7' fill-opacity='0.20'/%3E%3C/g%3E%3Cg stroke='%23ffffff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round' fill='none' opacity='0.95'%3E%3Cpath d='M120 210 L180 210 L200 210 L210 190 L230 250 L260 210 L340 210 L360 210 L410 210 L430 210 L440 170 L460 250 L480 210 L620 210 L640 210 L660 210 L690 210 L710 210 L730 170 L750 250 L770 210 L880 210 L900 210 L940 210 L980 210 L1000 210 L1020 190 L1040 250 L1060 210 L1240 210 L1280 210 L1290 210' stroke-width='4' stroke-opacity='0.95'/%3E%3C/g%3E%3Cg transform='translate(1200,70)' opacity='0.14' stroke='%23ffffff' stroke-width='1' fill='none'%3E%3Cpath d='M0 30 l26 -15 l26 15 l0 30 l-26 15 l-26 -15 z' /%3E%3Cg transform='translate(46,22)'%3E%3Cpath d='M0 30 l26 -15 l26 15 l0 30 l-26 15 l-26 -15 z'/%3E%3C/g%3E%3Cg transform='translate(-46,22)'%3E%3Cpath d='M0 30 l26 -15 l26 15 l0 30 l-26 15 l-26 -15 z'/%3E%3C/g%3E%3C/g%3E%3Crect x='0' y='0' width='1600' height='400' fill='url(%23vignette)' /%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "400px 400px",
        rotate: 45,
        filter: "blur(40px)",
        opacity: 0.15
      }}
      animate={{
        backgroundPosition: ["0px 0px", "400px 400px"],
      }}
      transition={{
        repeat: Infinity,
        ease: "linear",
        duration: 30,
      }}
    />
  );
};

// Service Card Component
const ServiceCard = ({ icon, title, description, color = "primary" }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.05)} 0%, ${alpha(theme.palette[color].main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
          backdropFilter: 'blur(10px)',
          '&:hover': {
            boxShadow: `0 8px 32px ${alpha(theme.palette[color].main, 0.15)}`,
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: `0 4px 20px ${alpha(theme.palette[color].main, 0.3)}`
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Doctor Card Component
const DoctorCard = ({ name, specialty, experience, avatar }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Avatar
            src={avatar}
            sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 2,
              border: `3px solid ${theme.palette.primary.main}`,
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            {name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {name}
          </Typography>
          <Typography variant="body2" color="primary.main" gutterBottom>
            {specialty}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {experience} years experience
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ text, author, role, rating = 5 }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', mb: 2 }}>
            {[...Array(rating)].map((_, i) => (
              <Star key={i} sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
            ))}
          </Box>
          <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
            "{text}"
          </Typography>
          <Typography variant="subtitle2" fontWeight="bold">
            {author}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {role}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Homepage Component
const Homepage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [dept, setDept] = React.useState('general');

  const services = [
    {
      icon: <LocalHospital sx={{ color: 'white', fontSize: 28 }} />,
      title: "Primary Care",
      description: "Comprehensive healthcare services including routine checkups, preventive care, and chronic disease management.",
      color: "primary"
    },
    {
      icon: <People sx={{ color: 'white', fontSize: 28 }} />,
      title: "Specialist Care",
      description: "Access to top specialists in cardiology, neurology, pediatrics, and other medical specialties.",
      color: "secondary"
    },
    {
      icon: <Schedule sx={{ color: 'white', fontSize: 28 }} />,
      title: "Appointment Management",
      description: "Easy online booking, appointment scheduling, and automated reminders for better healthcare coordination.",
      color: "success"
    },
    {
      icon: <Assessment sx={{ color: 'white', fontSize: 28 }} />,
      title: "Digital Health Records",
      description: "Secure electronic health records, prescription management, and treatment history tracking.",
      color: "info"
    }
  ];

  const doctors = [
    {
      name: "Dr. Nadeesha Perera",
      specialty: "Cardiologist",
      experience: "15",
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=640&auto=format&fit=crop&crop=faces&ixlib=rb-4.0.3&sat=10&exp=5'
    },
    {
      name: "Dr. Chamath Fernando",
      specialty: "Neurologist", 
      experience: "12",
      avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=640&auto=format&fit=crop&crop=faces&ixlib=rb-4.0.3&sat=10&exp=5'
    },
    {
      name: "Dr. Ishara Weerasinghe",
      specialty: "Pediatrician",
      experience: "10",
      avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=640&auto=format&fit=crop&crop=faces&ixlib=rb-4.0.3&sat=10&exp=5'
    },
    {
      name: "Dr. Dinesh Jayakody",
      specialty: "General Surgeon",
      experience: "18",
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=640&auto=format&fit=crop&crop=faces&ixlib=rb-4.0.3&sat=10&exp=5'
    }
  ];

  const testimonials = [
    {
      text: "The CATMS system made managing my appointments so much easier. The doctors are professional and caring.",
      author: "Maria Santos",
      role: "Patient",
      rating: 5
    },
    {
      text: "Excellent digital health records system. I can access my medical history anytime, anywhere.",
      author: "John Anderson",
      role: "Patient",
      rating: 5
    },
    {
      text: "The specialist care I received was outstanding. Highly recommend this healthcare platform.",
      author: "Lisa Thompson",
      role: "Patient", 
      rating: 5
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      {/* Animated Background */}
      <AnimatedMedicalBackground />
      
      {/* Navigation */}
      <Box
        component="header"
        sx={{
          position: 'relative',
          zIndex: 10,
          py: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <MargaLogo size="medium" variant="horizontal" />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/login')}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold'
                }}
              >
                Staff Login
              </Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/register')}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                Patient Registration
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        component="main"
        sx={{
          position: 'relative',
          zIndex: 5,
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, alignItems: 'center' }}>
            <Box>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography 
                  variant="h2" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2
                  }}
                >
                  Revolutionize Healthcare with Marga.lk
                </Typography>
                <Typography 
                  variant="h5" 
                  color="text.secondary" 
                  sx={{ mb: 4, lineHeight: 1.6 }}
                >
                  Experience the Power of Digital Innovation in Clinical Management - 
                  Accelerating Medical Breakthroughs and Empowering Patients Worldwide
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      px: 4,
                      py: 1.5,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                      }
                    }}
                    endIcon={<ArrowForward />}
                  >
                    Book Appointment
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      px: 4,
                      py: 1.5,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                      }
                    }}
                    startIcon={<PlayArrow />}
                  >
                    View Demo
                  </Button>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Open Hours
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        Mon — Sat · 8am — 8pm
                      </Typography>
                    </Paper>
                  </Box>
                  <Box>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Emergency
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        Call 123-456-789
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              </motion.div>
            </Box>
            
            <Box>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card 
                  sx={{ 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 4,
                    boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.1)}`
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Quick Booking
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          Find the Right Specialist
                        </Typography>
                      </Box>
                      <Chip 
                        icon={<AccessTime />} 
                        label="15-30 min" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>

                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        placeholder="Your name"
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 2 }}
                      />
                      <TextField
                        placeholder="Phone or email"
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 2 }}
                      />
                      <FormControl size="small">
                        <InputLabel>Choose Department</InputLabel>
                        <Select
                          label="Choose Department"
                          value={dept}
                          onChange={(e) => setDept(e.target.value)}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="general">General Practice</MenuItem>
                          <MenuItem value="cardiology">Cardiology</MenuItem>
                          <MenuItem value="neurology">Neurology</MenuItem>
                          <MenuItem value="pediatrics">Pediatrics</MenuItem>
                        </Select>
                      </FormControl>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="contained" 
                          fullWidth
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                          }}
                        >
                          Find Slots
                        </Button>
                        <Button 
                          variant="outlined" 
                          sx={{ borderRadius: 2 }}
                          startIcon={<Phone />}
                        >
                          Call
                        </Button>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                      <Security sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        We respect your privacy. Your data is encrypted & secure.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ py: 8, position: 'relative', zIndex: 5 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Our Services
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Comprehensive care for every stage of life
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 4 }}>
            {services.map((service, index) => (
              <Box key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ServiceCard {...service} />
                </motion.div>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Why CATMS Section */}
      <Box 
        sx={{ 
          py: 8, 
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
          backdropFilter: 'blur(10px)'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, alignItems: 'center' }}>
            <Box>
              <Box sx={{ mb: 4 }}>
                <Chip 
                  label="Why Marga.lk" 
                  color="primary" 
                  sx={{ mb: 2, fontWeight: 'bold' }}
                />
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  The Future of Clinical Management
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  For Patients
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Card sx={{ mb: 2, background: alpha(theme.palette.error.main, 0.05) }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="body2" color="error.main">
                        Limited accessibility and patient participation in clinical trials.
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card sx={{ background: alpha(theme.palette.success.main, 0.05) }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="body2" color="success.main">
                        Marga.lk revolutionizes patient participation by bringing trials to homes, 
                        overcoming geographical limitations, enabling telemedicine consultations, 
                        remote data provision, and fostering a more inclusive and efficient 
                        environment for clinical research.
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  For Clinics
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip icon={<CheckCircle />} label="Streamlined Operations" color="primary" />
                  <Chip icon={<VerifiedUser />} label="Secure Data Management" color="success" />
                  <Chip icon={<Assessment />} label="Advanced Analytics" color="info" />
                </Box>
              </Box>
            </Box>

            <Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                {['Surgery', 'Gastroenterology', 'Pulmonology', 'Dermatology', 'Otolaryngology', 'Respiratory'].map((specialty, index) => (
                  <Box key={index}>
                    <Card 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                        }
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {specialty}
                      </Typography>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Doctors Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Meet Our Specialists
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Trusted professionals with decades of experience
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 4 }}>
            {doctors.map((doctor, index) => (
              <Box key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <DoctorCard {...doctor} />
                </motion.div>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box 
        sx={{ 
          py: 8, 
          background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              What Our Patients Say
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Real stories from real people
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 4 }}>
            {testimonials.map((testimonial, index) => (
              <Box key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <TestimonialCard {...testimonial} />
                </motion.div>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          py: 8, 
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              1 Million Happy Patients Healthier with Marga.lk
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Community of 1 Million Patients Embracing Health and Well-being
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 'bold',
                px: 6,
                py: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                }
              }}
              endIcon={<ArrowForward />}
            >
              View Demo
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        component="footer"
        sx={{ 
          py: 6, 
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
          backdropFilter: 'blur(10px)',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 4 }}>
            <Box>
              <Box sx={{ mb: 2 }}>
                <MargaLogo size="small" variant="horizontal" />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your health, our priority. A compassionate team of specialists dedicated to providing 
                the best clinical management and patient care through digital health pathways.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" color="primary">
                  <Email />
                </IconButton>
                <IconButton size="small" color="primary">
                  <Phone />
                </IconButton>
                <IconButton size="small" color="primary">
                  <LocationOn />
                </IconButton>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Contact
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                hello@catms.com
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                123 Health Street, Colombo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +94 1234 567
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Company
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="text" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  About
                </Button>
                <Button variant="text" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  Live Studies
                </Button>
                <Button variant="text" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  Contact
                </Button>
                <Button variant="text" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  FAQ
                </Button>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ mt: 4, pt: 4, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
              © {new Date().getFullYear()} Marga.lk - Digital Health Pathways. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Homepage;
