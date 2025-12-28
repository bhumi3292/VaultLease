module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
  ],
  plugins: [
    [
      'babel-plugin-transform-import-meta',
      {
        // This will replace import.meta.env.VITE_BACKEND_URL with the mock value
        // You can add more VITE_ variables as needed
        env: {
          VITE_BACKEND_URL: 'http://localhost:3001',
        },
      },
    ],
  ],
}; 