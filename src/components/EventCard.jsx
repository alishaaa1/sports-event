import React from 'react';
import { Button, EventCardStyle } from "./Layout";

const EventCard = React.memo(({ event, onSelect, disabled,title, selectedEvents }) => {
    const formatToReadableDate = (dateString) =>{
        const date = new Date(dateString);
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        }
        return date.toLocaleString("en-US", options);
    }

  return (
    <EventCardStyle>
      <h3>{event.event_name}</h3>
      <p>Category: {event.event_category}</p>
      <p>
        Time: {formatToReadableDate(event.start_time)} - {formatToReadableDate(event.end_time)}
      </p>
      <Button
        onClick={() => onSelect(event)}
        disabled={disabled}
        title={title}
      >
        {selectedEvents && selectedEvents.indexOf(event)!==-1 ? 'Deselect' : 'Select'}
      </Button>
    </EventCardStyle>
  );
});

export default EventCard;