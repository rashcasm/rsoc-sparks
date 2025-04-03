import React, { useState } from 'react';
import './Urlfetch.css';

const Urlfetch = () => {
    const [repoUrl, setRepoUrl] = useState('');
    const [repoDetails, setRepoDetails] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (event) => {
        setRepoUrl(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setRepoDetails(null);
        setLoading(true);

        try {
            const repoPath = extractRepoPath(repoUrl);
            if (!repoPath) {
                setError('Invalid GitHub repository URL.');
                setLoading(false);
                return;
            }

            const repoData = await fetchRepoDetails(repoPath);
            const contributors = await fetchContributors(repoPath);
            const issueTrends = await fetchIssueTrends(repoPath);

            setRepoDetails({
                ...repoData,
                contributors,
                issueTrends,
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch repository details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const extractRepoPath = (url) => {
        const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
        return match ? match[1] : null;
    };

    const fetchRepoDetails = async (repoPath) => {
        const response = await fetch(`https://api.github.com/repos/${repoPath}`);
        if (!response.ok) throw new Error('Failed to fetch repository details.');
        const data = await response.json();
        return {
            name: data.name,
            owner: data.owner?.login,
            description: data.description || 'No description available.',
            visibility: data.visibility,
            stars: data.stargazers_count || 0,
            forks: data.forks_count || 0,
            openIssues: data.open_issues_count || 0,
            watchers: data.watchers_count || 0,
            cloneUrl: data.clone_url,
            lastUpdated: new Date(data.updated_at).toLocaleString(),
        };
    };

    const fetchContributors = async (repoPath) => {
        const response = await fetch(`https://api.github.com/repos/${repoPath}/contributors`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.slice(0, 5).map(contributor => ({
            name: contributor.login,
            avatar: contributor.avatar_url,
            profile: contributor.html_url,
            commits: contributor.contributions || 0,
        }));
    };

    const fetchIssueTrends = async (repoPath) => {
        const response = await fetch(`https://api.github.com/repos/${repoPath}/issues?state=all&per_page=100`);
        if (!response.ok) return { opened: {}, closed: {} };
        const data = await response.json();
        return data.reduce((acc, issue) => {
            const createdMonth = issue.created_at.slice(0, 7);
            const closedMonth = issue.closed_at ? issue.closed_at.slice(0, 7) : null;
            acc.opened[createdMonth] = (acc.opened[createdMonth] || 0) + 1;
            if (closedMonth) acc.closed[closedMonth] = (acc.closed[closedMonth] || 0) + 1;
            return acc;
        }, { opened: {}, closed: {} });
    };

    return (
        <div className="container">
            <form onSubmit={handleSubmit} className="form">
                <input type="text" value={repoUrl} onChange={handleInputChange} placeholder="Enter GitHub Repo URL" required className="input"/>
                <button type="submit" className="button" disabled={loading}>{loading ? 'Loading...' : 'Fetch Details'}</button>
            </form>

            {error && <p className="error">{error}</p>}

            {repoDetails && (
                <div className="repo-details">
                    <h2>{repoDetails.name} ({repoDetails.visibility})</h2>
                    <p>Owner: {repoDetails.owner}</p>
                    <p>{repoDetails.description}</p>
                    <p>⭐ Stars: {repoDetails.stars} | 🍴 Forks: {repoDetails.forks} | 👀 Watchers: {repoDetails.watchers} | 🛠 Open Issues: {repoDetails.openIssues}</p>
                    <p>Last Updated: {repoDetails.lastUpdated}</p>
                    <p><a href={repoDetails.cloneUrl} target="_blank" rel="noopener noreferrer">Clone Repository</a></p>
                    
                    <h3>Top Contributors</h3>
                    {repoDetails.contributors.length > 0 ? (
                        <ul className="contributors">
                            {repoDetails.contributors.map(contributor => (
                                <li key={contributor.name} className="contributor">
                                    <img src={contributor.avatar} alt={contributor.name} className="avatar"/>
                                    <a href={contributor.profile} target="_blank" rel="noopener noreferrer">{contributor.name}</a> ({contributor.commits} commits)
                                </li>
                            ))}
                        </ul>
                    ) : <p>No contributors found.</p>}
                    
                    <h3>Issue Trends</h3>
                    <h4>Opened Issues</h4>
                    <ul>
                        {Object.entries(repoDetails.issueTrends.opened).map(([month, count]) => (
                            <li key={month}>{month}: {count} issues</li>
                        ))}
                    </ul>
                    <h4>Closed Issues</h4>
                    <ul>
                        {Object.entries(repoDetails.issueTrends.closed).map(([month, count]) => (
                            <li key={month}>{month}: {count} issues</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Urlfetch;
