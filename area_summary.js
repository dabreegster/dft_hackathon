var prevChart = null;

export function makeChartsCon(sub) {
  const subcar = [
    sub.overall_car,
    sub.Business_car,
    sub.Education_car,
    sub.Shopping_car,
    sub.Visit_friends_at_private_home_car,
    sub.Entertain_public_activity_car,
  ];

  const subwalk = [
    sub.overall_walk,
    sub.Business_walk,
    sub.Education_walk,
    sub.Shopping_walk,
    sub.Visit_friends_at_private_home_walk,
    sub.Entertain_public_activity_walk,
  ];

  const subcycle = [
    sub.overall_cycling,
    sub.Business_cycling,
    sub.Education_cycling,
    sub.Shopping_cycling,
    sub.Visit_friends_at_private_home_cycling,
    sub.Entertain_public_activity_cycling,
  ];

  const subpt = [
    sub.overall_pt,
    sub.Business_pt,
    sub.Education_pt,
    sub.Shopping_pt,
    sub.Visit_friends_at_private_home_pt,
    sub.Entertain_public_activity_pt,
  ];

  const conctx = document.getElementById("conChart").getContext("2d");

  if (prevChart != null) {
    prevChart.destroy();
  }

  prevChart = new Chart(conctx, {
    type: "bar",
    data: {
      labels: [
        "Overall",
        "Business",
        "Education",
        "Shopping",
        "Friends",
        "Entertainment",
      ],
      datasets: [
        {
          label: "Car",
          data: subcar,
          backgroundColor: "rgba(255, 99, 132, 0.8)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Walk",
          data: subwalk,
          backgroundColor: "rgba(132, 99, 255, 0.8)",
          borderColor: "rgba(132, 99, 255, 1)",
          borderWidth: 1,
        },
        {
          label: "Bicycle",
          data: subcycle,
          backgroundColor: "rgba(99, 255, 13, 0.8)",
          borderColor: "rgba(99, 255, 13, 1)",
          borderWidth: 1,
        },
        {
          label: "Public Transport",
          data: subpt,
          backgroundColor: "rgba(152,78,163, 0.8)",
          borderColor: "rgba(152,78,163, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      legend: { position: "bottom" },
      scales: {
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Connectivity Score",
            },
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}
