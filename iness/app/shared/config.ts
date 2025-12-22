const dev = Object.freeze({
  // Production backend (deploy first if using this!)
   apiUrl: "https://iness-backend-new-fyguf9fyf9gxh8d6.southindia-01.azurewebsites.net",
  //apiUrl: "iness-backend-new-fyguf9fyf9gxh8d6.southindia-01.azurewebsites.net",
  // Local development backend
  //apiUrl: "http://192.168.1.59:7071",
});

// export const config = process.env.NODE_ENV === "development" ? dev : prod;
export const config = dev;
