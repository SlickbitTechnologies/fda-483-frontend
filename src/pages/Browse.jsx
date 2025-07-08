import React, {useState, useEffect, useMemo} from 'react';
import { Box, Typography, Card, TextField, InputAdornment, MenuItem, Select, FormControl, Chip, IconButton, Divider, Autocomplete, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import axiosInstance from '../api/axios';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';

const sortOptions = ['Inspection Date', 'Company Name', 'FEI Number'];

const tagColors = {
  'Cleaning Validation': { bg: '#e3eafd', color: '#1976d2' },
  'Documentation': { bg: '#e3eafd', color: '#1976d2' },
  'Repeat Finding': { bg: '#fff3cd', color: '#a05a00' },
};

const Browse = () => {
  const [company, setCompany] = useState('');
  const [fei, setFei] = useState('');
  const [sort, setSort] = useState('Inspection Date');
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [debounce, setDebounce] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fetchDocuments = async () => {
    try {
      const response = await axiosInstance.get('/firebaseData');
      setDocuments(response.data);
    } catch (error) {
      console.log(error, 'error')
    }
  }
  useEffect(() => {
    fetchDocuments();
  }, [])

  const fetchResult = async () => {
    // setLoading(true);
    try {
      if(filteredDocuments.length > 0) {
        const feiNumbers = filteredDocuments.map(doc => doc.fei_number);        
        const response = await axiosInstance.post('/browseDocuments', {feiNumbers: feiNumbers});
        const first = response.data[0];
        if(first) {
        setFilteredDocuments(prev =>
          prev.map(doc => {
            // Find the matching item in response.data by companyName (or use another unique key)
            const match = response.data.find(item => item.companyName === doc.name);
            if (match) {
              return {
                ...doc,
                summary: match.summary,
                category: match.category // add or update the category
              };
            }
            return doc;
          })
        );
        }
      }
    } catch (error) {
      console.log(error, 'error')
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResult()
  }, [company, fei])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounce(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const {companysList, feiNumbersList} = useMemo(() => { 
    const uniqueCompanies = [...new Set(documents.map(doc => doc.name))];
    const uniqueFeiNumbers = [...new Set(documents.map(doc => doc.fei_number))];
    return {
      companysList: uniqueCompanies,
      feiNumbersList: uniqueFeiNumbers,
    };
  } , [documents])

  const handleCompanyChange = (value) => {
    setCompany(value);
    setFilteredDocuments(documents.filter(doc => doc.name === value))
  }

  const handleFeiChange = (value) => {
    setFei(value);
    setFilteredDocuments(documents.filter(doc => doc.fei_number === value))
  }

  // Sort filteredDocuments based on sort option
  const sortedDocuments = useMemo(() => {
    if (!filteredDocuments) return [];
    let docs = [...filteredDocuments];
    if (sort === 'Inspection Date') {
      docs.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sort === 'Company Name') {
      docs.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sort === 'FEI Number') {
      docs.sort((a, b) => String(a.fei_number).localeCompare(String(b.fei_number)));
    }
    return docs;
  }, [filteredDocuments, sort]);

  useEffect(() => {
    if (debounce) {
      setFilteredDocuments(
        documents.filter(
          doc =>
            doc.name.toLowerCase().includes(search.toLowerCase()) ||
            String(doc.fei_number).includes(search)
        )
      );
    } else {
      setFilteredDocuments([]);
    }
  }, [debounce]);

  // const downloadPdf = (url, fileName = 'document.pdf') => {
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.setAttribute('download', fileName); // triggers download instead of view
  //   a.setAttribute('target', '_blank');   // fallback
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  // };

  // const totalobservations = useMemo(() => {
  //   return filteredDocuments.reduce((acc, doc) => acc + doc.observations.length, 0);
  // }, [filteredDocuments]);
  // console.log(totalobservations, 'totalobservationstotalobservations')
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
      marginBottom: 2 
    }}>
      {loading && (
          <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(12, 12, 12, 0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
      )}
      <Card sx={{ 
        width: { xs: '100%', sm: '95%', md: '80%' }, 
        p: { xs: 2, sm: 3, md: 4 }, 
        mb: { xs: 2, sm: 3, md: 4 }, 
        borderRadius: 3, 
        boxShadow: 1 
      }}>
        <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '18px', sm: '20px', md: '24px' } }}>Filter FDA 483 Inspections</Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 2, sm: 3, md: 4 }, 
          flexWrap: 'wrap', 
          alignItems: 'flex-end',
          flexDirection: { xs: 'column', lg: 'row' }
        }}>
          <Box sx={{ flex: { xs: 'none', lg: 2 }, minWidth: { xs: '100%', lg: 220 }, width: '100%' }}>
            <Typography sx={{ fontWeight: 500, mb: 1, fontSize: { xs: '14px', sm: '16px' } }}>Search</Typography>
            <TextField
              fullWidth
              placeholder="Search by company, FEI, Record ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon sx={{ color: '#b3a9a9', fontSize: { xs: '18px', sm: '20px' } }} />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ background: '#FFF', borderRadius: 2 }}
            />
          </Box>
          <Box sx={{ flex: { xs: 'none', lg: 1 }, minWidth: { xs: '100%', lg: 180 }, width: '100%' }}>
            <Typography sx={{ fontWeight: 500, mb: 1, fontSize: { xs: '14px', sm: '16px' } }}>Company</Typography>
            <Autocomplete
              options={companysList}
              value={company}
              onChange={(e, newValue) => handleCompanyChange(newValue)}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select Company" size="small" sx={{ background: '#FFF', borderRadius: 2 }} />
              )}
              sx={{ width: '100%' }}
              isOptionEqualToValue={(option, value) => option === value}
            />
          </Box>
          <Box sx={{ flex: { xs: 'none', lg: 1 }, minWidth: { xs: '100%', lg: 180 }, width: '100%' }}>
            <Typography sx={{ fontWeight: 500, mb: 1, fontSize: { xs: '14px', sm: '16px' } }}>FEI Number</Typography>
            <Autocomplete 
              options={feiNumbersList}
              value={fei}
              onChange={(e, newValue) => handleFeiChange(newValue)}
              getOptionLabel={option => String(option)} // <-- This fixes the warning!
              renderInput={(params) => (
                <TextField {...params} placeholder="Select FEI Number" size="small" sx={{ background: '#FFF', borderRadius: 2 }} />
              )}
              sx={{ width: '100%' }}
              isOptionEqualToValue={(option, value) => option === value}
            />
          </Box>
          <Box sx={{ flex: { xs: 'none', lg: 1 }, minWidth: { xs: '100%', lg: 180 }, width: '100%' }}>
            <Typography sx={{ fontWeight: 500, mb: 1, fontSize: { xs: '14px', sm: '16px' } }}>Sort By</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={sort}
                onChange={e => setSort(e.target.value)}
                sx={{ background: '#FFF', borderRadius: 2 }}
              >
                {sortOptions.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Card>
      {filteredDocuments.length > 0 ? (
        <>
          <Box sx={{ 
            width: { xs: '100%', sm: '95%', md: '84%' }, 
            mb: { xs: 1, sm: 2 }, 
            display: 'flex', 
            alignItems: 'center', 
            fontWeight: 500,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 0.5, sm: 0 }
          }}>
            <Typography sx={{ 
              color: '#38404a', 
              fontWeight: 600, 
              fontSize: { xs: '14px', sm: '16px' } 
            }}>
              {filteredDocuments.length} FDA 483 inspections found
            </Typography>
            <Typography sx={{ 
              color: '#38404a', 
              fontWeight: 500, 
              fontSize: { xs: '14px', sm: '16px' }, 
              mx: { xs: 0, sm: 2 },
              display: { xs: 'none', sm: 'block' }
            }}>
              &bull;
            </Typography>
            <Typography sx={{ 
              color: '#38404a', 
              fontWeight: 500, 
              fontSize: { xs: '14px', sm: '16px' } 
            }}>
              {filteredDocuments.length} total observations
            </Typography>
          </Box>
          <Card sx={{ 
            width: { xs: '100%', sm: '95%', md: '80%' }, 
            p: { xs: 2, sm: 3, md: 4 }, 
            borderRadius: 3, 
            boxShadow: 1 
          }}>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '18px', sm: '20px', md: '24px' } }}>FDA 483 Inspections</Typography>
            {/* Table Header */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              px: 1, 
              pb: 1, 
              color: '#7a7a7a', 
              fontWeight: 600, 
              fontSize: 16, 
              width: '100%' 
            }}>
              <Box sx={{ flex: '0 0 160px', minWidth: 120, maxWidth: 180 }}>Inspection Date</Box>
              <Box sx={{ flex: '0 0 240px', minWidth: 180, maxWidth: 260 }}>Company</Box>
              <Box sx={{ flex: '0 0 240px', minWidth: 200, maxWidth: 160 }}>FEI Number</Box>
              <Box sx={{ flex: '1 1 490px', minWidth: 390, maxWidth: 500 }}>Key Findings</Box>
              <Box sx={{ width: 60, textAlign: 'center' }}>View</Box>
            </Box>
            <Divider sx={{ mb: 2, display: { xs: 'none', md: 'block' } }} />
            {/* Table Rows */}
            {sortedDocuments.map((insp, idx) => {
              const inspectionDate = new Date(insp.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
              return (
              <Box key={idx} sx={{ 
                display: { xs: 'block', md: 'flex' }, 
                alignItems: 'center', 
                px: { xs: 0, md: 1 }, 
                py: { xs: 2, md: 1 }, 
                borderBottom: idx !== filteredDocuments.length - 1 ? '1px solid #f0f0f0' : 'none',
                mb: { xs: 2, md: 0 },
                width: '100%',
                '& > .table-col': { verticalAlign: 'middle', display: 'flex', alignItems: 'center', overflow: 'hidden' }
              }}>
                {/* Mobile Layout */}
                {isMobile && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: 500, fontSize: { xs: '13px', sm: '14px' } }}>{inspectionDate}</Typography>
                      <Box sx={{ background: '#f5f7fa', color: '#222', borderRadius: 1, px: 2, py: 0.5, fontWeight: 500, fontSize: { xs: '12px', sm: '14px' } }}>
                        {insp.fei_number ? insp.fei_number : 'N/A'}
                      </Box>
                    </Box>
                    <Typography sx={{ fontWeight: 500, fontSize: { xs: '14px', sm: '16px' } }}>{insp.name}</Typography>
                    {insp.summary && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Chip
                          label={insp.category}
                          sx={{
                            background: '#e3eafd',
                            color: '#1976d2',
                            fontWeight: 500,
                            fontSize: { xs: '12px', sm: '14px' },
                            borderRadius: 4,
                            width: 'fit-content',
                          }}
                          size="small"
                        />
                        <Typography sx={{
                          color: '#38404a',
                          fontSize: { xs: '13px', sm: '15px' },
                          fontWeight: 500,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {insp.summary}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <a href={insp.firebaseUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                        <IconButton 
                          sx={{ 
                            border: '1px solid #d8dce1', 
                            borderRadius: 3,
                            padding: 1
                          }}
                        >
                          <RemoveRedEyeOutlinedIcon sx={{ fontSize: { xs: '18px', sm: '20px' } }} />
                        </IconButton>
                      </a>
                    </Box>
                  </Box>
                )}
                
                {/* Desktop Layout */}
                {!isMobile && (
                  <>
                    {/* Inspection Date */}
                    <Box className="table-col" sx={{ flex: '0 0 160px', minWidth: 120, maxWidth: 180 }}>
                      <Typography sx={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inspectionDate}</Typography>
                    </Box>
                    {/* Company */}
                    <Box className="table-col" sx={{ flex: '0 0 240px', minWidth: 180, maxWidth: 260 }}>
                      <Typography sx={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{insp.name}</Typography>
                    </Box>
                    {/* FEI Number */}
                    <Box className="table-col" sx={{ flex: '0 0 140px', minWidth: 200, maxWidth: 260 }}>
                      <Box sx={{ background: '#f5f7fa', color: '#222', borderRadius: 1, px: 2, py: 0.5, fontWeight: 500, fontSize: 14, display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {insp.fei_number ? insp.fei_number : 'N/A'}
                      </Box>
                    </Box>
                    {/* Key Findings */}
                    <Box className="table-col" sx={{ flex: '1 1 490px', minWidth: 390, maxWidth: 500, flexDirection: 'column', gap: 1 }}>
                      {insp.observations && insp.observations.length > 0 ? 
                        insp.observations.slice(0,2).map((item, idx2) => (
                          <Box key={idx2} sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                            <Chip
                              label={item.category}
                              sx={{
                                background: '#e3eafd',
                                color: '#1976d2',
                                fontWeight: 500,
                                fontSize: 14,
                                borderRadius: 4,
                                width: 'fit-content',
                                mb: 0.5
                              }}
                              size="small"
                            />
                            <Typography sx={{
                              color: '#38404a',
                              fontSize: 15,
                              fontWeight: 500,
                              // display: '-webkit-box',
                              // WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '100%',
                              wordBreak: 'break-word',
                            }}>
                              {item.summary}
                            </Typography>
                          </Box>
                        ))
                        :  
                        <Typography sx={{ color: '#38404a', fontSize: 15, fontWeight: 500 }}>
                          -
                        </Typography>
                    }
                    </Box>
                    {/* View/Download */}
                    <Box className="table-col" sx={{ width: 45, minWidth: 45, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', border: '1px solid #d8dce1', borderRadius: 3 }}>
                      <a href={insp.firebaseUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                        <IconButton>
                          <RemoveRedEyeOutlinedIcon />
                        </IconButton>
                      </a>
                    </Box>
                  </>
                )}
              </Box>
              )
            })}
          </Card>
        </>)
      :
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
          <Typography variant={isMobile ? "h6" : "h6"} sx={{ 
            fontWeight: 700, 
            mb: 1, 
            textAlign: 'center',
            fontSize: { xs: '16px', sm: '18px', md: '20px' }
          }}>
          Select a Company or FEI Number to Begin Analysis
          </Typography>
          <Typography sx={{ 
            color: '#5c6470', 
            textAlign: 'center',
            fontSize: { xs: '14px', sm: '16px' }
          }}>
          Use the filters above to analyze FDA 483 trends.
          </Typography>
        </Card>
      }
    </Box>
  );
};

export default Browse; 