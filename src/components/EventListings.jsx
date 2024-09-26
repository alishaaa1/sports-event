import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import ErrorFallback from "./ErrorFallback";
import { Button, Container, EventsContainer, SelectedEventsContainer } from "./Layout";
import SearchAndFilter from "./SearchAndFilter";
import EventCard from "./EventCard";

const API_URLS = {
    1: "https://run.mocky.io/v3/401c62ad-dc49-4aff-aced-1674c9b92e23",
    2: "https://run.mocky.io/v3/630b9928-29c3-438e-bb73-39bf1e36ccf8",
    3: "https://run.mocky.io/v3/5f06a06f-d05e-49df-870c-021035130995"
  };

const EventListings = () =>{
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(3);

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
        const cachedData = getCachedDataFromSessionStorage(`page-${page}`);
        if(cachedData) setEvents(cachedData);
        else{
        setLoading(true);
        fetch(API_URLS[page])
        .then((response)=>{
            if (!response.ok) {
                throw new Error("Network response was not ok!");
              }
            return response.json();
        })
        .then((data)=>{
            if (!data || !data.events || !Array.isArray(data.events)) {
                throw new Error("Malformed response: missing events");
              }      
            if(data && data.events){
                cacheDataInSessionStorage(`page-${page}`, data.events, 60);
                setEvents(data.events);
                setTotalPages(data.totalPages);
                setError(false);
            }else{
                throw new Error("No events available");
            }
        })
        .catch((error)=>{
            console.error('Fetch error:', error);
            setError(true);
        })
        .finally(()=>{
            setLoading(false);
        })
    }
    },[page]);

    useEffect(()=>{
        let filteredData = events;
        if(searchTerm){
            filteredData = filteredData.filter((event)=>event.event_name.toLowerCase().includes(searchTerm.toLocaleLowerCase()));
        }
        if(category){
            filteredData = filteredData.filter((event)=>event.event_category===category);
        }
        setFilteredEvents(filteredData);
    },[searchTerm,events, category]);
    
    if(loading) return <Loader/>;
    if(error) return <ErrorFallback/>;

    const selectEvent = (item) =>{
        if(selectedEvents.length<3 && !isTimeConflict(item)){
            setSelectedEvents([...selectedEvents,item]);
        }
    }

    const deSelectEvent = (event) =>{
        setSelectedEvents(selectedEvents.filter((e)=>e.id!==event.id));
    }
    
    const isTimeConflict = (newEvent) =>{
        const newEventStart = new Date(newEvent.start_time);
        const newEventEnd = new Date(newEvent.end_time);
        for (const event of selectedEvents) {
            const eventStart = new Date(event.start_time);
            const eventEnd = new Date(event.end_time);

            if(newEventStart < eventEnd && newEventEnd > eventStart){
                return true;
            }
        }
        return false;
    }

    const handlePreviousPage = () =>{
        if(page>1) setPage(page-1);
    }

    const handleNextPage = () =>{
        if(page<totalPages) setPage(page+1);
    }

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
                            <EventCard event={event} title={tooltipMessage} disabled={disabledButton} onSelect={selectEvent}/>
                        );
                    }) : (
                    <p>No filtered events! </p>
                )}

                <div>
                    <Button onClick={handlePreviousPage} disabled={page === 1}>
                        Previous 
                    </Button>
                    <span>Page {page} of {totalPages}</span>
                    <Button onClick={handleNextPage} disabled={page === totalPages}>
                        Next
                    </Button>     
                </div>
            </EventsContainer>
            <div role="status" aria-live="polite">
                {selectedEvents.length>0 &&
                    <SelectedEventsContainer>
                        <h3>Selected Events</h3>
                        {selectedEvents.map((event) => (
                            <EventCard event={event} title="De-select event" onSelect={deSelectEvent} selectedEvents={selectedEvents}/>
                        ))}
                    </SelectedEventsContainer>
                }
            </div>
        </Container>
    )
}

export default EventListings;