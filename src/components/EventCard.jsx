import React from 'react';
import { Button, EventCardStyle } from "./Layout";

const EventCard = React.memo(({ event, onSelect, disabled,title, buttonTitle }) => {
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
      <div><h3>{event.event_name}</h3></div>
      <div><p>Category: {event.event_category}</p></div>
      <div>
        <p>
            Time: {formatToReadableDate(event.start_time)} - {formatToReadableDate(event.end_time)}
        </p>
      </div>
      <Button
        tabIndex="0"
        aria-label={buttonTitle}
        onClick={() => onSelect(event)}
        disabled={disabled}
        title={title}
      >
        {buttonTitle}
      </Button>
    </EventCardStyle>
  );
});

export default EventCard;