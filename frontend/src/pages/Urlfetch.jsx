import React, { useState } from 'react';

const Urlfetch = () => {
    const [repoUrl, setRepoUrl] = useState('');

    const handleInputChange = (event) => {
        setRepoUrl(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Handle the submission of the repository URL
        console.log('Submitted URL:', repoUrl);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={repoUrl}
                onChange={handleInputChange}
                placeholder="Enter GitHub Repository URL"
                required
            />
            <button type="submit">Submit</button>
        </form>
    );
};

export default Urlfetch;