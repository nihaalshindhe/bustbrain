module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
    },
    transformIgnorePatterns: [
        "./node_modules/(?!axios)/"
    ],
    moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
};