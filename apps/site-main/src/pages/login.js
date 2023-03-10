import { Box, Button, Container, TextField, Typography } from '@mui/material';
import Link from '@mui/material/Link';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

async function loginUser(credentials) {
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (res.status === 201 || res.status === 200) {
    const result = await res.json();
    return result;
  } else {
    return null;
  }
}

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentOrgId = location.pathname.split('/')[2];
  const [organisation, setOrganisation] = useState({});

  useEffect(() => {
    const retrieveOrganisation = async () => {
      const res = await fetch(
        `http://localhost:3000/api/organisations/${currentOrgId}`
      );
      if (res.status === 200 || res.status === 201) {
        const result = await res.json();
        if (localStorage.getItem('user')) {
          //user is already logged in
          navigate('/', { replace: true });
        } else {
          setOrganisation(result);
        }
      } else {
        navigate('/organisationSelection', { replace: true });
      }
    };
    retrieveOrganisation();
  }, []);
  const from = location.state?.from?.pathname || '/';
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      authenticationError: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().max(255).required('Username is required'),
      password: Yup.string().max(255).required('Password is required'),
    }),
    onSubmit: async ({ username, password }) => {
      const result = await loginUser({ username, password });
      if (result) {
        //check if the user organisation belong to the same organisation as that of login landing page
        const user = await getUserFromJWT(result.access_token);
        if (user?.organisation.id === parseInt(currentOrgId)) {
          localStorage.setItem('user', JSON.stringify(user));
          formik.values.username = '';
          formik.values.password = '';
          if (user?.passwordChanged) {
            navigate(from, { replace: true });
          } else {
            navigate('/resetpassword', { replace: true });
          }
        }
      }
      formik.values.authenticationError = 'You are unauthorised';
    },
  });

  const getUserFromJWT = async (accessToken) => {
    const res = await fetch('http://localhost:3000/api/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const result = await res.json();
    const { id } = result;
    const userRes = await fetch(
      `http://localhost:3000/api/users/findUser/${id}`
    );
    const user = await userRes.json();
    return user;
  };

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{`Login | ${organisation?.name}`}</title>
        </Helmet>
      </HelmetProvider>
      <Box
        component="main"
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexGrow: 1,
          minHeight: '85vh',
        }}
      >
        <Container maxWidth="sm">
          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ my: 3 }}>
              <Typography color="textPrimary" variant="h4">
                MaxxiMize
              </Typography>
              <Typography color="textPrimary" variant="h4">
                {organisation?.name}
              </Typography>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Login
              </Typography>
            </Box>
            <TextField
              error={Boolean(formik.touched.username && formik.errors.username)}
              fullWidth
              helperText={formik.touched.username && formik.errors.username}
              label="Username"
              margin="normal"
              name="username"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="username"
              value={formik.values.username}
              variant="outlined"
            />
            <TextField
              error={Boolean(formik.touched.password && formik.errors.password)}
              fullWidth
              helperText={formik.touched.password && formik.errors.password}
              label="Password"
              margin="normal"
              name="password"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="password"
              value={formik.values.password}
              variant="outlined"
            />
            <Typography color="red" variant="subtitle2">
              {formik.values.authenticationError}
            </Typography>
            <Typography color="textPrimary" variant="subtitle2">
              Having troubles logging in? Call us at 67467891 or Email us at
              maxximize@gmail.com
            </Typography>
            <Box sx={{ py: 2 }}>
              <Button
                color="primary"
                disabled={formik.isSubmitting}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                sx={{ mb: 1 }}
              >
                Log in
              </Button>
              <Link href={`forgotpassword/${currentOrgId}`} underline="none">
                Forgot your password?
              </Link>
            </Box>
          </form>
        </Container>
      </Box>
    </>
  );
};

export default Login;
