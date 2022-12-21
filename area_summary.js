var prevChart = null;

export function makeBarChart(scores) {
  if (prevChart != null) {
    prevChart.destroy();
  }

  const forMode = (mode) => {
    return [
      "overall",
      "Business",
      "Education",
      "Shopping",
      "Visit_friends_at_private_home",
      "Entertain_public_activity",
    ].map((activity) => scores[activity + "_" + mode]);
  };

  prevChart = new Chart(
    document.getElementById("chart-contents").getContext("2d"),
    {
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
            data: forMode("car"),
            backgroundColor: "rgba(255, 99, 132, 0.8)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
          {
            label: "Walk",
            data: forMode("walk"),
            backgroundColor: "rgba(132, 99, 255, 0.8)",
            borderColor: "rgba(132, 99, 255, 1)",
            borderWidth: 1,
          },
          {
            label: "Bicycle",
            data: forMode("cycling"),
            backgroundColor: "rgba(99, 255, 13, 0.8)",
            borderColor: "rgba(99, 255, 13, 1)",
            borderWidth: 1,
          },
          {
            label: "Public Transport",
            data: forMode("pt"),
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
    }
  );
}