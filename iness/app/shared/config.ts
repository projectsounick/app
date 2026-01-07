const dev = Object.freeze({
  // Production backend (deploy first if using this!)
 //apiUrl: "https://iness-app-backend.azurewebsites.net",
   
 //apiUrl: "https://iness-backend.azurewebsites.net",
  // Local development backend
 apiUrl: "http://192.168.1.53:7071",
});

// export const config = process.env.NODE_ENV === "development" ? dev : prod;
export const config = dev;
