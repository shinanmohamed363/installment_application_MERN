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
import { Link, useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';

import {
  TextField, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

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

export default function Device(){

    const navigate = useNavigate();


  const user = JSON.parse(sessionStorage.getItem('user'));

  if (user) {
    const role = user.role;
    console.log('Role:', role);
    
  } else {
    console.log('No user data found in session storage');
  }

  // Check if the user's role is "superadmin"
  if (!user || user.role !== "superadmin") {
    navigate('/not-authorized');
  }

    const [open, setOpen] = React.useState(true);
    const [devices, setDevices] = useState([]);
    const [form, setForm] = useState({
        deviceName: '',
        price: '',
        color: '',
        shopName: '',
        modelNumber: '',
        storage: '',
        ram:'',
        warrenty: '',
        emiNumber: '',
        purchaseDate: '',
        imageName: ''
    });

    const handleDelete = async (id) => {
        try {
          await axios.delete(`http://podsaas.online/device/deleteDevice/${id}`);
          alert("Dervice record deleted successfully");
          fetchDevices();// Refresh the selling list after deletion
        } catch (error) {
          console.error('Error deleting selling:', error);
          alert("An error occurred while deleting the selling record.");
        }
      };

    useEffect(() => {
        fetchDevices();
    }, []);

    const handleLogout = () => {
        // Remove user details from session storage
        sessionStorage.removeItem('user');
sessionStorage.removeItem('token');
        console.log('User details cleared from session storage');
        navigate('/');
      };

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const fetchDevices = async () => {
        try {
            const response = await axios.get('http://podsaas.online/device/getDevice');
            setDevices(response.data);
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setForm({ ...form, [name]: value });
    };

    const handleFileChange = (event) => {
        setForm({ ...form, imageName: event.target.files[0]});
    };    

    const handleSubmit = async (event) => {
      event.preventDefault();
  
      console.log(form);
  
      const { emiNumber } = form; // Assuming 'emiNumber' is a key in your form data
  
      try {
          // Check if EMI number is available in the selling table
          const sellingResponse = await axios.get(`http://localhost:8000/selling/getbyEmi/${emiNumber}`);
  
          if (sellingResponse.data.message !== "data not available") {
              alert("This EMI number is already taken in the selling table.");
              return; // Stop the function execution
          } else {
              console.log("EMI number not found in the selling table.");
          }
      } catch (error) {
          console.error("Error checking EMI number in the selling table:", error);
          return; // Stop the function execution if there is a different error
      }
  
      try {
          // Check if EMI number is available in the device table
          const deviceResponse = await axios.get(`http://localhost:8000/device/getOneDevicebyemi/${emiNumber}`);
  
          if (deviceResponse.data.message !== "data not available") {
              alert("This EMI number is already taken in the device table.");
              return; // Stop the function execution
          } else {
              console.log("EMI number not found in the device table.");
          }
      } catch (error) {
          console.error("Error checking EMI number in the device table:", error);
          return; // Stop the function execution if there is a different error
      }
  
      const formData = new FormData();
      Object.keys(form).forEach(key => {
          formData.append(key, form[key]);
      });
      console.log(formData);
  
      try {
          // Add device to device table
          await axios.post('http://podsaas.online/device/addDevice', formData, {
              headers: {
                  'Content-Type': 'multipart/form-data'
              }
          });
          fetchDevices();
  
          // Add device to inventory table
          const inventoryData = {
              deviceName: form.deviceName,
              price: form.price,
              color: form.color,
              shopName: form.shopName,
              modelNumber: form.modelNumber,
              storage: form.storage,
              ram: form.ram,
              warrenty: form.warrenty,
              emiNumber: form.emiNumber,
              purchaseDate: form.purchaseDate,
          };
  
          await axios.post('http://localhost:8000/inventory/addInventory', inventoryData, {
              headers: {
                  'Content-Type': 'application/json'
              }
          });
          alert("New Device added successfully");
  
      } catch (error) {
          console.error('Error adding devices or inventory:', error);
      }
  };

    return(
        <div>
            <ThemeProvider theme={mdTheme}>
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline />
                    <AppBar sx={{backgroundColor: 'white', color: '#637381'}} position="absolute" open={open}>
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
                        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: [1], }}>
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
                                theme.palette.mode === 'light'
                                    ? theme.palette.grey[100]
                                    : theme.palette.grey[900],
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
                                <Typography component="h1" variant="h5" gutterBottom sx={{ fontFamily: 'Public Sans, sans-serif', fontWeight: 'bold', color:"#637381" }}>
                                    Device Details
                                </Typography>
                                <Box component="form" sx={{ mt: 1 }} onSubmit={handleSubmit}>
                                    <TextField margin="normal"
                                        required
                                        fullWidth
                                        label="Device Name"
                                        name="deviceName"
                                        value={form.deviceName}
                                        onChange={handleInputChange} />
                                    <TextField margin="normal"
                                        required
                                        fullWidth
                                        label="Price"
                                        name="price"
                                        value={form.price}
                                        onChange={handleInputChange} />
                                    <TextField margin="normal"
                                        required
                                        fullWidth
                                        label="Colour"
                                        name="color"
                                        value={form.color}
                                        onChange={handleInputChange} />
                                    <TextField margin="normal"
                                        required
                                        fullWidth
                                        label="Shop Name"
                                        name="shopName"
                                        value={form.shopName}
                                        onChange={handleInputChange} />
                                    <TextField margin="normal"
                                        required
                                        fullWidth
                                        label="Model Number"
                                        name="modelNumber"
                                        value={form.modelNumber}
                                        onChange={handleInputChange} />
                                    <TextField margin="normal"
                                        required
                                        fullWidth
                                        label="Storage"
                                        name="storage"
                                        value={form.storage}
                                        onChange={handleInputChange} />
                                    <TextField margin="normal"
                                        required
                                        fullWidth
                                        label="Ram"
                                        name="ram"
                                        value={form.ram}
                                        onChange={handleInputChange} />
                                    <TextField margin="normal"
                                        required
                                        fullWidth
                                        label="Warrenty"
                                        name="warrenty"
                                        value={form.warrenty}
                                        onChange={handleInputChange} />
                                    <TextField margin="normal"
                                        required
                                        fullWidth
                                        label="EMI Number"
                                        name="emiNumber"
                                        value={form.emiNumber}
                                        onChange={handleInputChange} />
                                    <TextField margin="normal"
                                        required
                                        fullWidth
                                        label="Purchase Date"
                                        type="date"
                                        name="purchaseDate"
                                        value={form.purchaseDate}
                                        onChange={handleInputChange} />
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        type="file"
                                        name="imageName"
                                        onChange={handleFileChange}
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
                                                <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Price</TableCell>
                                                <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Colour</TableCell>
                                                <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Shop Name</TableCell>
                                                <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Model Number</TableCell>
                                                <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Storage</TableCell>
                                                <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Ram</TableCell>
                                                <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Warrenty</TableCell>
                                                <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Emi Number</TableCell>
                                                <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Purchase Date</TableCell>
                                                <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Image Name</TableCell>
                                                <TableCell style={{ backgroundColor: '#752888', color: 'white' }} >Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {devices.slice().reverse().map((device) => (
                                                <TableRow key={device._id}>
                                                    <TableCell>{device.deviceName}</TableCell>
                                                    <TableCell>{device.price}</TableCell>
                                                    <TableCell>{device.color}</TableCell>
                                                    <TableCell>{device.shopName}</TableCell>
                                                    <TableCell>{device.modelNumber}</TableCell>
                                                    <TableCell>{device.storage}</TableCell>
                                                    <TableCell>{device.ram}</TableCell>
                                                    <TableCell>{device.warrenty}</TableCell>
                                                    <TableCell>{device.emiNumber}</TableCell>
                                                    <TableCell>{device.purchaseDate}</TableCell>
                                                    <TableCell>
        {device.imageName && (
          <img
            src={`${device.imageName}`}
            alt={device.deviceName}
            style={{ width: '100px', height: '100px' }}
          />
        )}
      </TableCell>
                                                    <TableCell>
                                                        <Link to={`updatedevice/${device.emiNumber}`}>
                                                        <IconButton color="primary">
                                                            <EditIcon />
                                                        </IconButton>
                                                        </Link>
                                                        <IconButton color="secondary" onClick={() => handleDelete(device._id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
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
        </div>
    )
}
