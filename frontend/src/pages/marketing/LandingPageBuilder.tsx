import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Preview as PreviewIcon,
  Publish as PublishIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import 'grapesjs/dist/css/grapes.min.css';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const LandingPageBuilder: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [pageData, setPageData] = useState({
    title: '',
    slug: '',
    type: 'custom',
    description: '',
    status: 'draft',
  });
  const [seoData, setSeoData] = useState({
    title: '',
    description: '',
    keywords: [] as string[],
    ogImage: '',
  });
  const [isPublished, setIsPublished] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [enableABTesting, setEnableABTesting] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const [showVariantDialog, setShowVariantDialog] = useState(false);

  const editorRef = useRef<any>(null);
  const grapesjsRef = useRef<any>(null);

  useEffect(() => {
    // Initialize GrapesJS
    initializeEditor();

    return () => {
      if (grapesjsRef.current) {
        grapesjsRef.current.destroy();
      }
    };
  }, []);

  const initializeEditor = async () => {
    // Dynamically import GrapesJS to avoid SSR issues
    const grapesjs = await import('grapesjs');
    const gjsPresetWebpage = await import('grapesjs-preset-webpage');

    if (!editorRef.current) return;

    const editor = grapesjs.default.init({
      container: editorRef.current,
      height: '100vh',
      width: 'auto',
      storageManager: false,
      plugins: [gjsPresetWebpage.default],
      pluginsOpts: {
        'grapesjs-preset-webpage': {},
      },
      canvas: {
        styles: [],
        scripts: [],
      },
      deviceManager: {
        devices: [
          { name: 'Desktop', width: '' },
          { name: 'Tablet', width: '768px', widthMedia: '992px' },
          { name: 'Mobile', width: '320px', widthMedia: '480px' },
        ],
      },
      blockManager: {
        appendTo: '#blocks',
      },
      styleManager: {
        appendTo: '#styles',
        sectors: [
          {
            name: 'General',
            properties: [
              'display',
              'position',
              'top',
              'right',
              'left',
              'bottom',
            ],
          },
          {
            name: 'Dimension',
            properties: [
              'width',
              'height',
              'max-width',
              'min-height',
              'margin',
              'padding',
            ],
          },
          {
            name: 'Typography',
            properties: [
              'font-family',
              'font-size',
              'font-weight',
              'letter-spacing',
              'color',
              'line-height',
              'text-align',
            ],
          },
          {
            name: 'Decorations',
            properties: [
              'background-color',
              'border-radius',
              'border',
              'box-shadow',
              'background',
            ],
          },
        ],
      },
      layerManager: {
        appendTo: '#layers',
      },
      traitManager: {
        appendTo: '#traits',
      },
    });

    grapesjsRef.current = editor;

    // Load default blocks
    loadDefaultBlocks(editor);
  };

  const loadDefaultBlocks = (editor: any) => {
    const blockManager = editor.BlockManager;

    // Hero Section
    blockManager.add('hero-section', {
      label: 'Hero Section',
      category: 'Sections',
      content: `
        <section style="padding: 80px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <h1 style="font-size: 48px; margin-bottom: 20px;">Welcome to Our Platform</h1>
          <p style="font-size: 20px; margin-bottom: 30px;">Learn Playwright & Selenium from industry experts</p>
          <button style="padding: 15px 30px; font-size: 18px; background: white; color: #667eea; border: none; border-radius: 5px; cursor: pointer;">Get Started</button>
        </section>
      `,
    });

    // Feature Grid
    blockManager.add('feature-grid', {
      label: 'Feature Grid',
      category: 'Sections',
      content: `
        <section style="padding: 60px 20px;">
          <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px;">
            <div style="text-align: center; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h3>Expert Instructors</h3>
              <p>Learn from industry professionals with years of experience</p>
            </div>
            <div style="text-align: center; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h3>Hands-on Projects</h3>
              <p>Build real-world projects to solidify your skills</p>
            </div>
            <div style="text-align: center; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h3>Lifetime Access</h3>
              <p>Access course materials anytime, anywhere</p>
            </div>
          </div>
        </section>
      `,
    });

    // Lead Capture Form
    blockManager.add('lead-form', {
      label: 'Lead Form',
      category: 'Forms',
      content: `
        <section style="padding: 60px 20px; background: #f5f5f5;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="text-align: center; margin-bottom: 30px;">Start Learning Today</h2>
            <form>
              <input type="text" placeholder="First Name" style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px;" required />
              <input type="email" placeholder="Email Address" style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px;" required />
              <button type="submit" style="width: 100%; padding: 15px; background: #667eea; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;">Sign Up Now</button>
            </form>
          </div>
        </section>
      `,
    });

    // Testimonials
    blockManager.add('testimonials', {
      label: 'Testimonials',
      category: 'Sections',
      content: `
        <section style="padding: 60px 20px; background: #f9f9f9;">
          <h2 style="text-align: center; margin-bottom: 40px;">What Our Students Say</h2>
          <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <p>"This course transformed my testing career. The instructors are amazing!"</p>
              <p style="margin-top: 15px; font-weight: bold;">- John Doe</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <p>"Best investment I've made in my professional development."</p>
              <p style="margin-top: 15px; font-weight: bold;">- Jane Smith</p>
            </div>
          </div>
        </section>
      `,
    });
  };

  const handleSave = async () => {
    if (!grapesjsRef.current) return;

    const html = grapesjsRef.current.getHtml();
    const css = grapesjsRef.current.getCss();
    const content = JSON.stringify(grapesjsRef.current.getProjectData());

    // TODO: Save to backend
    console.log('Saving page:', { pageData, html, css, content, seoData });
  };

  const handlePublish = async () => {
    await handleSave();
    // TODO: Publish to backend
    setIsPublished(true);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleCreateVariant = () => {
    setShowVariantDialog(true);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h5">Landing Page Builder</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={handlePreview}
          >
            Preview
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            onClick={handlePublish}
          >
            Publish
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Settings */}
        <Box
          sx={{
            width: 300,
            borderRight: 1,
            borderColor: 'divider',
            overflow: 'auto',
            bgcolor: 'background.paper',
          }}
        >
          <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
            <Tab label="Settings" />
            <Tab label="SEO" />
            <Tab label="A/B Test" />
          </Tabs>

          <TabPanel value={currentTab} index={0}>
            <TextField
              fullWidth
              label="Page Title"
              value={pageData.title}
              onChange={(e) =>
                setPageData({ ...pageData, title: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Slug"
              value={pageData.slug}
              onChange={(e) =>
                setPageData({ ...pageData, slug: e.target.value })
              }
              margin="normal"
              helperText="URL-friendly version of the title"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={pageData.type}
                onChange={(e) =>
                  setPageData({ ...pageData, type: e.target.value })
                }
              >
                <MenuItem value="course">Course Landing</MenuItem>
                <MenuItem value="promotional">Promotional</MenuItem>
                <MenuItem value="webinar">Webinar</MenuItem>
                <MenuItem value="event">Event</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={pageData.description}
              onChange={(e) =>
                setPageData({ ...pageData, description: e.target.value })
              }
              margin="normal"
            />
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <TextField
              fullWidth
              label="SEO Title"
              value={seoData.title}
              onChange={(e) =>
                setSeoData({ ...seoData, title: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Meta Description"
              value={seoData.description}
              onChange={(e) =>
                setSeoData({ ...seoData, description: e.target.value })
              }
              margin="normal"
              helperText="Max 160 characters"
            />
            <TextField
              fullWidth
              label="Keywords"
              helperText="Comma separated"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Open Graph Image"
              value={seoData.ogImage}
              onChange={(e) =>
                setSeoData({ ...seoData, ogImage: e.target.value })
              }
              margin="normal"
            />
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={enableABTesting}
                  onChange={(e) => setEnableABTesting(e.target.checked)}
                />
              }
              label="Enable A/B Testing"
            />
            {enableABTesting && (
              <Box sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleCreateVariant}
                >
                  Create Variant
                </Button>
                <Box sx={{ mt: 2 }}>
                  {variants.map((variant, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1">
                          {variant.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Conversion Rate: {variant.conversionRate}%
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
          </TabPanel>
        </Box>

        {/* Center - Editor */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <div ref={editorRef} style={{ height: '100%' }} />
        </Box>

        {/* Right Sidebar - Blocks, Styles, Layers */}
        <Box
          sx={{
            width: 300,
            borderLeft: 1,
            borderColor: 'divider',
            overflow: 'auto',
            bgcolor: 'background.paper',
          }}
        >
          <Box id="blocks" sx={{ p: 2 }} />
          <Box id="styles" sx={{ p: 2 }} />
          <Box id="layers" sx={{ p: 2 }} />
          <Box id="traits" sx={{ p: 2 }} />
        </Box>
      </Box>

      {/* Preview Dialog */}
      <Dialog
        fullScreen
        open={showPreview}
        onClose={() => setShowPreview(false)}
      >
        <DialogTitle>
          Preview
          <IconButton
            onClick={() => setShowPreview(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {grapesjsRef.current && (
            <iframe
              srcDoc={`
                <html>
                  <head>
                    <style>${grapesjsRef.current.getCss()}</style>
                  </head>
                  <body>${grapesjsRef.current.getHtml()}</body>
                </html>
              `}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Variant Dialog */}
      <Dialog
        open={showVariantDialog}
        onClose={() => setShowVariantDialog(false)}
      >
        <DialogTitle>Create A/B Test Variant</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Variant Name" margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVariantDialog(false)}>Cancel</Button>
          <Button variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LandingPageBuilder;
