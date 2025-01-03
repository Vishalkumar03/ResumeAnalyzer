import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { TextField, Button, Box, Container, Typography, Card, CardContent, CircularProgress } from '@mui/material';

function App() {
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:5000/analyze', {
                resume_text: resumeText,
                job_description: jobDescription,
            });
            setAnalysis(response.data);
        } catch (error) {
            console.error('Error during analysis', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Description Section */}
                <Box sx={{ flex: 1, padding: 4, maxWidth: '500px', backgroundColor: '#ffffff', borderRadius: 3, boxShadow: 2 }}>
                    <Typography variant="h4" color="primary" gutterBottom>
                        AI Resume Analyzer
                    </Typography>
                    <Typography variant="body1" color="textSecondary" paragraph>
                        The AI Resume Analyzer is a cutting-edge tool that helps you match your resume to job descriptions based on predefined skills and semantic similarity. By analyzing your resume and job description, it calculates a fit score, highlighting how well your skills align with the job requirements. Perfect for job seekers and employers!
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Simply input your resume text and the job description, and our AI model will provide a score to show how closely your profile matches the job requirements.
                    </Typography>
                </Box>

                {/* Form Section */}
                <Box sx={{ flex: 1, padding: 4, maxWidth: '500px' }}>
                    <Typography variant="h3" color="primary" gutterBottom sx={{ textAlign: 'center' }}>
                        Resume and Job Description Analysis
                    </Typography>
                    <Card sx={{ padding: 3, marginBottom: 3, borderRadius: 2, boxShadow: 2 }}>
                        <CardContent>
                            <TextField
                                label="Resume Text"
                                multiline
                                rows={6}
                                fullWidth
                                variant="outlined"
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                sx={{ marginBottom: 3 }}
                            />
                            <TextField
                                label="Job Description"
                                multiline
                                rows={6}
                                fullWidth
                                variant="outlined"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                sx={{ marginBottom: 3 }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                onClick={handleAnalyze}
                                sx={{
                                    marginTop: 2,
                                    background: '#03A9F4',
                                    '&:hover': { background: '#0288D1' },
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze'}
                            </Button>
                        </CardContent>
                    </Card>

                    {analysis && (
                        <Card sx={{ padding: 3, borderRadius: 2, marginTop: 4, boxShadow: 2 }}>
                            <CardContent>
                                <Typography variant="h6" color="primary">
                                    Analysis Results
                                </Typography>
                                <Box sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    <Typography variant="body1" color="textSecondary">
                                        <strong>Score:</strong> {analysis.score || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1" color="textSecondary">
                                        <strong>Fit Status:</strong> {analysis.is_good_fit || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1" color="textSecondary">
                                        <strong>Matching Skills:</strong> {analysis.matching_skills?.join(', ') || 'N/A'}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                </Box>
            </Container>
        </Box>
    );
}

export default App;
