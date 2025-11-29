const dev = Object.freeze({
  //apiUrl: "https://iness-backend.azurewebsites.net",
  apiUrl: "http://172.20.10.5:7071",
});

// export const config = process.env.NODE_ENV === "development" ? dev : prod;
export const config = dev;
