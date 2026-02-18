import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Container,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

const steps = ['Basic Information', 'Payment Details', 'Terms & Conditions'];

export const AffiliateSignup: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    website: '',
    bio: '',

    // Payment
    paymentMethod: 'paypal',
    paypalEmail: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',

    // Terms
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: any = {};

    if (step === 0) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.website) newErrors.website = 'Website is required';
    } else if (step === 1) {
      if (formData.paymentMethod === 'paypal' && !formData.paypalEmail) {
        newErrors.paypalEmail = 'PayPal email is required';
      }
      if (formData.paymentMethod === 'bank_transfer') {
        if (!formData.bankAccountName) newErrors.bankAccountName = 'Account name is required';
        if (!formData.bankAccountNumber) newErrors.bankAccountNumber = 'Account number is required';
      }
    } else if (step === 2) {
      if (!formData.agreedToTerms) {
        newErrors.agreedToTerms = 'You must agree to the terms';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    try {
      // TODO: Submit to API
      console.log('Submitting affiliate application:', formData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  if (submitted) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5' }}>
        <Container maxWidth="md">
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Application Submitted!
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Thank you for applying to our affiliate program. We'll review your application and get back to you within 2-3 business days.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              You'll receive an email at <strong>{formData.email}</strong> once your application is processed.
            </Typography>
            <Button variant="contained" href="/" sx={{ mt: 3 }}>
              Back to Home
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 6 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" gutterBottom>
            Join Our Affiliate Program
          </Typography>
          <Typography variant="h6" color="textSecondary" paragraph>
            Earn generous commissions by promoting our courses to your audience
          </Typography>
        </Box>

        {/* Benefits */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
              <MoneyIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                20% Commission
              </Typography>
              <Typography color="textSecondary">
                Earn 20% commission on every sale you refer
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
              <TrendingUpIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                30-Day Cookies
              </Typography>
              <Typography color="textSecondary">
                Get credit for purchases made within 30 days of referral
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
              <PeopleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Marketing Support
              </Typography>
              <Typography color="textSecondary">
                Access banners, emails, and promotional materials
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Application Form */}
        <Paper sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 0: Basic Information */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name (Optional)"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Website URL"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    error={!!errors.website}
                    helperText={errors.website}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Tell us about yourself and your audience"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Please describe your website, social media presence, audience demographics, and how you plan to promote our courses..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 1: Payment Details */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Payment Information
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Choose your preferred payment method. Payouts are processed on the 1st and 15th of each month (minimum $50).
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Payment Method
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant={formData.paymentMethod === 'paypal' ? 'contained' : 'outlined'}
                      onClick={() => setFormData({ ...formData, paymentMethod: 'paypal' })}
                    >
                      PayPal
                    </Button>
                    <Button
                      variant={formData.paymentMethod === 'bank_transfer' ? 'contained' : 'outlined'}
                      onClick={() => setFormData({ ...formData, paymentMethod: 'bank_transfer' })}
                    >
                      Bank Transfer
                    </Button>
                  </Box>
                </Grid>

                {formData.paymentMethod === 'paypal' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="PayPal Email"
                      type="email"
                      value={formData.paypalEmail}
                      onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
                      error={!!errors.paypalEmail}
                      helperText={errors.paypalEmail || 'We\'ll send your commissions to this PayPal account'}
                      required
                    />
                  </Grid>
                )}

                {formData.paymentMethod === 'bank_transfer' && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Account Holder Name"
                        value={formData.bankAccountName}
                        onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                        error={!!errors.bankAccountName}
                        helperText={errors.bankAccountName}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Account Number"
                        value={formData.bankAccountNumber}
                        onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                        error={!!errors.bankAccountNumber}
                        helperText={errors.bankAccountNumber}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Routing Number"
                        value={formData.bankRoutingNumber}
                        onChange={(e) => setFormData({ ...formData, bankRoutingNumber: e.target.value })}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}

          {/* Step 2: Terms & Conditions */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Terms & Conditions
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, mb: 3, maxHeight: 400, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  Affiliate Program Terms
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>1. Commission Structure:</strong> Affiliates earn 20% commission on all sales generated through their unique affiliate links.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>2. Cookie Duration:</strong> Referral cookies are valid for 30 days from the initial click.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>3. Payment Terms:</strong> Payments are processed on the 1st and 15th of each month for commissions exceeding $50.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>4. Prohibited Activities:</strong> Affiliates may not engage in spamming, false advertising, or any deceptive practices.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>5. Termination:</strong> We reserve the right to terminate affiliate accounts for violation of terms.
                </Typography>
              </Paper>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreedToTerms}
                    onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  />
                }
                label="I agree to the Affiliate Program Terms & Conditions"
              />
              {errors.agreedToTerms && (
                <Typography color="error" variant="caption" display="block">
                  {errors.agreedToTerms}
                </Typography>
              )}
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button variant="contained" onClick={handleSubmit}>
                  Submit Application
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AffiliateSignup;
