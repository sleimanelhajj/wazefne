import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Wazefne API",
      version: "1.0.0",
      description: "Wazefne backend API documentation",
    },
    servers: [
      {
        url: "http://localhost:{port}",
        variables: {
          port: { default: "3000" },
        },
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // When running with ts-node (dev), look at src; when running compiled (prod), look at dist
  apis: ["./src/routes/*.ts", "./dist/src/routes/*.js", "./src/routes/**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
