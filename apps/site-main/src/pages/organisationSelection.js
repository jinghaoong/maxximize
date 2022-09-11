import { Box, Button, Container, TextField, Typography } from '@mui/material';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
export default function organisationSelection() {
    const navigate = useNavigate()
    const formik = useFormik({
        initialValues: {
            organisation: '',
            authenticationError: ''
        },
        validationSchema: Yup.object({
        organisation: Yup
            .string()
            .max(255)
            .required(
            'Organisation Code is required')
        }),
        onSubmit: async({organisation}) => {
            //retrieve data based on the provided organisation code
            try {
                const response = await fetch(`http://localhost:3000/api/organisations/${organisation}`)
                //if organisation is found
                const result = await response.json()
                //navigate to the login page with id of the organisation
                navigate(`/login/${result.id}`)
            } catch (error) {
                formik.values.authenticationError = 'Organisation Code is invalid'
            }
            
        }
    });
    return (
        <div>
            <Box component="main"
            sx={{
            alignItems: 'center',
            display: 'flex',
            flexGrow: 1,
            minHeight: '85vh'
            }}>
                <Container maxWidth="sm">
                    <form onSubmit={formik.handleSubmit}>
                        <Box sx={{ my: 3 }}>
                            <Typography
                                color="textPrimary"
                                variant="h4"
                            >
                                MaxxiMize
                            </Typography>
                        </Box>
                        <TextField
                            error={Boolean(formik.touched.organisation && formik.errors.organisation)}
                            fullWidth
                            helperText={formik.touched.organisation && formik.errors.organisation}
                            label="Organisation Code"
                            margin="normal"
                            name="organisation"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            type="text"
                            value={formik.values.organisation}
                            variant="outlined"
                        />
                        <Typography 
                        color="red"
                        variant="subtitle2">
                        {formik.values.authenticationError}
                        </Typography>
                        <Typography 
                        color="textPrimary"
                        variant="subtitle2">
                        Forgot the organisation Code? Call us at 67467891 or Email us at maxximize@gmail.com
                        </Typography>
                        <Box sx={{ py: 2 }}>
                            <Button
                                color="primary"
                                disabled={formik.isSubmitting}
                                fullWidth
                                size="large"
                                type="submit"
                                variant="contained"
                            >
                                Enter Portal
                            </Button>
                        </Box>
                    </form>
                </Container>
            </Box>
        </div>
    )
}