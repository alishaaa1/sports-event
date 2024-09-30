import React, { useMemo } from "react";
import styled from "styled-components";

const SearchInput = styled.input`
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 4px;
    margin-right: 1rem;
`;

const FilterSelect = styled.select`
    padding: 0.5rem;
    margin-bottom: 1rem;
    border-radius: 4px;
`;

const SearchAndFilter = ({searchTerm, setSearchTerm, category, setCategory, events}) =>{
    const handleChange = (e) =>{
        setSearchTerm(e.target.value);
    }
    const handleFilterChange = (e) =>{
        setCategory(e.target.value);
    }

    const categories = useMemo(() => { return Array.from(new Set(events.map((event) => event.event_category)));
    },[events]);

    return(
        <div>
            <label htmlFor="search-events">Search Events</label>
            <SearchInput 
                id = "search-events"
                type="text"
                placeholder="Search events"
                aria-label="Search for events"
                value={searchTerm}
                onChange={handleChange}
                aria-labelledby="search-events"
            /> 
            <label htmlFor="category-filter">Filter by category</label>
            <FilterSelect
                id="category-filter"
                aria-label="Filter by category"
                value={category}
                onChange={handleFilterChange}
            >
                <option value="">All Categories</option>
                {categories.map((category,id)=>(
                    <option key = {id} value={category}>
                        {category}
                    </option>
                ))}
            </FilterSelect>     
        </div>
    )
}

export default SearchAndFilter;