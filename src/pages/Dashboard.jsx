import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Card, Button, Chip, Stack, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import axiosInstance from '../api/axios';
import { useToast } from '../context/firebaseProvider';

const systemicIssues = [
  '6 repeat findings across inspections indicate persistent compliance gaps',
  'Documentation control appears to be an industry-wide challenge',
  'QA oversight deficiencies are prevalent across multiple facilities',
  'Cleaning validation protocols require standardization across the industry',
];
const Dashboard = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const localStartDate = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const localEndDate = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const [timeAnalysisResult, setTimeAnalysisResult] = useState([]);
    
    const handleEndDateChange = async(date) => {
        setEndDate(date);
        setLoading(true);
        try {
            const response = await axiosInstance.get('/timeAnalysis', {
                params: {
                    startDate: new Date(startDate).getTime(),
                    endDate: new Date(date).getTime()
                }
            });
            if(response.data == 'No documents found in Firebase Firestore for the date range') {
              setTimeAnalysisResult([]);
              showToast('No documents found from the selected date range', 'error');  
            } else {
              setTimeAnalysisResult(response.data);
            }
        } catch (error) {
            setTimeAnalysisResult([]);
            showToast('Failed to fetch data, Please try again', 'error');
        } finally {
            setLoading(false);
        }
    }

    const { numberofCompanies, numberOfFiles, categoriesList, repetitiveIssues } = useMemo(() => {
      const uniqueCompanies = new Set(timeAnalysisResult.map(item => item.companyName));
      const fileNames = new Set(timeAnalysisResult.map(item => item.pdfFileName));
      const repetitiveIssues = timeAnalysisResult.filter(item => item.repeatFinding != null);
      const categoryCount = {};
      timeAnalysisResult.forEach(item => {
        if (item.category) {
          categoryCount[item.category] = (categoryCount[item.category] ||  0) + 1;
        }
      });
      const categoriesList = Object.entries(categoryCount).map(([label, count]) => ({ label, count }));
      return {
        numberofCompanies: uniqueCompanies.size,
        numberOfFiles: fileNames.size,
        categoriesList,
        repetitiveIssues: []
      };
    }, [timeAnalysisResult]);

    return (
      <Box sx={{ minHeight: '100vh', background: '#f7f9fb', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4, position: 'relative' }}>
        {loading && (
          <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(12, 12, 12, 0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        )}
        {/* Date pickers card */}
        <Card sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: 2, width: '80%', ml: 0, mr: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Timeline Analysis</Typography>
          <Typography sx={{ color: '#5c6470', mb: 3 }}>
            Select a date range to analyze FDA 483 observations
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, mb: 2, width: '100%' }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>Start Date</Typography>
              <DatePicker
                value={startDate}
                onChange={(date) => setStartDate(date)}
                format="MMM d yyyy"
                label="Enter Start Date"
                slotProps={{ textField: { fullWidth: true, placeholder: 'Enter Start Date', size: 'small' } }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>End Date</Typography>
              <DatePicker
                value={endDate}
                onChange={(date) => handleEndDateChange(date)}
                format="MMM dd yyyy"
                label="Enter End Date"
                slotProps={{ textField: { fullWidth: true, placeholder: 'Enter End Date', size: 'small' } }}
              />
            </Box>
          </Box>
        </Card>

        {timeAnalysisResult.length == 0 ? (
            <Card sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3, boxShadow: 1, width: '80%', ml: 0, mr: 0 }}>
                <InsertDriveFileOutlinedIcon sx={{ fontSize: 56, color: '#8a94a6', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
                Select a Start and End Date to Begin Analysis
                </Typography>
                <Typography sx={{ color: '#5c6470', textAlign: 'center' }}>
                Use the date fields above to analyze FDA 483 trends.
                </Typography>
            </Card>
        ) : (
        <>
            {/* Executive Summary */}
            <Card sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: 1, width: '80%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Executive Summary</Typography>
            <Button variant="contained" sx={{ position: 'absolute', top: 24, right: 24, background: '#f5faff', color: '#1976d2', fontWeight: 600, boxShadow: 'none', '&:hover': { background: '#e3f2fd' }, textTransform: 'none', borderRadius: 8, fontSize: 15, px: 2 }}>
                {timeAnalysisResult.length} Total Observations
            </Button>
            <Typography sx={{ color: '#222', mb: 1 }}>
                Timeline analysis from {localStartDate} to {localEndDate} reveals {timeAnalysisResult.length} observations across {numberOfFiles} FDA 483 inspections involving {numberofCompanies} companies.
            </Typography>
            <Typography sx={{ color: '#222' }}>
                The data indicates significant compliance challenges requiring industry-wide attention and systematic improvements.
            </Typography>
            </Card>

            {/* Primary Issue Categories & Systemic Issues Identified */}
            <Box sx={{ width: '84%', display: 'flex', gap:3, mb: 4, justifyContent:'space-around', flexDirection: 'row' }}>
            {/* Primary Issue Categories */}
            <Card sx={{ flex: 1, minWidth:400, p: 4, borderRadius: 3, boxShadow: 1, mr: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Primary Issue Categories</Typography>
                <Stack spacing={2}>
                {categoriesList.map((cat, idx) => (
                    <Box key={cat.label} sx={{ display: 'flex', alignItems: 'center', background: '#f7f9fb', borderRadius: 2, px: 2, py: 1 }}>
                    <Chip label={idx + 1} sx={{ mr: 2, background: '#e3eafd', color: '#1976d2', fontWeight: 700 }} />
                    <Typography sx={{ flex: 1, fontWeight: 500 }}>{cat.label}</Typography>
                    <Chip label={cat.count} sx={{ background: '#f1f3f6', color: '#222', fontWeight: 700 }} />
                    </Box>
                ))}
                </Stack>
            </Card>
            {/* Systemic Issues Identified */}
            <Card sx={{ flex: 1, minWidth: 400, p: 4, borderRadius: 3, boxShadow: 1, background: '#fff', ml: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningAmberOutlinedIcon sx={{ color: '#a05a00', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#7a3a00' }}>Systemic Issues Identified</Typography>
                </Box>
                {repetitiveIssues.length > 0 ?
                    <Stack spacing={2}>
                    {systemicIssues.map((issue, idx) => (
                        <Box key={idx} sx={{ background: '#fff3cd', border: '1px solid #ffe6a1', borderRadius: 2, px: 2, py: 1 }}>
                        <Typography sx={{ color: '#7a3a00', fontWeight: 500 }}>{issue}</Typography>
                        </Box>
                    ))}
                    </Stack>
                :
                    <Typography sx={{ color: '#222', fontWeight: 500, textAlign:'center', pt: 5 }}>No repetitive issues found</Typography>
                }
            </Card>
            </Box>

            {/* All Observations Section */}
            <Card sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: 1, width: '80%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>All Observations ({timeAnalysisResult.length})</Typography>
            <Stack spacing={3}>
              {timeAnalysisResult.map((item, idx) => {
                const inspectionDate = new Date(item.inspectionDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                return (
                <Box key={idx} sx={{ border: '1px solid #ececec', borderRadius: 2, p: 3, background: '#fff', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarMonthOutlinedIcon sx={{ fontSize: 22, color: '#222', mr: 1 }} />
                    <Typography sx={{ fontWeight:500, mr: 1 }}>{inspectionDate}</Typography>
                    <Typography sx={{ color: '#222', fontWeight: 500 }}>&bull; {item.companyName}</Typography>
                    <Box sx={{ flex: 1 }} />
                    {item.category && <Chip
                        key={item.category}
                        label={item.category}
                        sx={{
                            ml: 1,
                            background: '#e3eafd',
                            color: '#1976d2',
                            fontWeight: 500,
                            fontSize: 14,
                            px: 1.5,
                            borderRadius: 2,
                        }}
                        size="small"
                    />}
                    </Box>
                    <Typography sx={{ color: '#222', mb: 1 }}>{item.summary}</Typography>
                    {item.cfrNumber && <Box sx={{ display: 'inline-block', background: '#f7f7f7', borderRadius: 1, px: 1.5, py: 0.5, fontFamily: 'monospace', fontSize: 15, color: '#222', fontWeight: 500, width: 'fit-content' }}>
                    {item.cfrNumber}
                    </Box>}
                </Box>
                )
              })}
            </Stack>
            </Card>
        </>
        )}
      </Box>
    );
};

export default Dashboard; 