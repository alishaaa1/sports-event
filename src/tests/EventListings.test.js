import App from "../App";
import { render,screen, fireEvent, waitFor } from "@testing-library/react";

const mockEvents = [
    {
        id: 1,
        event_name: "Butterfly 100M",
        event_category: "Swimming",
        start_time: "2022-12-17 13:00:00",
        end_time: "2022-12-17 14:00:00"
      },
      {
        id: 2,
        event_name: "Backstroke 100M",
        event_category: "Swimming",
        start_time: "2022-12-18 10:30:00",
        end_time: "2022-12-18 14:30:00"
      },
      {
        id: 3,
        event_name: "Freestyle 400M",
        event_category: "Swimming",
        start_time: "2022-12-17 13:30:00",
        end_time: "2022-12-17 16:00:00"
      },
      {
        id: 4,
        event_name: "Shot put 400M",
        event_category: "Shotput",
        start_time: "2022-12-20 13:30:00",
        end_time: "2022-12-20 16:00:00"
      },
      {
        id: 5,
        event_name: "Relay 400M",
        event_category: "Running",
        start_time: "2022-12-21 13:30:00",
        end_time: "2022-12-21 16:00:00"
      },
];

describe("Sports Events Open for Registration", ()=>{
    beforeEach(() => {
        global.fetch = jest.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ events: mockEvents }),
          })
        );
      });
    
      afterEach(() => {
        jest.clearAllMocks(); // Clean up the mocks after each test
      });
    test("renders events correctly", async()=>{
        render (<App/>);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        await waitFor(()=>{
            expect(screen.getByText(/Butterfly 100M/i)).toBeInTheDocument();
            expect(screen.getByText(/Backstroke 100M/i)).toBeInTheDocument();
        })
    });

    test("displays loading spinner when fetching data fro the first time", async()=>{
        sessionStorage.clear();
        render(<App/>);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        await waitFor(()=>{
            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        })
    });

    test("disables select button when there is a time conflict", async()=>{
        render(<App/>);
        const fireEventButton = await screen.findAllByText(/select/i, {selector:'button'});
        fireEvent.click(fireEventButton[0]);
        expect(fireEventButton[2]).toBeDisabled();
        expect(fireEventButton[2]).toHaveAttribute('title', 'Time conflict with another event');
    });

    test("allows selecting events", async()=>{
        render(<App/>);
        const fireEventButton = await screen.findAllByText(/select/i, {selector:'button'});
        fireEvent.click(fireEventButton[0]);
        const selectedEvent = screen.getAllByText(/Butterfly 100M/i);
        expect(selectedEvent[0]).toBeInTheDocument();
    });

    test('limits selection to a maximum of 3 events', async () => {
        render(<App />);
      
        // Wait for the events to be rendered
        const buttons = await screen.findAllByText(/select/i, { selector: 'button' });
      
        // Log the number of buttons and ensure we have at least 4
        console.log('Number of Select buttons:', buttons.length);
      
        // Select the first three events
        fireEvent.click(buttons[0]);
        fireEvent.click(buttons[1]);
        fireEvent.click(buttons[2]);
        fireEvent.click(buttons[3]);
      
        console.log('Buttons after selecting 3 events:', buttons);
      
        // Try selecting the fourth event
        const fifthEventButton = buttons[4];
      
        // Check that the fourth event's button is disabled
        expect(fifthEventButton).toBeDisabled();
      
        // Verify the tooltip for the fourth button
        expect(fifthEventButton).toHaveAttribute('title', 'You can only select upto 3 events');
      });
      
      test('filters events based on search and category', async () => {
        render(<App />);
    
        // Wait for events to load
        await waitFor(() => {
            const selectedEvent = screen.getAllByText(/Butterfly 100M/i);
            expect(selectedEvent[0]).toBeInTheDocument();
        });
    
        // Search for an event (e.g., "Backstroke")
        const searchInput = screen.getByPlaceholderText(/search events/i);
        fireEvent.change(searchInput, { target: { value: 'Backstroke' } });
    
        // Check if only the searched event is visible
        expect(screen.getByText(/Backstroke 100M/i)).toBeInTheDocument();
        expect(screen.queryByText(/Butterfly 100M/i)).not.toBeInTheDocument();
      });
});

// describe("Fallback aand error message in case of API or network failure",()=>{
//     afterEach(() => {
//         jest.resetAllMocks();
//     });
//     global.fetch = jest.fn(() =>
//         Promise.reject(new Error('Network error'))
//     );

//     test('shows an error message when API call fails', async () => {
//         render(<App />);
//         const errorMessage = await waitFor(()=> screen.findByText(/Oops! Something went wrong. Please try again later!/i));
//         expect(errorMessage).toBeInTheDocument();
//     });
// })
