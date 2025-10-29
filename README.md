# Market Intelligence Prototype

A React-based web application for visualizing and analyzing competitor markets for higher education institutions. This prototype demonstrates how colleges can assemble and analyze lists of competitor schools organized by strategic themes.

## Overview

This application helps colleges understand their competitive landscape by:
- Grouping competitor schools into meaningful market segments
- Visualizing competitor locations on an interactive map
- Providing detailed analysis with similarity scores and institutional data
- Presenting data in both visual and tabular formats

**Example Client:** University of Tulsa

## Features

### 🗺️ Interactive Map View
- **Dynamic competitor visualization** with colored map pins
- **Radio filter sidebar** to view different competitor markets
- **Automatic zoom/bounds adjustment** based on selected market
- **School name labels** on map markers
- **Detailed market descriptions** explaining each competitor segment
- **Similarity scores** showing market relevance

### 📊 Summary Analysis
- **Comprehensive data tables** with competitor information
- **Priority-based ordering** using similarity scores
- **Detailed metrics** including:
  - State and institution type
  - Religious affiliation
  - Acceptance rates
  - Niche grades
  - Similarity scores
- **Market insights** with contextual descriptions

### 🎨 Brand Integration
- Custom color palette with primary (#009266) and accent colors
- Fraunces serif font for headings
- Source Sans 3 for body text
- Niche logo integration
- Consistent design system throughout

## Tech Stack

- **React 18.2.0** - UI framework
- **TypeScript 5.2.2** - Type safety
- **React Router DOM 6.16.0** - Client-side routing
- **Leaflet 1.9.4 + React Leaflet 4.2.1** - Interactive maps
- **Vite 4.4.5** - Build tool and dev server
- **CSS Variables** - Theming system

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd market-intelligence-prototype
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173` (or the port shown in terminal)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
market-intelligence-prototype/
├── public/
│   ├── images/
│   │   ├── Niche Logo Green.png
│   │   └── Niche Logo White.png
│   └── university-of-tulsa-data.csv
├── src/
│   ├── components/
│   │   ├── Login.tsx/css          # Authentication page
│   │   ├── Navigation.tsx/css     # Top navigation bar
│   │   ├── MapView.tsx/css        # Interactive map view
│   │   └── Summary.tsx/css        # Data summary tables
│   ├── App.tsx                    # Main app with routing
│   ├── index.css                  # Global styles & CSS variables
│   └── main.tsx                   # Application entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Data Structure

The application uses CSV data with the following fields:
- **Category** - Competitor market segment name
- **Description** - Market segment explanation
- **Rank** - Priority ranking within market
- **School Name** - Institution name
- **Similarity Score** - Computed similarity to base institution
- **State** - Geographic location
- **Type** - Public/Private designation
- **Religion** - Religious affiliation (if applicable)
- **Acceptance Rate** - Admission selectivity
- **Niche Grade** - Overall institutional grade

## Competitor Markets

The prototype organizes competitors into five strategic markets (for University of Tulsa):

1. **Regional Powerhouses** - Major South-Central universities competing for regional students
2. **Faith-Based Alternatives** - Religiously-affiliated institutions with strong academic programs
3. **Elite National Universities** - Prestigious selective institutions
4. **In-State Access Points** - Oklahoma public universities providing accessible options
5. **Selective Private Competitors** - Competitive private colleges in adjacent regions

Markets are ordered by average similarity score, with higher priority markets appearing first.

## Authentication

The login page accepts any credentials (simulated authentication for prototype purposes):
- Navigate to `/login` to access the authentication page
- Enter any email and password to proceed to the application

## Routes

- `/login` - Authentication page
- `/app` - Interactive map view with competitor markets
- `/summary` - Detailed data tables and analysis

## Brand Colors

- **Primary:** #009266
- **Secondary:** #00DF8B
- **Background:** #FBF5F2
- **Link:** #346DC2
- **Accent Colors:** #835000, #FF9B00, #FB5A00, #FF90E7, #8CA6FF

## Development Notes

- The application uses React's strict mode for development
- Map bounds automatically adjust when changing competitor market filters
- Competitor locations are hardcoded in `MapView.tsx` and should be updated when adding new institutions
- CSV parsing handles the University of Tulsa data format

## Future Enhancements

Potential areas for expansion:
- Multi-institution support beyond University of Tulsa
- User-customizable competitor markets
- Export functionality for reports
- Additional data visualization options
- Real-time data updates
- Advanced filtering and search capabilities

## License

This is a prototype application developed for demonstration purposes.

## Contact

For questions or feedback about this prototype, please contact the development team.
