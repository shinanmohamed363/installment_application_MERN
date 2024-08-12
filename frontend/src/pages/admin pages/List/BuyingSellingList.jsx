import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { Modal } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { mainListItems, secondaryListItems } from "../listItems";
import { Backdrop, Fade } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import "bootstrap/dist/css/bootstrap.min.css";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const mdTheme = createTheme();
const BuyingSellingList = () => {
  let date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1; // JavaScript months are 0-based counting
  let year = date.getFullYear();
  let hours = date.getHours();
  let minutes = date.getMinutes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [originalData, setOriginalData] = useState([]);
  const [data, setData] = useState([]);
  const [deviceName, setDeviceName] = useState("");
  const [emiNumber, setemiNumber] = useState("");
  const [customerName, setcustomerName] = useState("");
  const [civilID, setcivilID] = useState("");
  const [price, setprice] = useState("");
  const [months, setmonths] = useState("");
  const [advance, setadvance] = useState("");
  const [balance, setbalance] = useState("");
  const [salesDateFrom, setsalesDateFrom] = useState(null);
  const [salesDateTo, setsalesDateTo] = useState(null);

  useEffect(() => {
    const fetchSellingData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/selling/getSelling",
          { method: "GET" }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const sellingData = await response.json();

        // Fetch inventory data
        const inventoryResponse = await fetch(
          "http://localhost:8000/inventory/getInventory",
          { method: "GET" }
        );
        if (!inventoryResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const inventoryData = await inventoryResponse.json();

        // Merge sellingData with inventoryData
        const mergedData = sellingData.map((sellingItem) => {
          const inventoryItem = inventoryData.find(
            (item) => item.emiNumber === sellingItem.emiNumber
          );
          const totalPaid =
            parseFloat(sellingItem.advance) +
            sellingItem.customArray
              .filter((payment) => payment.status === "paid")
              .reduce((sum, payment) => sum + parseFloat(payment.price), 0);

          let totalPayableBalance = sellingItem.customArray
            .filter((payment) => payment.status === "unpaid")
            .reduce((sum, payment) => sum + parseFloat(payment.price), 0);

          totalPayableBalance = Math.round(totalPayableBalance);

          const purchasePrice = inventoryItem
            ? parseFloat(inventoryItem.price)
            : 0;
          const sellingPrice = parseFloat(sellingItem.price);
          const profit = sellingPrice - purchasePrice;

          return {
            ...sellingItem,
            totalPaid,
            purchasePrice,
            profit,
            totalPayableBalance,
          };
        });

        setOriginalData(mergedData);
        setData(mergedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchSellingData();
  }, []);

  const downloadExcel = () => {
    // Create a copy of the data with the totalPaid calculated
    const updatedData = data.map((item) => {
      const totalPaid =
        parseFloat(item.advance) +
        item.customArray
          .filter((payment) => payment.status === "paid")
          .reduce((sum, payment) => sum + parseFloat(payment.price), 0);

      // Create a new object excluding 'advance' and including 'totalPaid'
      const { advance, ...rest } = item;
      return { ...rest, totalPaid: totalPaid.toFixed(2) };
    });
    console.log(updatedData);
    fetch("http://localhost:8000/api/byingSellingExcel/byingSellingExcel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData), // Send the updated data to the backend
    })
      .then((response) => {
        if (response.ok) {
          return response.blob(); // If the response is OK, get the Excel blob
        } else {
          throw new Error("Error converting to Excel");
        }
      })
      .then((blob) => {
        // Create a blob URL
        const url = window.URL.createObjectURL(blob);
        // Create a link element
        const link = document.createElement("a");
        link.href = url;
        let formattedDateTime = `${day}/${month}/${year}, ${hours}:${minutes}`;
        link.download = `Bying And Selling Report - ${formattedDateTime}.xlsx`;
        // Append the link to the body
        document.body.appendChild(link);
        // Simulate click
        link.click();
        // Remove the link when done
        document.body.removeChild(link);
      })
      .catch((error) => alert(error));
  };

  const resetTable = () => {
    Promise.all([
      fetch("http://localhost:8000/selling/getSelling", { method: "GET" }),
      fetch("http://localhost:8000/inventory/getInventory", { method: "GET" }),
    ])
      .then(async ([sellingResponse, inventoryResponse]) => {
        if (!sellingResponse.ok || !inventoryResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const sellingData = await sellingResponse.json();
        const inventoryData = await inventoryResponse.json();

        // Merge sellingData with inventoryData
        const mergedData = sellingData.map((sellingItem) => {
          const inventoryItem = inventoryData.find(
            (item) => item.emiNumber === sellingItem.emiNumber
          );
          const totalPaid =
            parseFloat(sellingItem.advance) +
            sellingItem.customArray
              .filter((payment) => payment.status === "paid")
              .reduce((sum, payment) => sum + parseFloat(payment.price), 0);

          let totalPayableBalance = sellingItem.customArray
            .filter((payment) => payment.status === "unpaid")
            .reduce((sum, payment) => sum + parseFloat(payment.price), 0);

          totalPayableBalance = Math.round(totalPayableBalance);

          const purchasePrice = inventoryItem
            ? parseFloat(inventoryItem.price)
            : 0;
          const sellingPrice = parseFloat(sellingItem.price);
          const profit = sellingPrice - purchasePrice;

          return {
            ...sellingItem,
            totalPayableBalance,
            totalPaid,
            purchasePrice,
            profit,
          };
        });

        setOriginalData(mergedData);
        setData(mergedData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error accordingly
      });
  };

  const handleFetch = () => {
    let filteredData = originalData.filter((item) => {
      const itemsalesDate = new Date(item.date); // Convert item date to Date object

      let fromDate = salesDateFrom ? new Date(salesDateFrom) : null;
      let toDate = salesDateTo ? new Date(salesDateTo) : null;

      // Adjust the time of fromDate and toDate to consider the whole day
      if (fromDate) fromDate.setHours(0, 0, 0, 0);
      if (toDate) toDate.setHours(23, 59, 59, 999);

      return (
        (deviceName === "" || item.deviceName.includes(deviceName)) &&
        (emiNumber === "" || item.emiNumber === emiNumber) &&
        (customerName === "" || item.customerName.includes(customerName)) &&
        (civilID === "" || item.civilID === civilID) &&
        (price === "" || item.price.includes(price)) &&
        (months === "" || item.months.includes(months)) &&
        (advance === "" || item.advance.includes(advance)) &&
        (balance === "" || item.balance.includes(balance)) &&
        (!fromDate || itemsalesDate >= fromDate) &&
        (!toDate || itemsalesDate <= toDate)
      );
    });

    setData(filteredData);

    // Clear all fields after fetch
    setDeviceName("");
    setemiNumber("");
    setcustomerName("");
    setcivilID("");
    setprice("");
    setmonths("");
    setadvance("");
    setbalance("");
    setsalesDateFrom(null); // Set to null to clear the date picker
    setsalesDateTo(null); // Set to null to clear the date picker
  };
  const downloadOverallPDF = (id, civil_id) => {
    console.log(id, civil_id);

    fetch("http://localhost:8000/convertToOverAllPaymentInvoicePDF", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        civil_id: civil_id,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.blob(); // If the response is OK, get the PDF blob
        } else {
          throw new Error("Error converting to PDF");
        }
      })
      .then((blob) => {
        // Create a blob URL
        const url = window.URL.createObjectURL(blob);
        // Create a link element
        const link = document.createElement("a");
        link.href = url;
        // The downloaded file name
        link.download = "Over_All_Bill.pdf";
        // Append the link to the body
        document.body.appendChild(link);
        // Simulate click
        link.click();
        // Remove the link when done
        document.body.removeChild(link);
      })
      .catch((error) => alert(error));
  };
  const downloadPDF = () => {
    // Create a copy of the data with the totalPaid calculated
    const updatedData = data.map((item) => {
      const totalPaid =
        parseFloat(item.advance) +
        item.customArray
          .filter((payment) => payment.status === "paid")
          .reduce((sum, payment) => sum + parseFloat(payment.price), 0);

      // Create a new object excluding 'advance' and including 'totalPaid'
      const { advance, ...rest } = item;
      return { ...rest, totalPaid: totalPaid.toFixed(2) };
    });
    console.log(updatedData);

    fetch(
      "http://localhost:8000/api/buyingSellingpdf/convertTobuyingSellingPDF",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData), // Send the updated data to the backend
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.blob(); // If the response is OK, get the PDF blob
        } else {
          throw new Error("Error converting to PDF");
        }
      })
      .then((blob) => {
        // Create a blob URL
        const url = window.URL.createObjectURL(blob);
        // Create a link element
        const link = document.createElement("a");
        link.href = url;

        const date = new Date();
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const formattedDateTime = `${day}/${month}/${year}, ${hours}:${minutes}`;

        link.download = `Buying_and_Selling_Report_${formattedDateTime}.pdf`;
        // Append the link to the body
        document.body.appendChild(link);
        // Simulate click
        link.click();
        // Remove the link when done
        document.body.removeChild(link);
      })
      .catch((error) => alert(error));
  };

  const downloadMonthendPDF = () => {
    // Get the current date
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Filter data for the current month
    const filteredData = data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startOfMonth && itemDate <= endOfMonth;
    });

    // Create a copy of the filtered data with the totalPaid calculated
    const updatedData = filteredData.map((item) => {
      const totalPaid =
        parseFloat(item.advance) +
        item.customArray
          .filter((payment) => payment.status === "paid")
          .reduce((sum, payment) => sum + parseFloat(payment.price), 0);

      // Create a new object excluding 'advance' and including 'totalPaid'
      const { advance, ...rest } = item;
      return { ...rest, totalPaid: totalPaid.toFixed(2) };
    });

    console.log(updatedData);

    fetch(
      "http://localhost:8000/api/buyingSellingpdf/convertTobuyingSellingPDF",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData), // Send the updated data to the backend
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.blob(); // If the response is OK, get the PDF blob
        } else {
          throw new Error("Error converting to PDF");
        }
      })
      .then((blob) => {
        // Create a blob URL
        const url = window.URL.createObjectURL(blob);
        // Create a link element
        const link = document.createElement("a");
        link.href = url;

        const date = new Date();
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const formattedDateTime = `${day}/${month}/${year}, ${hours}:${minutes}`;

        link.download = `Buying_and_Selling_Report_${formattedDateTime}.pdf`;
        // Append the link to the body
        document.body.appendChild(link);
        // Simulate click
        link.click();
        // Remove the link when done
        document.body.removeChild(link);
      })
      .catch((error) => alert(error));
  };

  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <ThemeProvider theme={mdTheme}>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <AppBar
            sx={{ backgroundColor: "white", color: "#637381" }}
            position="absolute"
            open={open}
          >
            <Toolbar
              sx={{
                pr: "24px", // keep right padding when drawer closed
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{
                  marginRight: "36px",
                  ...(open && { display: "none" }),
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
                  background: "linear-gradient(90deg, #C63DE7, #752888)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "Public Sans, sans-serif",
                  fontWeight: "bold",
                }}
              >
                SMARTCO
              </Typography>
              <IconButton color="inherit">
                <Badge badgeContent={4} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer variant="permanent" open={open}>
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
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
                theme.palette.mode === "light"
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              flexGrow: 1,
              height: "100vh",
              overflow: "auto",
            }}
          >
            <Toolbar />
            <Container>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: 4,
                  padding: 3,
                  backgroundColor: "#fff",
                  borderRadius: 1,
                  boxShadow: 3,
                  maxWidth: 1000, // Adjust the maxWidth as needed
                  width: "100%",
                  mx: "auto", // Center the box
                }}
              >
                <Typography
                  component="h1"
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontFamily: "Public Sans, sans-serif",
                    fontWeight: "bold",
                    color: "#637381",
                  }}
                >
                  Sales List
                </Typography>
                <Box component="form" sx={{ mt: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        margin="normal"
                        fullWidth
                        label="Device Name"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        margin="normal"
                        fullWidth
                        label="emiNumber"
                        value={emiNumber}
                        onChange={(e) => setemiNumber(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        margin="normal"
                        fullWidth
                        label="customerName"
                        value={customerName}
                        onChange={(e) => setcustomerName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        margin="normal"
                        fullWidth
                        label="civilID"
                        value={civilID}
                        onChange={(e) => setcivilID(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        margin="normal"
                        fullWidth
                        label="price"
                        value={price}
                        onChange={(e) => setprice(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        margin="normal"
                        fullWidth
                        label="months"
                        value={months}
                        onChange={(e) => setmonths(e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3} style={{ marginTop: "16px" }}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          fullWidth
                          label="sales Date From"
                          value={salesDateFrom}
                          onChange={(date) => setsalesDateFrom(date)}
                          style={{ marginTop: "20px" }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={3} style={{ marginTop: "16px" }}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          fullWidth
                          label="sales Date To"
                          value={salesDateTo}
                          onChange={(date) => setsalesDateTo(date)}
                          style={{ marginTop: "20px" }}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>

                  <Grid
                    container
                    spacing={2}
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Grid item xs={12} sm={3}>
                      <Button
                        onClick={handleFetch}
                        fullWidth
                        variant="contained"
                        sx={{
                          mt: 3,
                          mb: 2,
                          backgroundColor: "#752888",
                          "&:hover": {
                            backgroundColor: "#C63DE7",
                          },
                          fontFamily: "Public Sans, sans-serif",
                          fontWeight: "bold",
                        }}
                      >
                        Fetch
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Button
                        onClick={resetTable}
                        fullWidth
                        variant="contained"
                        sx={{
                          mt: 3,
                          mb: 2,
                          backgroundColor: "#752888",
                          "&:hover": {
                            backgroundColor: "#C63DE7",
                          },
                          fontFamily: "Public Sans, sans-serif",
                          fontWeight: "bold",
                        }}
                      >
                        Reset
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Button
                        onClick={downloadPDF}
                        fullWidth
                        variant="contained"
                        sx={{
                          mt: 3,
                          mb: 2,
                          backgroundColor: "#752888",
                          "&:hover": {
                            backgroundColor: "#C63DE7",
                          },
                          fontFamily: "Public Sans, sans-serif",
                          fontWeight: "bold",
                        }}
                      >
                        Download PDF
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Button
                        onClick={downloadMonthendPDF}
                        fullWidth
                        variant="contained"
                        sx={{
                          mt: 3,
                          mb: 2,
                          backgroundColor: "#752888",
                          "&:hover": {
                            backgroundColor: "#C63DE7",
                          },
                          fontFamily: "Public Sans, sans-serif",
                          fontWeight: "bold",
                        }}
                      >
                        Month-End PDF
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Button
                        onClick={downloadExcel}
                        fullWidth
                        variant="contained"
                        sx={{
                          mt: 3,
                          mb: 2,
                          backgroundColor: "#752888",
                          "&:hover": {
                            backgroundColor: "#C63DE7",
                          },
                          fontFamily: "Public Sans, sans-serif",
                          fontWeight: "bold",
                        }}
                      >
                        Download Excel
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Container>

            <Grid container>
              <Grid item xs={12}>
                <Box
                  sx={{
                    mt: 6,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: 4,
                    padding: 3,
                    backgroundColor: "#fff",
                    borderRadius: 1,
                    boxShadow: 3,
                    maxWidth: 1500, // Adjust this value as needed
                    flexGrow: 1,
                    mx: "auto",
                  }}
                >
                  <TableContainer
                    component={Paper}
                    sx={{ width: "100%", overflowX: "auto" }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            style={{
                              backgroundColor: "#752888",
                              color: "white",
                            }}
                          >
                            Device Name
                          </TableCell>

                          <TableCell
                            style={{
                              backgroundColor: "#752888",
                              color: "white",
                            }}
                          >
                            Emi Number{" "}
                          </TableCell>
                          <TableCell
                            style={{
                              backgroundColor: "#752888",
                              color: "white",
                            }}
                          >
                            CustomerName{" "}
                          </TableCell>
                          <TableCell
                            style={{
                              backgroundColor: "#752888",
                              color: "white",
                            }}
                          >
                            CivilID
                          </TableCell>

                          <TableCell
                            style={{
                              backgroundColor: "#752888",
                              color: "white",
                            }}
                          >
                            Months
                          </TableCell>
                          <TableCell
                            style={{
                              backgroundColor: "#752888",
                              color: "white",
                            }}
                          >
                            Date
                          </TableCell>
                          <TableCell
                            style={{
                              backgroundColor: "#752888",
                              color: "white",
                            }}
                          >
                            Selling Price
                          </TableCell>
                          <TableCell
                            style={{
                              backgroundColor: "#752888",
                              color: "white",
                            }}
                          >
                            Purchase Price
                          </TableCell>
                          <TableCell
                            style={{
                              backgroundColor: "#752888",
                              color: "white",
                            }}
                          >
                            Total Paid
                          </TableCell>
                          <TableCell
                            style={{
                              backgroundColor: "#752888",
                              color: "white",
                            }}
                          >
                            Total Receivable
                          </TableCell>
                          <TableCell
                            style={{
                              backgroundColor: "#752888",
                              color: "white",
                            }}
                          >
                            Device Profit
                          </TableCell>
                          <TableCell
                            style={{
                              backgroundColor: "#752888",
                              color: "white",
                            }}
                          >
                            Generate PDF
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.length > 0 &&
                          data.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.deviceName}</TableCell>
                              <TableCell>{item.emiNumber}</TableCell>
                              <TableCell>{item.customerName}</TableCell>
                              <TableCell>{item.civilID}</TableCell>
                              <TableCell>{item.months}</TableCell>
                              <TableCell>{item.date}</TableCell>
                              <TableCell>{item.price}</TableCell>
                              <TableCell>{item.purchasePrice}</TableCell>
                              <TableCell>{item.totalPaid}</TableCell>
                              <TableCell>{item.totalPayableBalance}</TableCell>
                              <TableCell>{item.profit}</TableCell>
                              <TableCell>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() =>
                                    downloadOverallPDF(item._id, item.civilID)
                                  }
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {/* Modal */}
                  <Modal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    aria-labelledby="modal-title"
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{
                      timeout: 500,
                    }}
                  >
                    <Fade in={isModalOpen}>
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "80%",
                          maxWidth: 400,
                          bgcolor: "white",
                          boxShadow: 24,
                          p: 2,
                          borderRadius: 4,
                          overflowY: "auto", // Enable scroll bar for large data
                        }}
                      >
                        <IconButton
                          aria-label="close"
                          onClick={handleCloseModal}
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                          }}
                        >
                          <CloseIcon />
                        </IconButton>

                        <Typography
                          variant="h6"
                          component="h2"
                          id="modal-title"
                        >
                          {selectedRow?.deviceName}
                        </Typography>

                        {/* Display other details from selectedRow */}
                        <TableContainer component={Paper}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Total Amount</TableCell>
                                <TableCell>Advance Amount</TableCell>
                                <TableCell>Balance</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>{selectedRow?.price}</TableCell>
                                <TableCell>{selectedRow?.advance}</TableCell>
                                <TableCell>{selectedRow?.balance}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>

                        <Typography
                          variant="h6"
                          component="h2"
                          id="modal-title"
                        >
                          Installment
                        </Typography>
                        <TableContainer component={Paper}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedRow?.customArray.map((item) => (
                                <TableRow key={item._id.$oid}>
                                  <TableCell>{item.date}</TableCell>
                                  <TableCell>{item.price}</TableCell>
                                  <TableCell>{item.status}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Fade>
                  </Modal>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </ThemeProvider>
    </div>
  );
};
export default BuyingSellingList;
