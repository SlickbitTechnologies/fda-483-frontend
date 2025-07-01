import React, {useState, useEffect, useMemo} from 'react';
import { Box, Typography, Card, TextField, InputAdornment, MenuItem, Select, FormControl, Chip, IconButton, Divider, Autocomplete, CircularProgress } from '@mui/material';
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

  console.log(documents, 'documentsdocumentsdocuments')

  const fetchResult = async () => {
    setLoading(true);
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


  const downloadPdf = (url, fileName = 'document.pdf') => {
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', fileName); // triggers download instead of view
    a.setAttribute('target', '_blank');   // fallback
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#f7f9fb', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4, marginBottom: 2 }}>
      {loading && (
          <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(12, 12, 12, 0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
      )}
      <Card sx={{ width: '80%', p: 4, mb: 4, borderRadius: 3, boxShadow: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Filter FDA 483 Inspections</Typography>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Box sx={{ flex: 2, minWidth: 220 }}>
            <Typography sx={{ fontWeight: 500, mb: 1 }}>Search</Typography>
            <TextField
              fullWidth
              placeholder="Search by company, FEI, Record ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon sx={{ color: '#b3a9a9' }} />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ background: '#FFF', borderRadius: 2 }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 180 }}>
            <Typography sx={{ fontWeight: 500, mb: 1 }}>Company</Typography>
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
          <Box sx={{ flex: 1, minWidth: 180 }}>
            <Typography sx={{ fontWeight: 500, mb: 1 }}>FEI Number</Typography>
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
          <Box sx={{ flex: 1, minWidth: 180 }}>
            <Typography sx={{ fontWeight: 500, mb: 1 }}>Sort By</Typography>
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
          <Box sx={{ width: '84%', mb: 2, display: 'flex', alignItems: 'center', fontWeight: 500 }}>
            <Typography sx={{ color: '#38404a', fontWeight: 600, fontSize: 16 }}>
              {filteredDocuments.length} FDA 483 inspections found
            </Typography>
            <Typography sx={{ color: '#38404a', fontWeight: 500, fontSize: 16, mx: 2 }}>
              &bull;
            </Typography>
            <Typography sx={{ color: '#38404a', fontWeight: 500, fontSize: 16 }}>
              {filteredDocuments.length} total observations
            </Typography>
          </Box>
          <Card sx={{ width: '80%', p: 4, borderRadius: 3, boxShadow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>FDA 483 Inspections</Typography>
            {/* Table Header */}
            <Box sx={{ display: 'flex', px: 1, pb: 1, color: '#7a7a7a', fontWeight: 600, fontSize: 16 }}>
              <Box sx={{ flex: 1.2 }}>Inspection Date</Box>
              <Box sx={{ flex: 1.5 }}>Company</Box>
              <Box sx={{ flex: 1 }}>FEI Number</Box>
              <Box sx={{ flex: 3 }}>Key Findings</Box>
              <Box sx={{ width: 60, textAlign: 'center' }}>View</Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {/* Table Rows */}
            {filteredDocuments.map((insp, idx) => {
              const inspectionDate = new Date(insp.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
              return (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', px: 1, py: 1, borderBottom: idx !== filteredDocuments.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                {/* Inspection Date */}
                <Box sx={{ flex: 1.2 }}>
                  <Typography sx={{ fontWeight: 500, fontSize: 14 }}>{inspectionDate}</Typography>
                  {/* <Typography sx={{ color: '#7a7a7a', fontSize: 14 }}>{insp.companyDetail.split('\n')[0]}</Typography> */}
                </Box>
                {/* Company */}
                <Box sx={{ flex: 1.5 }}>
                  <Typography sx={{ fontWeight: 500, fontSize: 14 }}>{insp.name}</Typography>
                  {/* <Typography sx={{ color: '#7a7a7a', fontSize: 14 }}>{insp.companyDetail.split('\n')[1]}</Typography> */}
                </Box>
                {/* FEI Number */}
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', height: '100%' }}>
                  <Box sx={{ background: '#f5f7fa', color: '#222', borderRadius: 1, px: 2, py: 0.5, fontWeight: 500, fontSize: 14, display: 'inline-block' }}>
                    {insp.fei_number ? insp.fei_number : 'N/A'}
                  </Box>
                </Box>
                {/* Key Findings */}
                <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {insp.summary ? <Box>
                    <Chip
                      label={insp.category}
                      sx={{
                        background: '#e3eafd',
                        color: '#1976d2',
                        fontWeight: 500,
                        fontSize: 14,
                        borderRadius: 4,
                        width: 'fit-content',
                      }}
                      size="small"
                    />
                    <Typography sx={{
                      color: '#38404a',
                      fontSize: 15,
                      fontWeight: 500,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '90%',
                    }}>
                      {insp.summary}
                    </Typography>
                  </Box>
                  :  
                  <Box>
                    <Typography sx={{ color: '#38404a', fontSize: 15, fontWeight: 500 }}>
                      -
                    </Typography>
                  </Box>
                }
                </Box>
                {/* View/Download */}
                <Box sx={{ width: 45, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', border: '1px solid #d8dce1', borderRadius: 3 }}>
                  <IconButton onClick={() => downloadPdf(insp.url, insp.name)}>
                    <RemoveRedEyeOutlinedIcon />
                  </IconButton>
                </Box>
              </Box>
              )
            })}
          </Card>
        </>)
      :
        <Card sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3, boxShadow: 1, width: '80%', ml: 0, mr: 0 }}>
          <InsertDriveFileOutlinedIcon sx={{ fontSize: 56, color: '#8a94a6', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
          Select a Company or FEI Number to Begin Analysis
          </Typography>
          <Typography sx={{ color: '#5c6470', textAlign: 'center' }}>
          Use the filters above to analyze FDA 483 trends.
          </Typography>
        </Card>
      }
    </Box>
  );
};

export default Browse; 