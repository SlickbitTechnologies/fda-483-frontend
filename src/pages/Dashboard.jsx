import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Box, Typography, Card, Button, Chip, Stack, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const localStartDate = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const localEndDate = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const [timeAnalysisResult, setTimeAnalysisResult] = useState([]);
    const [filteredObservations, setFilteredObservations] = useState([]);
    const [filteredCategory, setFilteredCategory] = useState(null);
    const observationsRef = useRef(null);

    const handleRunAnalysis = async () => {
      if (!startDate || !endDate) {
        showToast('Please select date range to run analysis', 'error');
        return;
      }
      setLoading(true);
      try {
        const response = await axiosInstance.get('/timeAnalysis', {
          params: {
            startDate: new Date(startDate).getTime(),
            endDate: new Date(endDate).getTime()
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

    const {finalResult, numberofCompanies, numberOfFiles, categoriesList, repetitiveIssues} = useMemo(() => {
      let data = [];
      const uniqueCompanies = new Set(timeAnalysisResult.map(item => item.companyName)); 

      const repetitiveIssuesresult = [];

      timeAnalysisResult.map((i) => {
        if(i.repeatFinding) {
          i.repeatFinding.forEach((item) => {
            if(item.length > 30) {
            let obj = {
              label: item
              }
              repetitiveIssuesresult.push(obj);
            }
          })
        }
      })



      if (timeAnalysisResult && timeAnalysisResult.length > 0) {
        timeAnalysisResult.forEach((item) => {
          // If item has observations array, create individual objects for each observation
          if (item.observations && item.observations.length > 0) {
            item.observations.forEach((observation) => {
              let isRepeated = false;
              if (item.repeatFinding && observation.category) {
                const categoryWords = observation.category.toLowerCase().split(' ');
                isRepeated = item.repeatFinding.some(repeatItem => {
                  const repeatText = repeatItem.toLowerCase();
                  return categoryWords.some(word => 
                    repeatText.includes(word) && word.length > 3
                  );
                });
              }
              data.push({
                companyName: item.companyName,
                feiNumber: item.feiNumber,
                url: item.url,
                date: item.date,
                summary: observation.summary,
                category: observation.category,
                cfrNumber: observation.cfrNumber,
                issueIdentified: isRepeated
              });
            });
          } else {
            // If no observations, create a single object with the item data
            data.push({
              companyName: item.companyName,
              feiNumber: item.feiNumber,
              url: item.url,
              date: item.date,
              summary: item.summary || '',
              category: item.category || '',
              cfrNumber: item.cfrNumber || '',
              issueIdentified: false
            });
          }
        });
      }

      

      const categoryCount = {};
      data.forEach(item => {
        if (item.category) {
          categoryCount[item.category] = (categoryCount[item.category] ||  0) + 1;
        }
      });

      return { 
        finalResult: data,
        numberofCompanies: uniqueCompanies.size,
        numberOfFiles: timeAnalysisResult.length,
        categoriesList: Object.entries(categoryCount).map(([label, count]) => ({ label, count })),
        repetitiveIssues: repetitiveIssuesresult,
        
      };
    }, [timeAnalysisResult]);
    const handleCategoryClick = (category) => {
      const filteredObservations = finalResult.filter(item => item.category === category);
      setFilteredObservations(filteredObservations);
      setFilteredCategory(category);
      setTimeout(() => {
        if (observationsRef.current) {
          observationsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    const handleSytemicIssueClick = (issue) => {
      console.log('Systemic issue clicked:', issue);
      
      // Find observations that have issueIdentified = true and match the systemic issue
      const matchingObservations = finalResult.filter(item => {
        if (!item.issueIdentified) return false;
        
        // Check if the systemic issue text contains any words from the observation's category
        if (item.category) {
          const categoryWords = item.category.toLowerCase().split(' ');
          const issueText = issue.toLowerCase();
          
          return categoryWords.some(word => 
            issueText.includes(word) && word.length > 3
          );
        }
        return false;
      });
      
      console.log('Matching observations with issueIdentified:', matchingObservations);
      
      if (matchingObservations.length > 0) {
        // Get the most common category from matching observations
        const categoryCount = {};
        matchingObservations.forEach(item => {
          if (item.category) {
            categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
          }
        });
        
        const mostCommonCategory = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)[0]?.[0];
        
        console.log('Most common category from matching observations:', mostCommonCategory);
        
        if (mostCommonCategory) {
          // Filter observations by the most common category
          const filteredObservations = finalResult.filter(item => item.category === mostCommonCategory);
          setFilteredObservations(filteredObservations);
          setFilteredCategory(mostCommonCategory);
          
          console.log('Filtered observations by category:', filteredObservations);
          
          // Scroll to observations section
          setTimeout(() => {
            if (observationsRef.current) {
              observationsRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }
      } else {
        console.log('No matching observations found for this systemic issue');
      }
    }


    useEffect(() => {
      if(filteredObservations.length > 0) {
        setFilteredObservations(filteredObservations)
      }else {
        setFilteredObservations(finalResult)
      }
    }, [timeAnalysisResult])

    const handleAllObservations = () => {
      setFilteredObservations(finalResult);
      setFilteredCategory(null);
      setTimeout(() => {
        if (observationsRef.current) {
          observationsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }

    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: '#f7f9fb', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        paddingTop: { xs: 2, sm: 3, md: 4 }, 
        paddingBottom: { xs: 2, sm: 3, md: 4 },
        paddingX: { xs: 1, sm: 2, md: 0 },
        position: 'relative' 
      }}>
        {loading && (
          <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(12, 12, 12, 0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        )}
        {/* Date pickers card */}
        <Card sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          mb: { xs: 2, sm: 3, md: 4 }, 
          borderRadius: 3, 
          boxShadow: 2, 
          width: { xs: '100%', sm: '95%', md: '80%' }, 
          ml: 0, 
          mr: 0 
        }}>
          <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700, mb: 1 }}>Timeline Analysis</Typography>
          <Typography sx={{ color: '#5c6470', mb: 3, fontSize: { xs: '14px', sm: '16px' } }}>
            Select a date range to analyze FDA 483 observations
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 2, sm: 3, md: 4 }, 
            mb: 2, 
            width: '100%',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'flex-end' }
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600, mb: 1, fontSize: { xs: '14px', sm: '16px' } }}>Start Date</Typography>
              <DatePicker
                value={startDate}
                onChange={(date) => setStartDate(date)}
                format="MMM dd yyyy"
                label="Enter Start Date"
                views={['year', 'month', 'day']}
                localeText={{
                  fieldMonthPlaceholder: () => 'MMM',
                }}
                slotProps={{ 
                  textField: { 
                    fullWidth: true, 
                    placeholder: 'Enter Start Date', 
                    size: 'small',
                    sx: { fontSize: { xs: '14px', sm: '16px' } }
                  } 
                }}
                minDate={new Date('2024-01-01')}
                maxDate={new Date()}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600, mb: 1, fontSize: { xs: '14px', sm: '16px' } }}>End Date</Typography>
              <DatePicker
                value={endDate}
                onChange={(date) => setEndDate(date)}
                format="MMM dd yyyy"
                label="Enter End Date"
                localeText={{
                  fieldMonthPlaceholder: () => 'MMM',
                }}
                views={['year', 'month', 'day']}
                slotProps={{ 
                  textField: { 
                    fullWidth: true, 
                    placeholder: 'Enter End Date', 
                    size: 'small',
                    sx: { fontSize: { xs: '14px', sm: '16px' } }
                  } 
                }}
                minDate={startDate}
                maxDate={new Date()}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRunAnalysis}
                sx={{
                  minWidth: 120,
                  height: 40,
                  fontWeight: 600,
                  fontSize: { xs: '14px', sm: '16px' },
                  ml: { xs: 0, sm: 2 },
                  mt: { xs: 2, sm: 0 },
                  textTransform: 'none',
                  boxShadow: 'none',
                  background: '#1976d2',
                  transition: 'transform 0.2s cubic-bezier(.4,2,.6,1), box-shadow 0.2s cubic-bezier(.4,2,.6,1), background 0.2s',
                  '&:hover': {
                    background: '#115293',
                    transform: 'scale(1.06) translateY(-2px)',
                    boxShadow: '0 6px 18px 0 rgba(25, 118, 210, 0.18)',
                  },
                }}
              >
                Run Analysis
              </Button>
            </Box>
          </Box>
        </Card>

        {timeAnalysisResult.length == 0 ? (
            <Card sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              borderRadius: 3, 
              boxShadow: 1, 
              width: { xs: '100%', sm: '95%', md: '80%' }, 
              ml: 0, 
              mr: 0 
            }}>
                <InsertDriveFileOutlinedIcon sx={{ fontSize: { xs: 40, sm: 48, md: 56 }, color: '#8a94a6', mb: 2 }} />
                <Typography variant={isMobile ? "h6" : "h6"} sx={{ fontWeight: 700, mb: 1, textAlign: 'center', fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>
                Select a Start and End Date to Begin Analysis
                </Typography>
                <Typography sx={{ color: '#5c6470', textAlign: 'center', fontSize: { xs: '14px', sm: '16px' } }}>
                Use the date fields above to analyze FDA 483 trends.
                </Typography>
            </Card>
        ) : (
        <>
            {/* Executive Summary */}
            <Card sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              mb: { xs: 2, sm: 3, md: 4 }, 
              borderRadius: 3, 
              boxShadow: 1, 
              width: { xs: '100%', sm: '95%', md: '80%' }, 
              display: 'flex', 
              flexDirection: 'column', 
              position: 'relative' 
            }}>
            <Typography variant={isMobile ? "h6" : "h6"} sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>Executive Summary</Typography>
            <Button variant="contained" 
              onClick={handleAllObservations}
              sx={{ 
                position: { xs: 'static', sm: 'absolute' }, 
                top: { sm: 24, md: 24 }, 
                right: { sm: 24, md: 24 }, 
                background: '#f5faff', 
                color: '#1976d2', 
                fontWeight: 600, 
                boxShadow: 'none', 
                '&:hover': { background: '#e3f2fd' }, 
                textTransform: 'none', 
                borderRadius: 8, 
                fontSize: { xs: '13px', sm: '14px', md: '15px' }, 
                px: 2,
                mb: { xs: 2, sm: 0 },
                alignSelf: { xs: 'flex-start', sm: 'auto' }
              }}>
                {finalResult.length} Total Observations
            </Button>
            <Typography sx={{ color: '#222', mb: 1, fontSize: { xs: '14px', sm: '16px' } }}>
                Timeline analysis from {localStartDate} to {localEndDate} reveals {finalResult.length} observations across {numberOfFiles} FDA 483 inspections involving {numberofCompanies} companies.
            </Typography>
            <Typography sx={{ color: '#222', fontSize: { xs: '14px', sm: '16px' } }}>
                The data indicates significant compliance challenges requiring industry-wide attention and systematic improvements.
            </Typography>
            </Card>

            {/* Primary Issue Categories & Systemic Issues Identified */}
            <Box sx={{ 
              width: { xs: '100%', sm: '95%', md: '84%' }, 
              display: 'flex', 
              gap: { xs: 2, sm: 3 }, 
              mb: { xs: 2, sm: 3, md: 4 }, 
              justifyContent: 'space-around', 
              flexDirection: { xs: 'column', lg: 'row' } 
            }}>
            {/* Primary Issue Categories */}
            <Card sx={{ 
              flex: 1, 
              minWidth: { xs: 'auto', lg: 400 }, 
              p: { xs: 2, sm: 3, md: 4 }, 
              borderRadius: 3, 
              boxShadow: 1, 
              mr: { xs: 0, lg: 0 },
              mb: { xs: 2, lg: 0 }
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                  <Typography variant={isMobile ? "h6" : "h6"} sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>Primary Issue Categories</Typography>
                  {filteredCategory && (
                    <Button variant="contained" 
                      onClick={handleAllObservations}
                      sx={{ 
                        height: '30px',
                        width: 'auto',
                        background: '#f5faff',
                        color: '#1976d2',
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': { background: '#e3f2fd' },
                      }}>
                      Clear filter
                    </Button>
                  )}
                </Box>
                <Stack spacing={2} sx={{ maxHeight: '300px', minHeight: '300px', overflowY: 'auto', pr: 1 }}>
                {categoriesList.map((cat, idx) => (
                    <Box key={cat.label} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      background: '#f7f9fb', 
                      borderRadius: 2, 
                      px: { xs: 1.5, sm: 2 }, 
                      py: 1,
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                    <Box onClick={() => handleCategoryClick(cat.label)} sx={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer' }}>
                      <Chip label={idx + 1} sx={{ mr: 2, background: '#e3eafd', color: '#1976d2', fontWeight: 700, fontSize: { xs: '12px', sm: '14px' } }} />
                      <Typography sx={{ flex: 1, fontWeight: 500, fontSize: { xs: '13px', sm: '14px', md: '16px' } }}>{cat.label}</Typography>
                      <Chip label={cat.count} sx={{ background: '#f1f3f6', color: '#222', fontWeight: 700, fontSize: { xs: '12px', sm: '14px' } }} />
                    </Box>
                    </Box>
                ))}
                </Stack>
            </Card>
            {/* Systemic Issues Identified */}
            <Card sx={{ 
              flex: 1, 
              minWidth: { xs: 'auto', lg: 400 }, 
              p: { xs: 2, sm: 3, md: 4 }, 
              borderRadius: 3, 
              boxShadow: 1, 
              background: '#fff', 
              ml: { xs: 0, lg: 0 } 
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningAmberOutlinedIcon sx={{ color: '#a05a00', mr: 1, fontSize: { xs: '20px', sm: '24px' } }} />
                <Typography variant={isMobile ? "h6" : "h6"} sx={{ fontWeight: 700, color: '#7a3a00', fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>Systemic Issues Identified</Typography>
                </Box>
                {repetitiveIssues.length > 0 ?
                    <Stack spacing={2} sx={{ maxHeight: '300px', minHeight: '300px', overflowY: 'auto', pr: 1 }}>
                    {repetitiveIssues.slice(0, 6).map((issue, idx) => (
                        <Box onClick={() => handleSytemicIssueClick(issue.label)} key={idx} sx={{ cursor: 'pointer', background: '#fff3cd', border: '1px solid #ffe6a1', borderRadius: 2, px: { xs: 1.5, sm: 2 }, py: 1 }}>
                        <Typography sx={{ color: '#7a3a00', fontWeight: 500, fontSize: { xs: '13px', sm: '14px', md: '16px' } }}>{issue.label}</Typography>
                        </Box>
                    ))}
                    </Stack>
                :
                    <Typography sx={{ color: '#222', fontWeight: 500, textAlign:'center', pt: 5, fontSize: { xs: '14px', sm: '16px' } }}>No repetitive issues found</Typography>
                }
            </Card>
            </Box>

            {/* All Observations Section */}
            <Card sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              mb: { xs: 2, sm: 3, md: 4 }, 
              borderRadius: 3, 
              boxShadow: 1, 
              width: { xs: '100%', sm: '95%', md: '80%' }, 
              scrollMarginTop: '100px'
            }} ref={observationsRef}>
            <Typography variant={isMobile ? "h6" : "h6"} sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>All Observations ({filteredObservations.length})</Typography>
            <Stack
                spacing={3}
                sx={{
                  maxHeight: '500px',
                  minHeight: '500px',
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#e0e0e0',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                }}
              >
              {filteredObservations.map((item, idx) => {
                const inspectionDate = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                return (
                <Box key={idx} sx={{ 
                  border: '1px solid #ececec', 
                  borderRadius: 2, 
                  p: { xs: 2, sm: 3 }, 
                  background: '#fff', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1 
                }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 1,
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
                      <CalendarMonthOutlinedIcon sx={{ fontSize: { xs: 18, sm: 22 }, color: '#222', mr: 1 }} />
                      <Typography sx={{ fontWeight: 500, mr: 1, fontSize: { xs: '13px', sm: '14px', md: '16px' } }}>{inspectionDate}</Typography>
                      <Typography sx={{ color: '#222', fontWeight: 500, fontSize: { xs: '13px', sm: '14px', md: '16px' } }}>&bull; {item.companyName}</Typography>
                      <Box sx={{ flex: 1 }} />
                      {item.category && <Chip
                          key={item.category}
                          label={item.category}
                          sx={{
                              ml: { xs: 0, sm: 1 },
                              mt: { xs: 1, sm: 0 },
                              background: '#e3eafd',
                              color: '#1976d2',
                              fontWeight: 500,
                              fontSize: { xs: '12px', sm: '14px' },
                              px: 1.5,
                              borderRadius: 2,
                          }}
                          size="small"
                      />}
                      {item.issueIdentified && <Chip
                          key={item.issueIdentified}
                          label={item.issueIdentified ? 'Repeat Finding' : ''}
                          sx={{
                              ml: { xs: 0, sm: 1 },
                              mt: { xs: 1, sm: 0 },
                              background: '#ffe6a1',
                              color: '#7a3a00',
                              border: '1px solid #ffe6a1',
                              fontWeight: 500,
                              fontSize: { xs: '12px', sm: '14px' },
                              px: 1.5,
                              borderRadius: 2,
                          }}
                          size="small"
                      />}
                    </Box>
                    </Box>
                    <Typography sx={{ color: '#222', mb: 1, fontSize: { xs: '14px', sm: '16px' } }}>{item.summary}</Typography>
                    {item.cfrNumber && <Box sx={{ 
                      display: 'inline-block', 
                      background: '#f7f7f7', 
                      borderRadius: 1, 
                      px: 1.5, 
                      py: 0.5, 
                      fontFamily: 'monospace', 
                      fontSize: { xs: '13px', sm: '15px' }, 
                      color: '#222', 
                      fontWeight: 500, 
                      width: 'fit-content' 
                    }}>
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