import { render, screen, fireEvent } from '@testing-library/react'
import { expect, vi } from 'vitest'
import App from '../App.jsx'

const todoItem1 = { id: 1, title: 'First todo', done: false, comments: [] };
const todoItem2 = { 
    id: 2, 
    title: 'Second todo', 
    done: false, 
    comments: [
        { id: 1, message: 'First comment' },
        { id: 2, message: 'Second comment' },
    ] 
};

const originalTodoList = [todoItem1, todoItem2];

const mockResponse = (data) => ({
    ok: true,
    json: async () => data,
});

describe('App', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders correctly', async () => {
        global.fetch.mockImplementationOnce(() =>
            mockResponse(originalTodoList)
        );

        render(<App />);

        expect(await screen.findByText('First todo')).toBeInTheDocument();
        expect(await screen.findByText('Second todo')).toBeInTheDocument();
    });

    it('toggles done on a todo item', async () => {
        const toggledTodoItem1 = { ...todoItem1, done: true };

        global.fetch
            .mockImplementationOnce(() => mockResponse(originalTodoList))
            .mockImplementationOnce(() => mockResponse(toggledTodoItem1));

        render(<App />);

        expect(await screen.findByText('First todo')).not.toHaveClass('done');

        const toggleButtons = await screen.findAllByRole('button', { name: /toggle/i });
        fireEvent.click(toggleButtons[0]);

        expect(await screen.findByText('First todo')).toHaveClass('done');

        expect(global.fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(/1\/toggle/),
            { method: 'PATCH' }
        );
    });
});