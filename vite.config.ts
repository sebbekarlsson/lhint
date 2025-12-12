import { defineConfig } from 'vite';
import pathlib from 'path';


export default defineConfig({
  resolve: {
    alias: {
      "#": pathlib.resolve(pathlib.join(__dirname, '.')) 
    }
  }
})
