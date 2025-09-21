# Quickstart Guide

This guide outlines the key user scenarios and acceptance criteria for the Magic: The Gathering League Tracker. These scenarios will be used to validate the application's functionality.

## User Scenarios

### Primary User Story
As a player in the Magic: The Gathering league, I want to view a public website that shows the current leaderboard, my personal match history, and overall player statistics, so that I can easily track my performance and the league's progress.

As an admin, I want to log in to a secure dashboard to manage player data, match results, and the prize pool, so that I can keep the public-facing website up-to-date.

### Acceptance Scenarios
1. **Given** a user navigates to the website, **When** they are on the homepage, **Then** they should see the league leaderboard and the current prize pool.
2. **Given** a user is viewing the leaderboard, **When** they click on a player's name, **Then** they should be taken to a page with that player's match history and stats.
3. **Given** an admin navigates to the admin login page, **When** they enter their credentials, **Then** they should be granted access to the admin dashboard.
4. **Given** an admin is in the dashboard, **When** they add a new match result, **Then** the public leaderboard and player stats should update accordingly.
5. **Given** an admin adds a new participant to an event, **When** the prize pool is viewed on the main page, **Then** it should increase by R50.
