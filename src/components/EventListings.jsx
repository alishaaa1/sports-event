import React, { useCallback, useEffect, useMemo, useState } from "react";
// import Loader from "./Loader";
//import ErrorFallback from "./ErrorFallback";
import { Container, EventsContainer, SelectedEventsContainer } from "./Layout";
import SearchAndFilter from "./SearchAndFilter";
import EventCard from "./EventCard";
import { Circles } from 'react-loader-spinner';

const EventListings = () =>{
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("");
    //const [page, setPage] = useState(1);
    //const [totalPages, setTotalPages] = useState(3);

    const cacheDataInSessionStorage = (key, data, expirationTimeInMinutes) => {
        const cacheEntry = {
          data,
          expiration: Date.now() + expirationTimeInMinutes * 60 * 1000, // Store expiration timestamp
        };
        sessionStorage.setItem(key, JSON.stringify(cacheEntry));
      };  

      const getCachedDataFromSessionStorage = (key) => {
        const cachedData = sessionStorage.getItem(key);
        if (!cachedData) return null;
      
        const { data, expiration } = JSON.parse(cachedData);
        if (Date.now() > expiration) {
          console.log('Cache expired.');
          sessionStorage.removeItem(key); // Remove expired data
          return null;
        }
        return data; // Return the data if it's still valid
      };
      
    useEffect(()=>{
         // Usage: Retrieve the cached data and check if expired
        const cachedData = getCachedDataFromSessionStorage("events");
        if(cachedData) setEvents(cachedData);
        else{
        setLoading(true);
        setError(null);
        fetch('https://run.mocky.io/v3/47844f0d-e958-459a-b50e-b65f7d6783e5')
        .then((response)=>{
            if (!response.ok) {
                if (response.status >= 400 && response.status < 500) {
                  throw new Error(`Client Error ${response.status}: ${response.statusText}`);
                } else if (response.status >= 500) {
                  throw new Error(`Server Error ${response.status}: ${response.statusText}`);
                }
            }
            return response.json();
        })
        .then((data)=>{
            if (!data || !data.events || !Array.isArray(data.events)) {
                throw new Error("Malformed response: missing events");
              }      
            cacheDataInSessionStorage("events", data.events, 60);
            setEvents(data.events);
            setError(null);
        })
        .catch((error)=>{
            if (error.name === 'TypeError') {
                setError('Network error: Unable to reach the API. Please check your internet connection.');
              } else {
                setError(error.message);
              }
              console.error("Error fetching events:", error);
        })
        .finally(()=>{
            setLoading(false);
        })
    }
    },[]);

    const isTimeConflict = useCallback(
        (newEvent) => {
          const newEventStart = new Date(newEvent.start_time);
          const newEventEnd = new Date(newEvent.end_time);
    
          // Loop through selected events to check for conflicts
          for (const event of selectedEvents) {
            const eventStart = new Date(event.start_time);
            const eventEnd = new Date(event.end_time);
    
            // Check if the new event conflicts with an already selected event
            if (newEventStart < eventEnd && newEventEnd > eventStart) {
              return true; // Conflict found
            }
          }
          return false; // No conflict
        },
        [selectedEvents] // Recalculate only when selectedEvents change
      );

    const selectEvent = useCallback((item) =>{
        if(selectedEvents.length<3 && !isTimeConflict(item)){
            setSelectedEvents([...selectedEvents,item]);
        }
    },[selectedEvents, isTimeConflict]);

    const groupSelectedEvents = useMemo(()=>{
        return selectedEvents.reduce((group,event)=>{
            const category = event.event_category;
            if(!group[category]){
                group[category] = [];
            }
            group[category].push(event);
            return group;
        },{})
    },[selectedEvents]);

    const filteredEvents = useMemo(()=>{
        let filteredData = events;
        if(searchTerm){
            filteredData = filteredData.filter((event)=>event.event_name.toLowerCase().includes(searchTerm.toLocaleLowerCase()));
        }
        if(category){
            filteredData = filteredData.filter((event)=>event.event_category===category);
        }
        return filteredData;
    },[searchTerm,events, category]);
    
    if(loading) return (
        <div className="loader">
        <Circles
          height="80"
          width="80"
          color="blue"
          ariaLabel="loading"
        />
      </div>
    );

    if(error) {
        console.log(`${error.message}`)
        return (
            <div style={{ color: 'red', padding: '20px', border: '1px solid red', borderRadius: '5px' }}>
                <h2>Oops! Something went wrong.</h2>
                <p>{error.message}</p>
            </div>
        )
    };

    const deSelectEvent = (event) =>{
        setSelectedEvents(selectedEvents.filter((e)=>e.id!==event.id));
    }

    // const handlePreviousPage = () =>{
    //     if(page>1) setPage(page-1);
    // }

    // const handleNextPage = () =>{
    //     if(page<totalPages) setPage(page+1);
    // }

    return (
        <Container>
            <EventsContainer>
            <h3>All Events</h3>
            <SearchAndFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                category = {category}
                setCategory = {setCategory}
                events = {events}
            />
                {filteredEvents.length>0 ? 
                    filteredEvents.map((event) => {
                        const conflict = isTimeConflict(event);
                        const disabledButton = conflict || selectedEvents.length>=3;
                        const tooltipMessage = conflict ? "Time conflict with another event" : selectedEvents.length>=3 ? "You can only select upto 3 events" : "Select event"
                        return (
                            <EventCard event={event} title={tooltipMessage} disabled={disabledButton} onSelect={selectEvent} buttonTitle="Select"/>
                        );
                    }) : (
                    <p>No filtered events! </p>
                )}

                {/* <div>
                    <Button onClick={handlePreviousPage} disabled={page === 1}>
                        Previous 
                    </Button>
                    <span>Page {page} of {totalPages}</span>
                    <Button onClick={handleNextPage} disabled={page === totalPages}>
                        Next
                    </Button>     
                </div> */}
            </EventsContainer>
            {Object.keys(groupSelectedEvents).length > 0 && (
                <SelectedEventsContainer>
                    <h3>Selected Events by Category</h3>
                    {Object.keys(groupSelectedEvents).map((category) => (
                        <div role="region" aria-live="polite" key={category}>
                            <h4>{category}</h4>
                            {groupSelectedEvents[category].map((event) => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    title="De-select event"
                                    onSelect={deSelectEvent}
                                    buttonTitle="Deselect"
                                />
                            ))}
                        </div>
                    ))}
                </SelectedEventsContainer>
            )}
        </Container>
    )
}

export default EventListings;