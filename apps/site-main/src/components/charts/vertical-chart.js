import { Card, CardContent, CardHeader, Divider, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { Bar } from "react-chartjs-2";

export const VerticalChart = (props) => {
  const{ 
    dropDown,
    dateLabels,
    graphDataThisYear,
    graphDataLastYear,
    graphTitle
    }= props;
    
  const theme = useTheme();

  const data = {
    datasets: [{
        backgroundColor: '#3F51B5',
        barPercentage: 0.5,
        barThickness: 12,
        borderRadius: 4,
        categoryPercentage: 0.5,
        maxBarThickness: 10,
        label: 'This year',
        data: graphDataThisYear,
   },
   {
        backgroundColor: '#fad775',
        barPercentage: 0.5,
        barThickness: 12,
        borderRadius: 4,
        categoryPercentage: 0.5,
        data: graphDataLastYear,
        label: 'Last year',
        maxBarThickness: 10
  }
  ],
  labels: dateLabels,
};
   const options = {
    animation: false,
    cornerRadius: 20,
    layout: { padding: 0 },
    legend: { display: false },
    maintainAspectRatio: false,
    responsive: true,
    xAxes: [
      {
        ticks: {
          fontColor: theme.palette.text.secondary
        },
        gridLines: {
          display: false,
          drawBorder: false
        }
      }
    ],
    yAxes: [
      {
        ticks: {
          fontColor: theme.palette.text.secondary,
          beginAtZero: true,
          min: 0
        },
        gridLines: {
          borderDash: [2],
          borderDashOffset: [2],
          color: theme.palette.divider,
          drawBorder: false,
          zeroLineBorderDash: [2],
          zeroLineBorderDashOffset: [2],
          zeroLineColor: theme.palette.divider
        }
      }
    ],
    tooltips: {
      backgroundColor: theme.palette.background.paper,
      bodyFontColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      enabled: true,
      footerFontColor: theme.palette.text.secondary,
      intersect: false,
      mode: 'index',
      titleFontColor: theme.palette.text.primary
    }
  };

  return (
    <Card {...props}>
    
      <CardHeader
        title = {`${graphTitle}`}
        action={(
          <Box
            width={200}
          >
          {dropDown}
        </Box>
        )}
      />
         

      <Divider />
      <CardContent>
        <Box
          sx={{
            height: 400,
            position: 'relative'
          }}
        >
          <Bar
            data={data}
            options={options}
          />
        </Box>
      </CardContent>
      
    </Card>
  );
};
