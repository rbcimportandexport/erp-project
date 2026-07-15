const run = async () => {
  try {
    // 1. Login
    console.log("Logging in...");
    const loginRes = await fetch("http://localhost:5001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "inquiryrbcimport@gmail.com",
        password: "Admin@12345"
      })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.data?.token || loginData.token;

    // 2. Fetch HSN codes with search=" 61 "
    console.log("Fetching /api/hsn?source=ICEGATE&search=%2061%20...");
    const hsnRes = await fetch("http://localhost:5001/api/hsn?source=ICEGATE&search=%2061%20&page=1&limit=10", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const hsnData = await hsnRes.json();
    const resData = hsnData.data || hsnData;
    console.log("Total records returned:", resData.total);
    console.log("Items list size:", resData.items?.length);
    resData.items?.forEach((item) => {
      console.log(`- Code: ${item.code}, Description: ${item.description}`);
    });

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

run();
