import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Avatar,
  Badge,
  ImageList,
  ImageListItem,
  Fab
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Psychology as PsychologyIcon,
  LocalHospital as LocalHospitalIcon,
  Medication as MedicationIcon,
  Assessment as AssessmentIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AutoFixHigh as AutoFixHighIcon,
  Biotech as BiotechIcon,
  Science as ScienceIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import api from '../services/api';

interface AIModel {
  id: string;
  name: string;
  description: string;
  type: 'llm' | 'vision' | 'multimodal';
  capabilities: string[];
  status: 'active' | 'loading' | 'error';
  supportsImages: boolean;
}

interface TreatmentRecommendation {
  id: string;
  treatment: string;
  confidence: number;
  reasoning: string;
  alternatives: string[];
  contraindications: string[];
  dosage?: string;
  duration?: string;
}

interface DiagnosticSuggestion {
  id: string;
  condition: string;
  probability: number;
  symptoms: string[];
  tests: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface PatientContext {
  patientId: number;
  patientName: string;
  age: number;
  gender: string;
  medicalHistory: string[];
  currentSymptoms: string[];
  vitalSigns: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
  };
  medications: string[];
  allergies: string[];
}

interface ChatMessage {
  id: string;
  timestamp: string;
  type: 'user' | 'ai';
  content: string;
  model?: string;
  images?: string[];
  treatmentRecommendations?: TreatmentRecommendation[];
  diagnosticSuggestions?: DiagnosticSuggestion[];
}

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  type: 'xray' | 'wound' | 'general';
  description?: string;
}

const AIMedicalAssistant: React.FC = () => {
  const theme = useTheme();
  const [selectedModel, setSelectedModel] = useState<string>('biomistral-7b');
  const [query, setQuery] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [patientContext, setPatientContext] = useState<PatientContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [treatmentRecommendations, setTreatmentRecommendations] = useState<TreatmentRecommendation[]>([]);
  const [diagnosticSuggestions, setDiagnosticSuggestions] = useState<DiagnosticSuggestion[]>([]);
  const [showPatientContext, setShowPatientContext] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [aiModels] = useState<AIModel[]>([
    {
      id: 'biomistral-7b',
      name: 'BioMistral-7B',
      description: 'Advanced medical language model for treatment recommendations and clinical decision support',
      type: 'llm',
      capabilities: ['Treatment Recommendations', 'Drug Interactions', 'Clinical Guidelines', 'Medical Literature'],
      status: 'active',
      supportsImages: false
    },
    {
      id: 'clinicalbert',
      name: 'ClinicalBERT',
      description: 'Specialized BERT model trained on clinical notes and medical texts',
      type: 'llm',
      capabilities: ['Clinical Text Analysis', 'Medical Question Answering', 'EHR Analysis'],
      status: 'active',
      supportsImages: false
    },
    {
      id: 'biogpt',
      name: 'BioGPT',
      description: 'Generative AI for biomedical text generation and treatment suggestions - SUPPORTS IMAGE UPLOAD',
      type: 'llm',
      capabilities: ['Biomedical Text Generation', 'Treatment Planning', 'Medical Reports', 'Image Analysis', 'Medical Documentation'],
      status: 'active',
      supportsImages: true
    },
    {
      id: 'llava-med',
      name: 'LLaVA-Med',
      description: 'Multimodal model for medical image and text analysis - SUPPORTS IMAGE UPLOAD',
      type: 'multimodal',
      capabilities: ['Medical Image Analysis', 'Radiology Reports', 'Pathology Analysis', 'X-Ray Analysis', 'Wound Assessment'],
      status: 'active',
      supportsImages: true
    },
    {
      id: 'med-imaging-pro',
      name: 'Med-Imaging-Pro',
      description: 'Specialized AI for accurate X-ray and medical imaging analysis - ENHANCED FRACTURE DETECTION',
      type: 'vision',
      capabilities: ['X-Ray Analysis', 'Fracture Detection', 'Bone Pathology', 'Radiological Assessment', 'Orthopedic Imaging'],
      status: 'active',
      supportsImages: true
    }
  ]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: UploadedImage = {
            id: Date.now().toString(),
            file,
            preview: e.target?.result as string,
            type: 'general',
            description: ''
          };
          setUploadedImages(prev => [...prev, newImage]);
          setUploadSuccess(`✅ Successfully uploaded ${file.name}`);
          setTimeout(() => setUploadSuccess(null), 3000);
          // Close the modal after successful upload
          setShowImageUpload(false);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImage: UploadedImage = {
            id: Date.now().toString(),
            file,
            preview: event.target?.result as string,
            type: 'general',
            description: ''
          };
          setUploadedImages(prev => [...prev, newImage]);
          setUploadSuccess(`✅ Successfully uploaded ${file.name}`);
          setTimeout(() => setUploadSuccess(null), 3000);
          // Close the modal after successful upload
          setShowImageUpload(false);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const updateImageType = (imageId: string, type: 'xray' | 'wound' | 'general') => {
    setUploadedImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, type } : img
    ));
  };

  const saveChatMessage = async (message: ChatMessage) => {
    try {
      await api.post('/api/ai-medical/save-query', {
        message,
        doctorId: 1 // This should come from auth context
      });
    } catch (err) {
      console.error('Failed to save chat message:', err);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await api.get('/api/ai-medical/chat-history');
      setChatHistory(response.data);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleQuerySubmit = async () => {
    // Allow submission if there are images even without text query
    if (!query.trim() && uploadedImages.length === 0) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    // Add user message to chat history
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'user',
      content: query.trim() || (uploadedImages.length > 0 ? 'Image analysis request' : ''),
      images: uploadedImages.map(img => img.preview)
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    await saveChatMessage(userMessage);

    try {
      const finalQuery = useCustomPrompt && customPrompt.trim() 
        ? customPrompt.trim() 
        : query.trim() || (uploadedImages.length > 0 ? 'Analyze the uploaded medical images and provide detailed findings and treatment recommendations' : '');
      
      const requestData = {
        model: selectedModel,
        query: finalQuery,
        patientContext: patientContext,
        images: uploadedImages.map(img => ({
          data: img.preview,
          type: img.type,
          description: img.description
        })),
        timestamp: new Date().toISOString()
      };

      const response = await api.post('/api/ai-medical/query', requestData);
      
      setResponse(response.data);
      
      // Extract structured recommendations if available
      if (response.data.treatmentRecommendations) {
        setTreatmentRecommendations(response.data.treatmentRecommendations);
      }
      
      if (response.data.diagnosticSuggestions) {
        setDiagnosticSuggestions(response.data.diagnosticSuggestions);
      }

      // Add AI response to chat history
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        timestamp: new Date().toISOString(),
        type: 'ai',
        content: response.data.text,
        model: selectedModel,
        treatmentRecommendations: response.data.treatmentRecommendations,
        diagnosticSuggestions: response.data.diagnosticSuggestions
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
      await saveChatMessage(aiMessage);

      // Clear query and images after successful submission
      setQuery('');
      setUploadedImages([]);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process AI query');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    setResponse(null);
    setError(null);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return <ErrorIcon color="error" />;
      case 'high': return <WarningIcon color="warning" />;
      case 'medium': return <InfoIcon color="info" />;
      case 'low': return <CheckCircleIcon color="success" />;
      default: return <InfoIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon color="primary" />
            AI Medical Assistant
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Get AI-powered medical insights, treatment recommendations, and diagnostic assistance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Chat History">
            <IconButton onClick={() => setShowChatHistory(true)} color="primary">
              <Badge badgeContent={chatHistory.length} color="secondary">
                <HistoryIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Upload Medical Images">
            <IconButton onClick={() => setShowImageUpload(true)} color="primary">
              <CloudUploadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* AI Model Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select AI Model
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            {aiModels.map((model) => (
              <Paper
                key={model.id}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: selectedModel === model.id ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
                  backgroundColor: selectedModel === model.id ? theme.palette.primary.light + '20' : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  },
                  position: 'relative'
                }}
                onClick={() => handleModelChange(model.id)}
              >
                {model.supportsImages && (
                  <Chip
                    label="📷 IMAGE SUPPORT"
                    size="small"
                    color="success"
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8,
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}
                  />
                )}
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                  {model.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {model.description}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {model.capabilities.slice(0, 2).map((capability) => (
                    <Chip
                      key={capability}
                      label={capability}
                      size="small"
                      variant="outlined"
                      color={model.supportsImages ? "success" : "primary"}
                    />
                  ))}
                  {model.capabilities.length > 2 && (
                    <Chip
                      label={`+${model.capabilities.length - 2} more`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
                {model.supportsImages && (
                  <Box sx={{ mt: 1, p: 1, backgroundColor: theme.palette.success.light + '20', borderRadius: 1 }}>
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                      🎯 Upload X-rays, wound photos, and medical images for AI analysis
                    </Typography>
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Image Upload Prompt for Image-Supporting Models */}
      {selectedModel && aiModels.find(m => m.id === selectedModel)?.supportsImages && uploadedImages.length === 0 && (
        <Card sx={{ mb: 3, border: `2px dashed ${theme.palette.success.main}`, backgroundColor: theme.palette.success.light + '10' }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <ImageIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="success.main" gutterBottom>
              📷 Upload Medical Images for AI Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The selected model supports image analysis. Upload X-rays, wound photos, or other medical images to get enhanced AI insights.
            </Typography>
            <Button
              variant="contained"
              color="success"
              onClick={() => setShowImageUpload(true)}
              startIcon={<CloudUploadIcon />}
              size="large"
            >
              Upload Medical Images
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <Card sx={{ mb: 3, border: `2px solid ${theme.palette.success.main}` }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ImageIcon color="success" />
              📷 Uploaded Medical Images ({uploadedImages.length})
              <Chip label="Ready for AI Analysis" color="success" size="small" />
            </Typography>
            <ImageList sx={{ width: '100%', height: 200 }} cols={4} rowHeight={150}>
              {uploadedImages.map((image) => (
                <ImageListItem key={image.id}>
                  <img
                    src={image.preview}
                    alt={`Uploaded ${image.type}`}
                    loading="lazy"
                    style={{ borderRadius: 8 }}
                  />
                  <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Remove">
                      <IconButton
                        size="small"
                        onClick={() => removeImage(image.id)}
                        sx={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ position: 'absolute', bottom: 8, left: 8, right: 8 }}>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={image.type}
                        onChange={(e) => updateImageType(image.id, e.target.value as 'xray' | 'wound' | 'general')}
                        sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                      >
                        <MenuItem value="general">General</MenuItem>
                        <MenuItem value="xray">X-Ray</MenuItem>
                        <MenuItem value="wound">Wound</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </ImageListItem>
              ))}
            </ImageList>
          </CardContent>
        </Card>
      )}

      {/* Patient Context */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Patient Context
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setShowPatientContext(true)}
              startIcon={<LocalHospitalIcon />}
            >
              {patientContext ? 'Update Context' : 'Add Patient Context'}
            </Button>
          </Box>
          
          {patientContext ? (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {patientContext.patientName} ({patientContext.age} years, {patientContext.gender})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Medical History: {patientContext.medicalHistory.join(', ')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Symptoms: {patientContext.currentSymptoms.join(', ')}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No patient context provided. Add patient information for more accurate AI recommendations.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Query Input */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Medical Query
            </Typography>
            {uploadedImages.length > 0 && (
              <Chip 
                label={`${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''} ready - click "Analyze Images" to proceed`} 
                color="success" 
                icon={<ImageIcon />}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            {/* Custom Prompt Option */}
            {uploadedImages.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useCustomPrompt}
                      onChange={(e) => setUseCustomPrompt(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Use custom prompt for image analysis"
                />
                {useCustomPrompt && (
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Enter a specific prompt for analyzing the uploaded images (e.g., 'Analyze this X-ray for fractures and provide treatment recommendations')"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    disabled={isLoading}
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            )}

            {/* Success Message */}
            {uploadSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {uploadSuccess}
              </Alert>
            )}

            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder={
                uploadedImages.length > 0 
                  ? (useCustomPrompt ? "Or enter additional context for your medical question..." : "Describe your medical question or symptoms. The uploaded images will be analyzed along with your query... (Optional - you can analyze images without text)")
                  : "Enter your medical question, describe symptoms, or request treatment recommendations..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
            <Button
              variant="contained"
              color={uploadedImages.length > 0 ? "success" : "primary"}
              onClick={handleQuerySubmit}
              disabled={isLoading || (!query.trim() && uploadedImages.length === 0)}
              startIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{ minWidth: 120 }}
            >
              {isLoading ? 'Processing...' : uploadedImages.length > 0 ? (useCustomPrompt ? 'Analyze with Custom Prompt' : 'Analyze Images') : 'Ask AI'}
            </Button>
          </Box>
          {uploadedImages.length > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Image Analysis Ready:</strong> Your uploaded images will be analyzed by the AI model to provide enhanced medical insights and recommendations. You can analyze them immediately or add additional context/questions.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* AI Response */}
      {response && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoFixHighIcon color="primary" />
              AI Response
            </Typography>
            
            {response.text && (
              <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {response.text}
              </Typography>
            )}

            {/* Treatment Recommendations */}
            {treatmentRecommendations.length > 0 && (
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MedicationIcon color="primary" />
                    Treatment Recommendations
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {treatmentRecommendations.map((rec) => (
                    <Box key={rec.id} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {rec.treatment}
                        </Typography>
                        <Chip
                          label={`${Math.round(rec.confidence * 100)}% confidence`}
                          color={rec.confidence > 0.8 ? 'success' : rec.confidence > 0.6 ? 'warning' : 'error'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {rec.reasoning}
                      </Typography>
                      {rec.dosage && (
                        <Typography variant="body2">
                          <strong>Dosage:</strong> {rec.dosage}
                        </Typography>
                      )}
                      {rec.duration && (
                        <Typography variant="body2">
                          <strong>Duration:</strong> {rec.duration}
                        </Typography>
                      )}
                      {rec.alternatives.length > 0 && (
                        <Typography variant="body2">
                          <strong>Alternatives:</strong> {rec.alternatives.join(', ')}
                        </Typography>
                      )}
                      {rec.contraindications.length > 0 && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          <strong>Contraindications:</strong> {rec.contraindications.join(', ')}
                        </Alert>
                      )}
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            )}

            {/* Diagnostic Suggestions */}
            {diagnosticSuggestions.length > 0 && (
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon color="primary" />
                    Diagnostic Suggestions
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {diagnosticSuggestions.map((suggestion) => (
                    <Box key={suggestion.id} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {suggestion.condition}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={`${Math.round(suggestion.probability * 100)}% probability`}
                            color={suggestion.probability > 0.7 ? 'error' : suggestion.probability > 0.5 ? 'warning' : 'info'}
                            size="small"
                          />
                          <Chip
                            label={suggestion.urgency}
                            color={getUrgencyColor(suggestion.urgency) as any}
                            size="small"
                            icon={getUrgencyIcon(suggestion.urgency)}
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Symptoms:</strong> {suggestion.symptoms.join(', ')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Recommended Tests:</strong> {suggestion.tests.join(', ')}
                      </Typography>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}

      {/* Patient Context Dialog */}
      <Dialog open={showPatientContext} onClose={() => setShowPatientContext(false)} maxWidth="md" fullWidth>
        <DialogTitle>Patient Context</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide patient information for more accurate AI recommendations
          </Typography>
          {/* Patient context form would go here */}
          <Typography variant="body2" color="text.secondary">
            Patient context form implementation would be added here...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPatientContext(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setShowPatientContext(false)}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={showImageUpload} onClose={() => setShowImageUpload(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Medical Images</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload X-ray images, wound photos, or other medical images for AI analysis
          </Typography>
          <Box 
            sx={{ 
              border: '2px dashed', 
              borderColor: isDragOver ? 'success.main' : 'primary.main', 
              backgroundColor: isDragOver ? 'success.light' : 'transparent',
              borderRadius: 2, 
              p: 3, 
              textAlign: 'center',
              transition: 'all 0.2s ease-in-out'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: isDragOver ? 'success.main' : 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drop images here or click to browse
            </Typography>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
                Select Images
              </Button>
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImageUpload(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Chat History Dialog */}
      <Dialog open={showChatHistory} onClose={() => setShowChatHistory(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon color="primary" />
          AI Chat History
        </DialogTitle>
        <DialogContent>
          {chatHistory.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No chat history available. Start a conversation with the AI to see your history here.
            </Typography>
          ) : (
            <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
              {chatHistory.map((message) => (
                <Box key={message.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main' }}>
                      {message.type === 'user' ? 'U' : 'AI'}
                    </Avatar>
                    <Typography variant="subtitle2">
                      {message.type === 'user' ? 'You' : `AI (${message.model})`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(message.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                  <Paper sx={{ p: 2, ml: 4, backgroundColor: message.type === 'user' ? 'primary.light' : 'grey.100' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                    {message.images && message.images.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Images: {message.images.length}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowChatHistory(false)}>Close</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export History
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIMedicalAssistant;
