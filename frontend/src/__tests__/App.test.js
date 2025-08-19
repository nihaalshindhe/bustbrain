import { render, screen } from '@testing-library/react';
const { MemoryRouter } = require('react-router-dom');
import App from '../App';

test('renders FormBuilder at "/" route', () => {
    render(
        <MemoryRouter initialEntries={['/']}>
            <App />
        </MemoryRouter>
    );
    expect(screen.getByText(/Form Builder/i)).toBeInTheDocument();
});
