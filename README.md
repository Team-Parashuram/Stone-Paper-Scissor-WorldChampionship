# ThrowDown - Stone Paper Scissors Championship Tracker 🏆

A full-stack web application for managing competitive Stone Paper Scissors tournaments with professional ELO-based rankings, real-time match tracking, and comprehensive player statistics.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Go](https://img.shields.io/badge/Go-1.21+-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4)

## 🎯 Overview

ThrowDown is a professional championship tracking system that brings competitive integrity to Stone Paper Scissors. Built with Next.js 16 and Go Fiber, it features a chess-style ELO rating system, role-based authentication, and real-time statistics.

**Live Demo:** [Your deployment URL]

## ✨ Features

### For Players & Spectators
- 🏅 **Global Leaderboard** - Real-time rankings with ELO ratings
- 📊 **Player Profiles** - Detailed stats, match history, and performance analytics
- 📈 **Live Feed** - Recent match results with visual indicators
- 🔍 **Player Search** - Find and track your favorite competitors
- 📖 **Rules & Documentation** - Complete championship guidelines

### For Administrators
- 🎮 **Match Recording** - Create matches with automatic ELO calculation
- 🔮 **Win Prediction** - AI-powered match outcome predictions based on ELO
- 👥 **Player Management** - Create and manage player profiles
- 🔐 **Role-Based Access** - Super Admin and Admin roles with permissions
- 📝 **Match History** - View and manage all recorded matches

### Technical Features
- ⚡ **Chess-Style ELO System** - Dynamic K-factor based on player experience
- 🎯 **Score Factor Calculation** - Match dominance affects rating changes
- 🔄 **ELO Reversal** - Delete matches to revert rating changes
- 🔒 **JWT Authentication** - Secure admin access with token-based auth
- 📱 **Responsive Design** - Mobile-first, professional UI

## 🎮 How It Works

### ELO Rating System

ThrowDown uses a sophisticated ELO system adapted from chess:

1. **Starting Rating**: All players begin at 1000 ELO
2. **K-Factor** (Rating Volatility):
   - New players (0-9 matches): K = 40 (high volatility)
   - Intermediate (10-29 matches): K = 32
   - Experienced (30+ matches): K = 16 (stable ratings)

3. **Score Factor** (Match Dominance):
   - Close matches (60-70% win): Smaller ELO changes
   - Dominant wins (80%+ win): Larger ELO changes

4. **Expected Score Formula**:
   ```
   E = 1 / (1 + 10^((OpponentElo - PlayerElo) / 400))
   ```

### Authentication Flow

- **Super Admin**: First admin account, can create other admins
- **Admin**: Can record matches and manage players
- **Public**: Read-only access to leaderboards and stats

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling

### Backend
- **Go 1.21+** - Backend language
- **Fiber v2** - Web framework
- **GORM** - ORM for database operations
- **PostgreSQL** - Production database
- **JWT** - Authentication

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.
