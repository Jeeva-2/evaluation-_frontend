import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SendIcon from '@mui/icons-material/Send';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
    '&.MuiBadge-standard': {
      backgroundColor: theme.palette.error.main,
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const SmallAvatar = styled(Avatar)(({ theme }) => ({
  width: 25,
  height: 25,
  border: `2px solid ${theme.palette.background.paper}`,
}));

const handleSendMail = async (id: string) => {
  try {
    const response = await fetch(`http://localhost:3100/send_mail_id?id=${id}`);

    if (response.ok) {
      toast.success('Mail sent successfully!');
    } else {
      const errorData = await response.json();
      toast.error('Error sending mail: ' + (errorData.message || errorData.error));
    }
  } catch (error) {
    toast.error('Unexpected error occurred while sending mail. Please try again later.');
  }
};

const handleExportData = async (id) => {
  try {
    const response = await fetch(`http://localhost:3100/export_pdf?id=${id}`);

    if (response.ok) {
      const pdfBlob = await response.blob(); // Get the response body as a Blob
      const url = window.URL.createObjectURL(pdfBlob); // Create a URL for the Blob
      const link = document.createElement('a');
      link.href = url; // Set the href attribute to the Blob URL
      link.download = `data_${id}.pdf`; // Set the download attribute to the desired filename
      document.body.appendChild(link);
      link.click(); // Trigger the click event to start the download
      document.body.removeChild(link); // Remove the anchor tag from the document body after the download
      window.URL.revokeObjectURL(url); // Release the object URL
      toast.success('Data exported successfully!');
    } else {
      const errorData = await response.json();
      toast.error('Error exporting data: ' + (errorData.message || errorData.error));
    }
  } catch (error) {
    toast.error('Unexpected error occurred while exporting data. Please try again later.');
  }
};
const columns: GridColDef[] = [
  {
    field: 'avatar',
    headerName: 'Avatar',
    width: 180,
    renderCell: (params) => (
      <Stack direction="row" spacing={2}>
        <StyledBadge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant={params.row.status === 'active' ? 'dot' : 'standard'}
        >
          <Avatar alt={params.row.name} src={params.row.image} />
        </StyledBadge>
      </Stack>
    ),
  },
  { field: 'name', headerName: 'Name', width: 180 },
  { field: 'email', headerName: 'Email', width: 300 },
  { field: 'age', headerName: 'Age', type: 'number', width: 110 },
  { field: 'roll', headerName: 'Role', width: 160 },
  { field: 'companyname', headerName: 'Company', width: 200 },
  {
    field: '',
    headerName: '',
    width: 200,
    renderCell: (params) => (
      <div>
        <Button onClick={() => handleSendMail(params.row._id)}>
          <SendIcon />
        </Button>
        <Button onClick={() => handleExportData(params.row._id)}>
          <FileDownloadIcon />
        </Button>
      </div>
    ),
  },
];


export default function DataTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    fetch('http://localhost:3100/getuserlist')
      .then((response) => response.json())
      .then((data) => {
        if (data && data.data) {
          setRows(data.data.map((user, index) => ({ id: index + 1, ...user })));
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  return (
    <div style={{ height: '100vh', width: '100%', backgroundColor:"white" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        checkboxSelection
        disableSelectionOnClick
      />
      <ToastContainer />
    </div>
  );
}