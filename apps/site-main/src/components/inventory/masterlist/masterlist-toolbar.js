import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Badge,
  Box,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Stack,
  SvgIcon,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { GridSearchIcon } from '@mui/x-data-grid';

export const MasterlistToolbar = ({ handleSearch }) => {
  return (
    <Box>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          m: -1,
        }}
      >
        <Typography sx={{ m: 1 }} variant="h4">
          Masterlist
        </Typography>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                m: -1,
              }}
            >
              <Stack direction="row" spacing={1}>
                <TextField
                  sx={{ width: 500 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SvgIcon fontSize="small" color="action">
                          <GridSearchIcon />
                        </SvgIcon>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Search masterlist"
                  variant="outlined"
                  type="search"
                  onChange={handleSearch}
                />
              </Stack>

              {/* <Box sx={{ m: 1 }}>
                <Tooltip title={`Create Warehouse Entry`}>
                  <IconButton
                    color="primary"
                    onClick={() => {
                      handleClickOpen();
                    }}
                    sx={{ mr: 1 }}
                  >
                    <AddBoxIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={'Delete Warehouse Entry (Single/Multiple)'}>
                  <IconButton
                    disabled={disabled}
                    color="error"
                    onClick={handleConfirmDialogOpen}
                  >
                    <Badge badgeContent={numWarehouse} color="error">
                      <DeleteIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </Box> */}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
