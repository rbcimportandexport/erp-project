const http = require("https");

const check = () => {
  const data = JSON.stringify({
    email: "yadavsaurabh9333@gmail.com",
    pin: "wrong_pin",
    newPassword: "NewPassword123"
  });

  const options = {
    hostname: "erp-project-nr53.onrender.com",
    path: "/api/auth/forgot-password",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    let body = "";
    res.on("data", (chunk) => body += chunk);
    res.on("end", () => {
      console.log("Response Body:", body);
    });
  });

  req.on("error", (error) => {
    console.error("Error:", error);
  });

  req.write(data);
  req.end();
};

check();
