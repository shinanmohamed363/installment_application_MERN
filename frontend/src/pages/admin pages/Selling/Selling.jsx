import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { mainListItems, secondaryListItems } from '../listItems';
import {
  TextField, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { Link, useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const mdTheme = createTheme();

export default function Selling() {

  const navigate = useNavigate();

  const [open, setOpen] = useState(true);
  const [sellings, setSellings] = useState([]);
  const [deviceName, setDeviceName] = useState('');
  const [emiNumber, setEmiNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [civilID, setCivilID] = useState('');
  const [price, setPrice] = useState('');
  const [months, setMonths] = useState('');
  const [date, setDate] = useState('');
  const [advance, setAdvance] = useState('');
  const [imageName, setImageName] = useState('');
  const [devices, setDevices] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchSellings();
  }, []);

  const handleLogout = () => {
    // Remove user details from session storage
    sessionStorage.removeItem('user');
sessionStorage.removeItem('token');
    console.log('User details cleared from session storage');
    navigate('/');
  };

  useEffect(() => {
    if (emiNumber) {
      fetchDeviceImage();
    }
  }, [emiNumber]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const fetchSellings = async () => {
    try {
      const response = await axios.get('http://podsaas.online/selling/getSelling');
      setSellings(response.data);
    } catch (error) {
      console.error('Error fetching sellings:', error);
    }
  };
  

  const fetchDeviceImage = async () => {
    try {
      const response = await axios.get(`http://podsaas.online/device/getOneDevice/${emiNumber}`);
      setDevices(response.data);
      if (response.data.length > 0) {
        setImageName(response.data[0].imageName); // Assuming you want to set the first device's imageName by default
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://podsaas.online/selling/deleteSelling/${id}`);
      alert("Selling record deleted successfully");
      fetchSellings(); // Refresh the selling list after deletion
    } catch (error) {
      console.error('Error deleting selling:', error);
      alert("An error occurred while deleting the selling record.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const dealendSubmit = async (id,deviceName,
    emiNumber,
    customerName,
    civilID,
    price,
    months,
    date,
    advance,
    imageName) => { 

      const DealendPurchase = {
        deviceName,
        emiNumber,
        customerName,
        civilID,
        price,
        months,
        date,
        advance,
        imageName
      };

      try {
        await axios.post('http://localhost:8000/dealend/addDealend', DealendPurchase);
        await axios.delete(`http://localhost:8000/selling/deleteSelling/${id}`);
        alert("Deal ended successfully");
        fetchSellings();
        
      } catch (error) {
        console.error(error.response ? error.response.data : error);
        alert("An error occurred while adding the item to the stores.");
        
      }

  }

  const handleConfirmSubmit = async () => {
    // Check if imageName is set
    if (!imageName) {
      alert("Image name is required. Please check the EMI Number.");
      return;
    }

    const NewPurchase = {
      deviceName,
      emiNumber,
      customerName,
      civilID,
      price,
      months,
      date,
      advance,
      imageName
    };

    try {
      await axios.post('http://localhost:8000/selling/addSelling', NewPurchase);
      await axios.delete(`http://podsaas.online/device/deleteDeviceemi/${NewPurchase.emiNumber}`);
      alert("New customer device purchased");
      fetchSellings(); // Refresh the selling list after submission
      handleDialogClose();
    } catch (err) {
      console.error(err.response ? err.response.data : err);
      alert("An error occurred while adding the item to the stores.");
      handleDialogClose();
    }
  };

  return (
    <div>
      <ThemeProvider theme={mdTheme}>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <AppBar sx={{ backgroundColor: 'white', color: '#637381' }} position="absolute" open={open}>
            <Toolbar sx={{ pr: '24px' }}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{
                  marginRight: '36px',
                  ...(open && { display: 'none' }),
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                component="h1"
                variant="h6"
                noWrap
                sx={{
                  flexGrow: 1,
                  background: 'linear-gradient(90deg, #C63DE7, #752888)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'Public Sans, sans-serif',
                  fontWeight: 'bold',
                }}
              >
                SMARTCO
              </Typography>
              <IconButton color="inherit" onClick={handleLogout}>
              <Badge color="secondary">
                <LogoutIcon />
              </Badge>
            </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer variant="permanent" open={open}>
            <Toolbar
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                px: [1],
              }}
            >
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav">
              {mainListItems}
              <Divider sx={{ my: 1 }} />
              {secondaryListItems}
            </List>
          </Drawer>
          <Box
            component="main"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
              flexGrow: 1,
              height: '100vh',
              overflow: 'auto',
            }}
          >
            <Toolbar />
            <Container>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: 4,
                  padding: 3,
                  backgroundColor: '#fff',
                  borderRadius: 1,
                  boxShadow: 3,
                  maxWidth: 500,
                  width: '100%',
                  mx: 'auto',
                }}
              >
                <Typography component="h1" variant="h5" gutterBottom sx={{ fontFamily: 'Public Sans, sans-serif', fontWeight: 'bold', color: "#637381" }}>
                  Selling Details
                </Typography>
                <Box component="form" sx={{ mt: 1 }} onSubmit={handleSubmit}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Device Name"
                    name="deviceName"
                    onChange={(e) => {
                      setDeviceName(e.target.value);
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="EMI Number"
                    name="emiNumber"
                    onChange={(e) => {
                      setEmiNumber(e.target.value);
                      setImageName(''); // Reset imageName when emiNumber changes
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Customer Name"
                    name="customerName"
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Civil ID"
                    name="civilID"
                    onChange={(e) => {
                      setCivilID(e.target.value);
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Price"
                    name="price"
                    onChange={(e) => {
                      setPrice(e.target.value);
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Months"
                    name="months"
                    onChange={(e) => {
                      setMonths(e.target.value);
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Date"
                    name="date"
                    type="date"
                    InputLabelProps={{ shrink: true }} // Ensure label does not overlap with date input
                    onChange={(e) => {
                      setDate(e.target.value);
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Advance"
                    name="advance"
                    onChange={(e) => {
                      setAdvance(e.target.value);
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 3,
                      mb: 2,
                      backgroundColor: '#752888',
                      '&:hover': {
                        backgroundColor: '#C63DE7',
                      },
                      fontFamily: 'Public Sans, sans-serif',
                      fontWeight: 'bold',
                    }}
                  >
                    Submit
                  </Button>
                </Box>
              </Box>

              {/* Table Section */}
              <Box sx={{ 
       mt: 6,
       display: 'flex',
       flexDirection: 'column',
       alignItems: 'center',
       marginTop: 4,
       padding: 3,
       backgroundColor: '#fff',
       borderRadius: 1,
       boxShadow: 3,
       maxWidth: 1500, // Adjust this value as needed
       flexGrow: 1,
       mx: 'auto',  
    }}>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Device Name</TableCell>
                        <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Emi Number</TableCell>
                        <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Customer Name</TableCell>
                        <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Civil ID</TableCell>
                        <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Price</TableCell>
                        <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Months</TableCell>
                        <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Date</TableCell>
                        <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Advance</TableCell>
                        <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Balance</TableCell>
                        <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sellings.slice().reverse().map((selling) => (
                        <TableRow key={selling._id}>
                          <TableCell>{selling.deviceName}</TableCell>
                          <TableCell>{selling.emiNumber}</TableCell>
                          <TableCell>{selling.customerName}</TableCell>
                          <TableCell>{selling.civilID}</TableCell>
                          <TableCell>{selling.price}</TableCell>
                          <TableCell>{selling.months}</TableCell>
                          <TableCell>{selling.date}</TableCell>
                          <TableCell>{selling.advance}</TableCell>
                          <TableCell>{selling.balance}</TableCell>
                          <TableCell>
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <IconButton color="secondary" onClick={() => handleDelete(selling._id)}>
      <DeleteIcon />
    </IconButton>
    <Button
      sx={{
        ml: 2, // Add some left margin to space the button away from the icon
        mt: 3,
        mb: 2,
        backgroundColor: '#752888',
        '&:hover': {
          backgroundColor: '#C63DE7',
        },
        color: 'white',
        fontFamily: 'Public Sans, sans-serif',
        fontWeight: 'bold',
      }}
      onClick={() => dealendSubmit(selling._id, selling.deviceName, selling.emiNumber, selling.customerName, selling.civilID, selling.price, selling.months, selling.date, selling.advance, selling.imageName)}
    >
      Dealend
    </Button>
  </Box>
</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Container>
          </Box>
        </Box>
      </ThemeProvider>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Confirm Selling Details</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please confirm the following details before submitting:
          </DialogContentText>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Device Name:</TableCell>
                <TableCell>{deviceName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>EMI Number:</TableCell>
                <TableCell>{emiNumber}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Customer Name:</TableCell>
                <TableCell>{customerName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Civil ID:</TableCell>
                <TableCell>{civilID}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Price:</TableCell>
                <TableCell>{price}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Months:</TableCell>
                <TableCell>{months}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Date:</TableCell>
                <TableCell>{date}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Advance:</TableCell>
                <TableCell>{advance}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary" sx={{
                      mt: 3,
                      mb: 2,
                      backgroundColor: '#FF2727',
                      '&:hover': {
                        backgroundColor: '#FF4646',
                      },
                      fontFamily: 'Public Sans, sans-serif',
                      fontWeight: 'bold',
                      color: 'white',
                    }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmSubmit} color="primary" sx={{
                      mt: 3,
                      mb: 2,
                      backgroundColor: '#752888',
                      '&:hover': {
                        backgroundColor: '#C63DE7',
                      },
                      fontFamily: 'Public Sans, sans-serif',
                      fontWeight: 'bold',
                      color: 'white',
                    }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
