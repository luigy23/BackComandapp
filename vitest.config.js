import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Patrones de búsqueda de archivos de prueba
        include: [
            '**/*.{test,spec}.{js,jsx,ts,tsx}',
            '**/__tests__/**/*.{js,jsx,ts,tsx}'
        ],
        // Excluir node_modules y archivos de build
        exclude: [
            'node_modules',
            'dist',
            '.git',
            'coverage'
        ],
        // Configuración de cobertura
        coverage: {
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                '**/*.test.js',
                '**/*.spec.js',
                '**/__tests__/**'
            ]
        }
    }
}); 