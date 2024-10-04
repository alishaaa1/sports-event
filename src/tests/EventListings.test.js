import EventListings from "../components/EventListings";
import { render,screen, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import ErrorFallback from "../components/ErrorFallback";

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
      global.fetch = jest.fn();
    });
    
      afterEach(() => {
        global.fetch.mockClear(); // Clean up the mocks after each test
      });

    test("renders events correctly", async()=>{
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: mockEvents, totalPages: 3 })
      });
        render (<EventListings/>);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        await waitFor(()=>{
            expect(screen.getByText(/Butterfly 100M/i)).toBeInTheDocument();
            expect(screen.getByText(/Backstroke 100M/i)).toBeInTheDocument();
        })
    });

    test("displays loading spinner when fetching data fro the first time", async()=>{
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: mockEvents, totalPages: 3 })
      });
        sessionStorage.clear();
        render(<EventListings/>);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        await waitFor(()=>{
            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        })
    });

    test("disables select button when there is a time conflict", async()=>{
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: mockEvents, totalPages: 3 })
      });
        render(<EventListings/>);
        const fireEventButton = await screen.findAllByText(/select/i, {selector:'button'});
        await userEvent.click(fireEventButton[0]);
        expect(fireEventButton[2]).toBeDisabled();
        expect(fireEventButton[2]).toHaveAttribute('title', 'Time conflict with another event');
    });

    test("allows selecting events", async()=>{
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: mockEvents, totalPages: 3 })
      });
        render(<EventListings/>);
        const fireEventButton = await screen.findAllByText(/select/i, {selector:'button'});
        userEvent.click(fireEventButton[0]);
        const selectedEvent = screen.getAllByText(/Butterfly 100M/i);
        expect(selectedEvent[0]).toBeInTheDocument();
    });

    test('limits selection to a maximum of 3 events', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: mockEvents, totalPages: 3 })
      });
        render(<EventListings />);
      
        // Wait for the events to be rendered
        const buttons = await screen.findAllByText(/select/i, { selector: 'button' });
      
        // Log the number of buttons and ensure we have at least 4
        console.log('Number of Select buttons:', buttons.length);
      
        // Select the first three events
        await userEvent.click(buttons[0]);
        await userEvent.click(buttons[1]);
        await userEvent.click(buttons[2]);
        await userEvent.click(buttons[3]);
      
        console.log('Buttons after selecting 3 events:', buttons);
      
        // Try selecting the fourth event
        const fifthEventButton = buttons[4];
      
        // Check that the fourth event's button is disabled
        expect(fifthEventButton).toBeDisabled();
      
        // Verify the tooltip for the fourth button
        expect(fifthEventButton).toHaveAttribute('title', 'You can only select upto 3 events');
      });
      
      test('filters events based on search and category', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ events: mockEvents, totalPages: 3 })
        });
        render(<EventListings />);
    
        // Wait for events to load
        await waitFor(() => {
            const selectedEvent = screen.getAllByText(/Butterfly 100M/i);
            expect(selectedEvent[0]).toBeInTheDocument();
        });
    
        // Search for an event (e.g., "Backstroke")
        const searchInput = screen.getByPlaceholderText(/search events/i);
          await userEvent.type(searchInput , 'Backstroke' );

    
        // Check if only the searched event is visible
        expect(screen.getByText(/Backstroke 100M/i)).toBeInTheDocument();
        expect(screen.queryByText(/Butterfly 100M/i)).not.toBeInTheDocument();
      });
});

describe('EventListings error handling', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  // Reset the fetch mock between tests
  afterEach(() => {
    fetch.mockClear();
  });

  test('displays network error message when API call fails due to network issues', async () => {
    // Simulate a network error
    fetch.mockRejectedValueOnce(new TypeError('Network error'));

    render(<EventListings/>);

    // Wait for the error message to appear
    const errorMessage = await screen.findByText(/Network error: Unable to reach the API. Please check your internet connection./i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('displays client error message for 404 Not Found', async () => {
    // Simulate a 404 error
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    render(<EventListings/>);

    // Wait for the client error message to appear
    const errorMessage = await screen.findByText(/client error 404: not found/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('displays server error message for 500 Internal Server Error', async () => {
    // Simulate a 500 error
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    render(<EventListings/>);

    // Wait for the server error message to appear
    const errorMessage = await screen.findByText(/server error 500: internal server error/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('displays invalid response error when API response is missing "events" field', async () => {
    // Simulate an invalid API response (missing "events" field)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invalidField: 'unexpected data' }),
    });

    render(<EventListings/>);

    // Wait for the invalid response structure error to appear
    const errorMessage = await screen.findByText(/Malformed response: missing events/i);
    expect(errorMessage).toBeInTheDocument();
   });
 });
