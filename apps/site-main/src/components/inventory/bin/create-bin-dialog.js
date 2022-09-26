import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  useTheme,
  Box,
  Typography,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';

export const CreateBinDialog = ({ open, setOpen, addBin, handleAlertOpen }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  //User organisation Id
  const user = JSON.parse(localStorage.getItem('user'));
  const organisationId = user.organisation.id;

  //Error handling
  const [error, setError] = useState('');

  //Handle dialog close from child dialog
  const handleDialogClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  //Handle Formik submission
  const handleOnSubmit = async () => {
    const response = await fetch('http://localhost:3000/api/bins', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        warehouseId: formik.values.warehouseId,
        name: formik.values.name,
        capacity: formik.values.capacity,
      }),
    });

    if (response.status === 200 || response.status === 201) {
      const result = await response.json();

      addBin(result);
      handleAlertOpen(`Created Bin ${result.id} successfully`);
      setError('');
      handleDialogClose();
    } else {
      const result = await response.json();
      setError(result.message);
    }
  };

  const formik = useFormik({
    initialValues: {
      warehouseId: '',
      name: '',
      capacity: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(1, 'Name must be at least be 1 character long')
        .max(50, 'Name can at most be 50 characters long')
        .required('Name is required'),
      warehouseId: Yup.string()
        .min(1, 'Warehouse ID must be at least be 1 character long')
        .max(50, 'Warehouse ID can at most be 50 characters long')
        .required('Warehouse ID is required'),
      capacity: Yup.number().required('Capacity is required'),
    }),
    onSubmit: handleOnSubmit,
  });

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={handleDialogClose}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle id="responsive-dialog-title">{'Create Bin'}</DialogTitle>
      <DialogContent>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            error={Boolean(
              formik.touched.warehouseId && formik.errors.warehouseId
            )}
            fullWidth
            helperText={formik.touched.warehouseId && formik.errors.warehouseId}
            label="Warehouse ID"
            margin="normal"
            name="warehouseId"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.warehouseId}
            variant="outlined"
            size="small"
          />
          <TextField
            error={Boolean(formik.touched.name && formik.errors.name)}
            fullWidth
            helperText={formik.touched.name && formik.errors.name}
            label="Name"
            margin="normal"
            name="name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.name}
            variant="outlined"
            size="small"
          />
          <TextField
            error={Boolean(formik.touched.capacity && formik.errors.capacity)}
            fullWidth
            helperText={formik.touched.capacity && formik.errors.capacity}
            label="Capacity"
            margin="normal"
            name="capacity"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.capacity}
            variant="outlined"
            size="small"
          />
          <Typography variant="body1" color="red">
            {error}
          </Typography>

          <Box
            mt={1}
            mb={1}
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Button autoFocus onClick={handleDialogClose}>
              Back
            </Button>
            <Button
              color="primary"
              disabled={formik.isSubmitting}
              size="large"
              type="submit"
              variant="contained"
            >
              Create Bin
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};
