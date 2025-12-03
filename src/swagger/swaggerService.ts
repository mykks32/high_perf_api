import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express";

export class SwaggerService {
    private readonly options = {
        definition: {
            openapi: "3.0.3",
            info: {
                title: "High-Performance API",
                version: "1.0.0",
                description: "API documentation for Data Records and Orders",
            },
            servers: [
                {
                    url: "http://localhost:8000/api",
                },
            ],
        },
        apis: ["./src/routes/**/*.ts"],
    };

    public setupSwagger(app: Application, path: string = "/api/docs") {
        const specs = swaggerJsdoc(this.options);
        app.use(path, swaggerUi.serve, swaggerUi.setup(specs));
    }
}

export const swaggerService = new SwaggerService();
