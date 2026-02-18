import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import axios from 'axios';

const ComplianceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);
  const [processingRecords, setProcessingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    eventType: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadLogs();
    loadProcessingRecords();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/compliance/logs', {
        params: filters
      });
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProcessingRecords = async () => {
    try {
      const response = await axios.get('/api/compliance/processing-records');
      setProcessingRecords(response.data.records);
    } catch (error) {
      console.error('Error loading processing records:', error);
    }
  };

  const createProcessingRecord = async (data: any) => {
    try {
      await axios.post('/api/compliance/processing-records', data);
      loadProcessingRecords();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating processing record:', error);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Compliance Management
        </Typography>

        <Paper sx={{ mt: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
          >
            <Tab label="Audit Logs" />
            <Tab label="Processing Records" />
            <Tab label="Settings" />
          </Tabs>

          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="gdpr">GDPR</MenuItem>
                    <MenuItem value="ccpa">CCPA</MenuItem>
                    <MenuItem value="coppa">COPPA</MenuItem>
                    <MenuItem value="ferpa">FERPA</MenuItem>
                    <MenuItem value="soc2">SOC2</MenuItem>
                    <MenuItem value="iso27001">ISO 27001</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  type="date"
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  size="small"
                  type="date"
                  label="End Date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />

                <Button variant="contained" startIcon={<Refresh />} onClick={loadLogs}>
                  Refresh
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Event Type</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Risk Level</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip label={log.category} size="small" />
                        </TableCell>
                        <TableCell>{log.eventType}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.userId?.name || 'System'}</TableCell>
                        <TableCell>
                          <Chip
                            label={log.metadata.risk_level}
                            color={
                              log.metadata.risk_level === 'critical'
                                ? 'error'
                                : log.metadata.risk_level === 'high'
                                ? 'warning'
                                : 'info'
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setDialogOpen(true)}
                sx={{ mb: 3 }}
              >
                Add Processing Record
              </Button>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Activity</TableCell>
                      <TableCell>Legal Basis</TableCell>
                      <TableCell>Data Types</TableCell>
                      <TableCell>Retention Period</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {processingRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.activity}</TableCell>
                        <TableCell>{record.legalBasis}</TableCell>
                        <TableCell>{record.dataTypes.join(', ')}</TableCell>
                        <TableCell>{record.retentionPeriod}</TableCell>
                        <TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Add Data Processing Record</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              Create new data processing record (GDPR Art. 30)
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained">Create</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ComplianceManagement;
