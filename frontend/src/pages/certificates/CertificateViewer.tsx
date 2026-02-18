import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Download,
  Share,
  Verified,
  QrCode,
  LinkedIn,
  Twitter,
  Facebook,
  Link as LinkIcon,
  CheckCircle,
  Error
} from '@mui/icons-material';
import axios from 'axios';

interface Certificate {
  _id: string;
  certificateId: string;
  certificateType: string;
  title: string;
  description: string;
  recipientName: string;
  recipientEmail: string;
  issueDate: string;
  expiryDate?: string;
  status: string;
  verification: {
    verificationUrl: string;
    qrCode: string;
  };
  metadata: {
    courseName?: string;
    instructorName?: string;
    instructorTitle?: string;
    score?: number;
    grade?: number;
    creditsEarned?: number;
    skillsAcquired?: string[];
    duration?: string;
  };
  blockchain?: {
    enabled: boolean;
    transactionHash?: string;
    network?: string;
  };
  openBadge?: {
    enabled: boolean;
    badgeUrl?: string;
  };
  pdf?: {
    url: string;
  };
  share: {
    public: boolean;
    linkedIn: boolean;
    twitter: boolean;
    facebook: boolean;
  };
}

const CertificateViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCertificate();
    }
  }, [id]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/certificates/${id}`);
      setCertificate(response.data.certificate);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load certificate');
      console.error('Error loading certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyCertificate = async () => {
    if (!certificate) return;

    try {
      setVerifying(true);
      const response = await axios.get(
        `/api/certificates/verify/${certificate.certificateId}`
      );
      setVerified(response.data.valid);
    } catch (error: any) {
      setVerified(false);
      console.error('Error verifying certificate:', error);
    } finally {
      setVerifying(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certificate) return;

    try {
      const response = await axios.get(`/api/certificates/${id}/download`);
      window.open(response.data.downloadUrl, '_blank');
    } catch (error: any) {
      console.error('Error downloading certificate:', error);
    }
  };

  const updateShareSettings = async (platform: string, enabled: boolean) => {
    if (!certificate) return;

    try {
      await axios.post(`/api/certificates/${id}/share`, {
        [platform]: enabled
      });
      setCertificate({
        ...certificate,
        share: {
          ...certificate.share,
          [platform]: enabled
        }
      });
    } catch (error: any) {
      console.error('Error updating share settings:', error);
    }
  };

  const shareOnLinkedIn = () => {
    if (!certificate) return;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      certificate.verification.verificationUrl
    )}`;
    window.open(url, '_blank');
  };

  const shareOnTwitter = () => {
    if (!certificate) return;
    const text = `I earned a certificate: ${certificate.title}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
      certificate.verification.verificationUrl
    )}`;
    window.open(url, '_blank');
  };

  const shareOnFacebook = () => {
    if (!certificate) return;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      certificate.verification.verificationUrl
    )}`;
    window.open(url, '_blank');
  };

  const copyLink = () => {
    if (!certificate) return;
    navigator.clipboard.writeText(certificate.verification.verificationUrl);
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'info' => {
    switch (status) {
      case 'issued':
        return 'success';
      case 'revoked':
        return 'error';
      case 'expired':
        return 'warning';
      default:
        return 'info';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !certificate) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8 }}>
          <Alert severity="error">
            {error || 'Certificate not found'}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/certificates')}
            sx={{ mt: 2 }}
          >
            Back to Certificates
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Certificate Details
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<Share />}
              onClick={() => setShareDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Share
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={downloadCertificate}
            >
              Download PDF
            </Button>
          </Box>
        </Box>

        {/* Status Alert */}
        {certificate.status !== 'issued' && (
          <Alert
            severity={certificate.status === 'revoked' ? 'error' : 'warning'}
            sx={{ mb: 3 }}
          >
            This certificate has been {certificate.status}.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Certificate Preview */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
              {/* Certificate Design */}
              <Box
                sx={{
                  border: '4px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  p: 4,
                  bgcolor: 'white',
                  minHeight: 400
                }}
              >
                <Typography variant="h3" sx={{ mb: 2, color: 'primary.main' }}>
                  {certificate.title}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h5" sx={{ my: 3 }}>
                  {certificate.recipientName}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {certificate.description}
                </Typography>
                {certificate.metadata.courseName && (
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {certificate.metadata.courseName}
                  </Typography>
                )}
                {certificate.metadata.score !== undefined && (
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Score: {certificate.metadata.score}%
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
                  Issued on: {new Date(certificate.issueDate).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Certificate ID: {certificate.certificateId}
                </Typography>
              </Box>
            </Paper>

            {/* Verification Section */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Verified sx={{ mr: 1, verticalAlign: 'middle' }} />
                Verification
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                <Box>
                  {verified === null ? (
                    <Typography variant="body2">
                      Click verify to check certificate authenticity
                    </Typography>
                  ) : verified ? (
                    <Alert severity="success" icon={<CheckCircle />}>
                      Certificate is valid and authentic
                    </Alert>
                  ) : (
                    <Alert severity="error" icon={<Error />}>
                      Certificate verification failed
                    </Alert>
                  )}
                </Box>
                <Button
                  variant="contained"
                  onClick={verifyCertificate}
                  disabled={verifying}
                  startIcon={verifying ? <CircularProgress size={20} /> : <Verified />}
                >
                  Verify
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Details Sidebar */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Certificate Info
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={certificate.status.toUpperCase()}
                    color={getStatusColor(certificate.status)}
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Type
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {certificate.certificateType.replace(/_/g, ' ').toUpperCase()}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                    Issue Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(certificate.issueDate).toLocaleDateString()}
                  </Typography>

                  {certificate.expiryDate && (
                    <>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                        Expiry Date
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {new Date(certificate.expiryDate).toLocaleDateString()}
                      </Typography>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* QR Code */}
            {certificate.verification.qrCode && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <QrCode sx={{ mr: 1, verticalAlign: 'middle' }} />
                    QR Code
                  </Typography>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <img
                      src={certificate.verification.qrCode}
                      alt="QR Code"
                      style={{ width: '100%', maxWidth: 200 }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Scan to verify
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Blockchain Info */}
            {certificate.blockchain?.enabled && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Blockchain Verified
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Network: {certificate.blockchain.network}
                  </Typography>
                  {certificate.blockchain.transactionHash && (
                    <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                      TX: {certificate.blockchain.transactionHash}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Open Badge */}
            {certificate.openBadge?.enabled && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Open Badge
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    href={certificate.openBadge.badgeUrl}
                    target="_blank"
                  >
                    View Badge
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {certificate.metadata.skillsAcquired && certificate.metadata.skillsAcquired.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Skills Acquired
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {certificate.metadata.skillsAcquired.map((skill, index) => (
                      <Chip key={index} label={skill} size="small" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Share Certificate</DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2 }}>
              <Typography variant="body2" gutterBottom>
                Share on social media:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 3 }}>
                <Tooltip title="Share on LinkedIn">
                  <IconButton color="primary" onClick={shareOnLinkedIn}>
                    <LinkedIn fontSize="large" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share on Twitter">
                  <IconButton color="primary" onClick={shareOnTwitter}>
                    <Twitter fontSize="large" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share on Facebook">
                  <IconButton color="primary" onClick={shareOnFacebook}>
                    <Facebook fontSize="large" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" gutterBottom>
                Verification URL:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    p: 1,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    wordBreak: 'break-all'
                  }}
                >
                  {certificate.verification.verificationUrl}
                </Typography>
                <Tooltip title="Copy link">
                  <IconButton onClick={copyLink}>
                    <LinkIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default CertificateViewer;
