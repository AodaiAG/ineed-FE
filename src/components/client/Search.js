import React, { useState } from 'react';

function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = async () => {
        const res = await fetch(`/api/search?query=${query}`);
        const data = await res.json();
        setResults(data.results);
    };

    return (
        <div>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={handleSearch}>Search</button>
            <ul>
                {results.map(result => <li key={result.id}>{result.name}</li>)}
            </ul>
        </div>
    );
}

export default Search;
