declare module 'swagger-jsdoc' {
  interface SwaggerJSDocOptions {
    definition: any;
    apis?: string[];
  }

  function swaggerJSDoc(options: SwaggerJSDocOptions): any;

  export = swaggerJSDoc;
}
