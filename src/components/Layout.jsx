// src/components/Layout.js
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  padding: 1rem;
  flex-direction: column;

  @media (min-width: 786px){
    flex-direction: row;
  }
`;

export const EventsContainer = styled.div`
  flex: 1.5;
  margin-right: 1rem;
`;

export const SelectedEventsContainer = styled.div`
    margin-top: 1rem;
    flex:1;
    @media (min-width: 768px) {
    margin-top: 0;
  }
`;

export const EventCardStyle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  &:hover {
    background-color: #ececec;
  }

  div {
    /* Title */
    &:nth-child(1) {
      flex: 1; /* This will make the title take more space */
      min-width: 0; /* Prevents the content from overflowing */
    }

    /* Category */
    &:nth-child(2) {
      flex: 1; /* This will make the category take less space */
      min-width: 0; /* Prevents the content from overflowing */
    }

    /* Time */
    &:nth-child(3) {
      flex: 2; /* This will make the time take less space */
      min-width: 0; /* Prevents the content from overflowing */
    }
  }

  @media(min-width: 768px) {
    flex-direction: row;
  }
`;

export const Button = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  &:disabled {
    background-color: grey;
    cursor: not-allowed;
  }
`;
