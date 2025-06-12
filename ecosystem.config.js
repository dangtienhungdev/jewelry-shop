module.exports = {
  apps: [
    {
      name: 'jewelry-shop',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 27980,
        MONGODB_URI: 'mongodb+srv://dangtienhungdev:Htm%4023624@jewelry-shop.v2r4ocu.mongodb.net/?retryWrites=true&w=majority&appName=jewelry-shop',
        DB_NAME: 'jewelry-shop',
        SWAGGER_TITLE: 'Jewelry Shop API',
        SWAGGER_DESCRIPTION: 'Jewelry Shop API description',
        SWAGGER_VERSION: '1.0.0',
        SWAGGER_PATH: 'api-docs',
      }
    }
  ]
}